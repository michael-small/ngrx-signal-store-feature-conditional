import { Observable, pipe, switchMap } from 'rxjs';
import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withMethods, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

// The general structure/implementation of the service + CRUD methods for this example were started on top of
// - This article's example: https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/
// - And the ngrx-toolkit's `withDataService()` approach: https://ngrx-toolkit.angulararchitects.io/docs/with-data-service
// and then expanded on to make these opt-in / conditional features

// Gaurantees minimum identifier + type
export type BaseEntity = { id?: number };

// Minimum for CRUD feature
export type BaseState<Entity> = {
    selectedItem: Entity | null;
    items: Entity[];
    loading: boolean;
};

// Feature users can pick and choose what to enable
//
// This shape is obtuse but for a proof of concept whatever. Should just be able in theory to
//     do `readAll: true` OR `readAll: {method: Observable<T[]>}` OR just omit one rather than need a `read: false`
type CrudConfig<T> = {
    readAll: ((val?: any) => Observable<T[]>) | false;
    readOne: ((val?: any) => Observable<T>) | false;
    create: ((val?: any) => Observable<T>) | false;
    update: ((val?: any) => Observable<T>) | false;
    delete: ((val?: any) => Observable<T>) | false;
};

type MethodRead<T> = (val?: any) => Observable<T[]>;
type MethodReadOne<T> = (val?: any) => Observable<T>;
type MethodCreate<T> = (val?: any) => Observable<T>;
type MethodUpdate<T> = (val?: any) => Observable<T>;
type MethodDelete<T> = (val?: any) => Observable<T>;

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig<Entity>,
    Entity extends BaseEntity,
> = (Config['readAll'] extends MethodRead<Entity> ? { getAll: (val?: any) => void } : {}) &
    (Config['readOne'] extends MethodReadOne<Entity> ? { getOne: (val?: any) => void } : {}) &
    (Config['create'] extends MethodCreate<Entity> ? { create: (val?: any) => void } : {}) &
    (Config['update'] extends MethodUpdate<Entity> ? { update: (val?: any) => void } : {}) &
    (Config['delete'] extends MethodDelete<Entity> ? { delete: (val?: any) => void } : {});

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