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
import { CrudService } from '../basic-conditional/basic-conditional.store.feature';

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
  read: { method: Observable<T[]> } | boolean;
};

type Method<T> = { method: Observable<T[]> };

function isCustom<T>(
  arg: { method: Observable<T[]> } | boolean
): arg is Method<T> {
  return (arg as Method<T>).method !== undefined;
}

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
  Config extends CrudConfig<Entity>,
  Entity extends BaseEntity
> = (Config['read'] extends true ? { getAll: () => void } : {}) &
  (Config['read'] extends Method<Entity> ? { getAll: () => void } : {});

export function withCrudOperations<
  Config extends CrudConfig<Entity>,
  Entity extends BaseEntity
>(config: Config, DataService?: Type<Partial<CrudService<Entity>>>) {
  return signalStoreFeature(
    {
      state: type<BaseState<Entity>>(),
    },
    withMethods((store) => {
      const methods: Record<string, Function> = {};

      const configRead = config.read;
      if (isCustom(configRead)) {
        const getAll = rxMethod<void>(
          pipe(
            switchMap(() => {
              patchState(store, { loading: true });

              return configRead.method.pipe(
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
        methods['getAll'] = () => getAll();
      } else if (!isCustom(configRead) && DataService) {
        const service = inject(DataService!);
        const getAll = rxMethod<void>(
          pipe(
            switchMap(() => {
              patchState(store, { loading: true });

              return service.getAll!().pipe(
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
        methods['getAll'] = () => getAll();
      }

      return methods as CrudMethods<Config, Entity>;
    }),
    withComputed(({ items }) => ({
      allItems: computed(() => items()),
    }))
  );
}
