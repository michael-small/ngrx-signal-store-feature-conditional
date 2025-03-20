import { Observable, pipe, switchMap } from 'rxjs';
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

// The general structure/implementation of the service + CRUD methods for this example were started on top of
// - This article's example: https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/
// - And the ngrx-toolkit's `withDataService()` approach: https://ngrx-toolkit.angulararchitects.io/docs/with-data-service
// and then expanded on to make these opt-in / conditional features

// Gaurantees minimum identifier + type
export type BaseEntity = { id: number };

// Minimum for CRUD feature
export type BaseState<Entity> = {
    selectedItem: Entity | null;
    items: Entity[];
    loading: boolean;
};

// Feature users can pick and choose what to enable
type CrudConfig = {
    create: boolean;
    readOne: boolean;
    readAll: boolean;
    delete: boolean;
    update: boolean;
};

// The users can implement a `Partial` (or to be more precise use a `Pick`)
//     of this service, provided that it matches the respective CrudConfig options.
// The feature uses non-null assertions (`!`) internally with the
//     assumption that the `CrudConfig` is valid to what the
//     implementing service offers.
export interface CrudService<T> {
    create(value: T): Observable<T>;

    readOne(id: number): Observable<T>;

    readAll(): Observable<T[]>;

    update(value: T): Observable<T>;

    delete(value: T): Observable<any>;
}

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig,
    Entity extends BaseEntity
> = (Config['create'] extends true ? { create: (value: Entity) => void } : {}) &
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
            return methods as CrudMethods<Config, Entity>;
        }),
        withComputed(({ items }) => ({
            allItems: computed(() => items()),
        }))
    );
}