import { Observable, pipe, switchMap } from 'rxjs';
import { computed, inject, Injector, Type } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
  withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { CrudService } from './crud.service';

export type BaseEntity = { id: string };

export interface Todo extends BaseEntity {
  value: string;
  done: boolean;
}

export type BaseState<Entity> = {
  items: Entity[];
  loading: boolean;
};

type CrudConfig = {
  add: boolean;
  load: boolean;
  delete: boolean;
  update: boolean;
};

type CrudMethods<
  Config extends CrudConfig,
  Entity extends BaseEntity
> = (Config['add'] extends true ? { add: (value: string) => void } : {}) &
  (Config['load'] extends true
    ? { getItem: (id: string) => void; getItems: () => void }
    : {}) &
  (Config['delete'] extends true ? { remove: (value: Entity) => void } : {}) &
  (Config['update'] extends true ? { update: (value: Entity) => void } : {});

export function withCrudOperations<
  Config extends CrudConfig,
  Entity extends BaseEntity
>(DataService: Type<CrudService<Entity>>, config: Config) {
  return signalStoreFeature(
    {
      state: type<BaseState<Entity>>(),
    },
    // Provided what I ran with down there is legit, this is what I am hung up on
    // I would think that it returning {} was part of the point
    withMethods((store) => {
      const conf = config;
      const service = inject(DataService);

      const methods: Record<string, Function> = {};

      const injector = inject(Injector);
      
      if (config.add) {
        methods['add'] = (value: Entity) => {
          return rxMethod<Entity>(
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
            )
          );
        };
      }

      if (config.delete) {
        // provide implementation
      }

      if (config.load) {
        // provide implementation
      }

      if (config.update) {
        // provide implementation
      }

      return methods as CrudMethods<Config, Entity>;
    }),
    withComputed(({ items }) => ({
      allItems: computed(() => items()),
    }))
  );
}
