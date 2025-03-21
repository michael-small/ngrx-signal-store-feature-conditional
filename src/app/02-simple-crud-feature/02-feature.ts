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

// By Fabian Gosebrink: https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/

export function withCrudOperations<Entity extends BaseEntity>(
    dataServiceType: Type<CrudService<Entity>> // pass the service here
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
        },
        withMethods((store) => {
            const service = inject(dataServiceType);

            return {
                create: rxMethod<Entity>(
                    pipe(
                        switchMap((value) => {
                            patchState(store, { loading: true });

                            return service.create(value).pipe(
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
                    )
                ),

                readAll: rxMethod<void>(
                    pipe(
                        switchMap(() => {
                            patchState(store, { loading: true });

                            return service.readAll().pipe(
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
                ),

                readOne: rxMethod<number>(
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
                ),

                delete: rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.delete(item).pipe(
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
                ),

                update: rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.update(item).pipe(
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
                ),
            };
        }),
        withComputed(({ items }) => ({
            allItems: computed(() => items()),
            allItemsCount: computed(() => items().length),
        }))
    );
}