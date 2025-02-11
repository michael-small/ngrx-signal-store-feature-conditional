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
  add: boolean;
  load: boolean;
  delete: boolean;
  update: boolean;
};

// The users can implement a `Partial` of this service, provided that
//     it matches the respective CrudConfig options.
// The feature uses non-null assertions (`!`) internally with the 
//     assumption that the `CrudConfig` is valid to what the 
//     implementing service offers.
export interface CrudService<T> {
  getItems(): Observable<T[]>;

  getItem(id: number): Observable<T>;

  addItem(value: T): Observable<T>;

  updateItem(value: T): Observable<T>;

  deleteItem(value: T): Observable<any>;
}

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
  Config extends CrudConfig,
  Entity extends BaseEntity
> = (Config['add'] extends true ? { add: (value: Entity) => void } : {}) &
  (Config['load'] extends true
    ? { getItem: (id: number) => void; getItems: () => void }
    : {}) &
  (Config['delete'] extends true ? { remove: (value: Entity) => void } : {}) &
  (Config['update'] extends true ? { update: (value: Entity) => void } : {});

export function withCrudOperations<
  Config extends CrudConfig,
  Entity extends BaseEntity
>(DataService: Type<Partial<CrudService<Entity>>>, config: Config) {
  return signalStoreFeature(
    {
      state: type<BaseState<Entity>>(),
    },
    withMethods((store) => {
      const service = inject(DataService);
      const methods: Record<string, Function> = {};

      if (config.add) {
        const add = rxMethod<Entity>(
          pipe(
            switchMap((value) => {
              patchState(store, { loading: true });

              return service.addItem!(value).pipe(
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
        methods['add'] = (value: Entity) => add(value);
      }

      if (config.delete) {
        // `delete` is a reverved word
        const d3lete = rxMethod<Entity>(
            pipe(
                switchMap((item) => {
                    patchState(store, { loading: true });

                    return service.deleteItem!(item).pipe(
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
        methods['remove'] = (value: Entity) => d3lete(value);
      }

      if (config.load) {
        const loadAll = rxMethod<void>(
            pipe(
                switchMap(() => {
                    patchState(store, { loading: true });

                    return service.getItems!().pipe(
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
        const load = rxMethod<number>(
            pipe(
                switchMap((id) => {
                    patchState(store, { loading: true });

                    return service.getItem!(id).pipe(
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
        methods['getItem'] = (value: Entity['id']) => load(value);
        methods['getItems'] = () => loadAll();
      }

      if (config.update) {
        const update = rxMethod<Entity>(
            pipe(
              switchMap((item) => {
                patchState(store, { loading: true });
  
                return service.updateItem!(item).pipe(
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

      return methods as CrudMethods<Config, Entity>;
    }),
    withComputed(({ items }) => ({
      allItems: computed(() => items()),
    }))
  );
}