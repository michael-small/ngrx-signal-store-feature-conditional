import { pipe, switchMap } from 'rxjs';
import { computed, inject, Type } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
    withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { BaseEntity, BaseState, CrudService } from '../shared/todos-and-store.model';

// Feature users can pick and choose what to enable
type CrudConfig = {
    create: boolean;
    readOne: boolean;
    readAll: boolean;
    delete: boolean;
    update: boolean;
};

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig,
    Entity extends BaseEntity
> = 
    (Config['create'] extends true ? { create: (value: Entity) => void } : {}) &
    (Config['readOne'] extends true
        ? { readOne: (id: number) => void }
        : {}) &  
    (Config['readAll'] extends true
        ? { readAll: () => void }
        : {}) &
    (Config['update'] extends true ? { update: (value: Entity) => void } : {}) &
    (Config['delete'] extends true ? { delete: (value: Entity) => void } : {});

export function withCrudConditional<
    Config extends CrudConfig,
    Entity extends BaseEntity
>(DataService: Type<Partial<CrudService<Entity>>>, config: Config) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
        },
        withMethods((store) => {
            const service = inject(DataService);
            // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
            const methods: Record<string, Function> = {};

            if (config.create) {
                const create = rxMethod<Entity>(
                    pipe(
                        switchMap((value) => {
                            patchState(store, { loading: true });

                            // Non null assertions (`!`) here:
                            //     Needed since `service` is a `Partial`
                            //     Not cheating since we guard w/ and `if(config.create)`
                            return service.create!(value).pipe(
                                tapResponse({
                                    next: (addedItem) => {
                                        patchState(store, {
                                            items: [...store.items(), addedItem],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    ),
                );
                methods['create'] = (value: Entity) => create(value);
            }

            if (config.delete) {
                // `delete` is a reverved word
                const d3lete = rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.delete!(item).pipe(
                                tapResponse({
                                    next: () => {
                                        patchState(store, {
                                            items: [...store.items().filter((x) => x.id !== item.id)],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                )
                methods['delete'] = (value: Entity) => d3lete(value);
            }

            if (config.readAll) {
                const readAll = rxMethod<void>(
                    pipe(
                        switchMap(() => {
                            patchState(store, { loading: true });

                            return service.readAll!().pipe(
                                tapResponse({
                                    next: (items) => {
                                        patchState(store, {
                                            items: items,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            )
                        })
                    )
                )
                methods['readAll'] = () => readAll();
            }

            if (config.readOne) {
                const readOne = rxMethod<number>(
                    pipe(
                        switchMap((id) => {
                            patchState(store, { loading: true });

                            return service.readOne!(id).pipe(
                                tapResponse({
                                    next: (item) => {
                                        patchState(store, {
                                            selectedItem: item,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            )
                        })
                    )
                )
                methods['readOne'] = (value: Entity['id']) => readOne(value);
            }

            if (config.update) {
                const update = rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.update!(item).pipe(
                                tapResponse({
                                    next: (updatedItem) => {
                                        const allItems = [...store.items()];
                                        const index = allItems.findIndex((x) => x.id === item.id);

                                        allItems[index] = updatedItem;

                                        patchState(store, {
                                            items: allItems,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                )
                methods['update'] = (value: Entity) => update(value)
            }

            /**
             * @example `methods` produced with 'create & 'delete'
             * {
             *     create: (value) => create(value),
             *     delete: (value) => d3lete(value)
             * }
             */
            // console.log(methods) // comment back in
            return methods as CrudMethods<Config, Entity>;
        }),
        withComputed(({ items }) => ({
            allItems: computed(() => items()),
        }))
    );
}