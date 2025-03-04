import { Observable, pipe, switchMap } from 'rxjs';
import { computed } from '@angular/core';
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
//
// This shape is obtuse but for a proof of concept whatever. Should just be able in theory to
//     do `read: true` OR `read: {method: Observable<T[]>}` OR just omit one rather than need a `read: false`
type CrudConfig<T> = {
    read: { methodGetAll: Observable<T[]>, methodGetOne: (id: number) => Observable<T> } | false
    create: { method: (entity: T) => Observable<T> } | false
    update: { method: (entity: T) => Observable<T> } | false
    delete: { method: (entity: T) => Observable<T> } | false
};

type Method<T> = { methodGetAll: Observable<T[]>, methodGetOne: (id: number) => Observable<T> };
type MethodCreate<T> = { method: (entity: T) => Observable<T> };
type MethodUpdate<T> = { method: (entity: T) => Observable<T> };
type MethodDelete<T> = { method: (entity: T) => Observable<T> };

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig<Entity>,
    Entity extends BaseEntity
> = (Config['read'] extends Method<Entity> ? { getAll: () => void, getOne: (id: number) => void } : {}) &
    (Config['create'] extends MethodCreate<Entity> ? { create: (value: Entity) => void } : {}) &
    (Config['update'] extends MethodUpdate<Entity> ? { update: (value: Entity) => void } : {}) &
    (Config['delete'] extends MethodDelete<Entity> ? { delete: (value: Entity) => void } : {});

export function withCrudMappings<
    Config extends CrudConfig<Entity>,
    Entity extends BaseEntity
>(config: Config) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
        },
        withMethods((store) => {
            const methods: Record<string, Function> = {};

            const configRead = config.read;
            if (configRead) {
                const getAll = rxMethod<void>(
                    pipe(
                        switchMap(() => {
                            patchState(store, { loading: true });

                            return configRead.methodGetAll.pipe(
                                tapResponse({
                                    next: (items) => {
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
                const getOne = rxMethod<number>(
                    switchMap((id) => {
                        patchState(store, { loading: true });

                        return configRead.methodGetOne!(id).pipe(
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

                methods['getOne'] = (value: Entity['id']) => getOne(value);
                methods['getAll'] = () => getAll();
            }

            const configCreate = config.create
            if (configCreate) {
                const create = rxMethod<Entity>(
                    pipe(
                        switchMap((value) => {
                            patchState(store, { loading: true });

                            return configCreate.method(value).pipe(
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

            const configUpdate = config.update;
            if (configUpdate) {
                const update = rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return configUpdate.method(item).pipe(
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

            const configDelete = config.delete;
            if (configDelete) {
                // `delete` is a reverved word
                const d3lete = rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return configDelete.method!(item).pipe(
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

            return methods as CrudMethods<Config, Entity>;
        }),
        withComputed(({ items }) => ({
            allItems: computed(() => items()),
        }))
    );
}
