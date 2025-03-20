import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Route } from '@angular/router';

import { TodosComponent01 } from './01-boilerplate-store-http/01-todo.component';
import { TodosComponent02 } from './02-simple-crud-feature/02-todo.component';
import { TodosComponent03 } from './03-stream-wip-conditional-feature/03-todo.component';
import { TodosAllCRUDComponent04 } from './04-final-conditional-feature/04-todos-all-crud.component';

const routes: Route[] = [
    {
        path: '01-boilerplate-store-http',
        component: TodosComponent01
    },
    {
        path: '02-simple-crud-feature',
        component: TodosComponent02
    },
    {
        path: '03-stream-wip-conditional-feature',
        component: TodosComponent03
    },
    {
        path: '04-final-conditional-feature',
        component: TodosAllCRUDComponent04
    }
];

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(), provideRouter(routes)]
};
