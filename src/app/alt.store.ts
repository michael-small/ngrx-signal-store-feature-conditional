import { of, pipe, switchMap } from 'rxjs';
import { inject, Injector } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export function withCrudOperationsAlt() {
    return signalStoreFeature(

        // Provided what I ran with down there is legit, this is what I am hung up on
        // I would think that it returning {} was part of the point
        withMethods((store, injector = inject(Injector)) => {
            return {
                doThing: rxMethod<void>(
                    pipe(
                        switchMap((value) => {
                            console.log('hit')
                            alert('hit alt')
                            patchState(store, { loading: true });
                            return of('')
                        })
                    ), { injector: injector }
                )
            }
        }),
    );
}
