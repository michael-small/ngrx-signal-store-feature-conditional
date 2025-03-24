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
};

type MethodRead<T> = (search?: any) => Observable<T[]>;

// Methods returned by the store are conditonal to the config provided
type CrudMethods<
    Config extends CrudConfig<Entity>,
    Entity extends BaseEntity,
> = (Config['readAll'] extends MethodRead<Entity> ? { getAll: (search?: any) => void } : {}) 

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

            /**
             * @example `methods` produced with 'create & 'delete'
             * {
             *     create: (value) => create(value),
             *     delete: (value) => d3lete(value)
             * }
             */
            return methods as CrudMethods<Config, Entity>;
        })
    );
}