import { Observable, pipe, switchMap } from 'rxjs';
import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withMethods, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

// Gaurantees minimum identifier + type
export type BaseEntity = { id?: number };

export type BaseState<Entity> = {
    selectedItem: Entity | null;
    items: Entity[];
    loading: boolean;
};

type CrudConfig<T extends BaseEntity> = {
    readAll: ((search?: any) => Observable<T[]>) | false;
    readOne: ((val: T['id']) => Observable<T>) | false;
    create: ((val: Partial<T>) => Observable<T>) | false;
    update: ((val: Partial<T>) => Observable<T>) | false;
    delete: ((val: Partial<T>) => Observable<T>) | false;
};

type MethodRead<T> = (search?: any) => Observable<T[]>;
type MethodReadOne<T extends BaseEntity> = (val: T['id']) => Observable<T>;
type MethodCreate<T> = (val: Partial<T>) => Observable<T>;
type MethodUpdate<T> = (val: Partial<T>) => Observable<T>;
type MethodDelete<T> = (val: Partial<T>) => Observable<T>;

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig<Entity>,
    Entity extends BaseEntity,
> = (Config['readAll'] extends MethodRead<Entity> ? { getAll: (search?: any) => void } : {}) &
    (Config['readOne'] extends MethodReadOne<Entity> ? { getOne: (val: Entity['id']) => void } : {}) &
    (Config['create'] extends MethodCreate<Entity> ? { create: (val: Partial<Entity>) => void } : {}) &
    (Config['update'] extends MethodUpdate<Entity> ? { update: (val: Partial<Entity>) => void } : {}) &
    (Config['delete'] extends MethodDelete<Entity> ? { delete: (val: Partial<Entity>) => void } : {});

export function withCrudMappings<Config extends CrudConfig<Entity>, Entity extends BaseEntity>(config: Config) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
        },
        withMethods(store => {
            // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
            const methods: Record<string, Function> = {};

            const configReadAll = config.readAll;
            if (configReadAll) {
                const getAll = rxMethod<any>(
                    pipe(
                        switchMap(val => {
                            patchState(store, { loading: true });

                            return configReadAll(val).pipe(
                                tapResponse({
                                    next: items => {
                                        patchState(store, {
                                            items: items,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                );
                methods['getAll'] = (val?: any) => getAll(val);
            }

            const configReadOne = config.readOne;
            if (configReadOne) {
                const getOne = rxMethod<number>(
                    switchMap(id => {
                        patchState(store, { loading: true });

                        return configReadOne(id).pipe(
                            tapResponse({
                                next: item => {
                                    patchState(store, {
                                        selectedItem: item,
                                    });
                                },
                                error: console.error,
                                finalize: () => patchState(store, { loading: false }),
                            })
                        );
                    })
                );

                methods['getOne'] = (value: Entity['id']) => getOne(value ?? 0);
            }

            const configCreate = config.create;
            if (configCreate) {
                const create = rxMethod<Entity>(
                    pipe(
                        switchMap(value => {
                            patchState(store, { loading: true });

                            return configCreate(value).pipe(
                                tapResponse({
                                    next: addedItem => {
                                        patchState(store, {
                                            items: [...store.items(), addedItem],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                );
                methods['create'] = (value: Entity) => create(value);
            }

            const configUpdate = config.update;
            if (configUpdate) {
                const update = rxMethod<Entity>(
                    pipe(
                        switchMap(item => {
                            patchState(store, { loading: true });

                            return configUpdate(item).pipe(
                                tapResponse({
                                    next: updatedItem => {
                                        const allItems = [...store.items()];
                                        const index = allItems.findIndex(x => x.id === item.id);

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
                );
                methods['update'] = (value: Entity) => update(value);
            }

            const configDelete = config.delete;
            if (configDelete) {
                // `delete` is a reverved word
                const d3lete = rxMethod<Entity>(
                    pipe(
                        switchMap(item => {
                            patchState(store, { loading: true });

                            return configDelete(item).pipe(
                                tapResponse({
                                    next: () => {
                                        patchState(store, {
                                            items: [...store.items().filter(x => x.id !== item.id)],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                );
                methods['delete'] = (value: Entity) => d3lete(value);
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