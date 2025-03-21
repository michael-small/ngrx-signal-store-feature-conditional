import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Route } from '@angular/router';

import { TodosComponent01 } from './01-boilerplate-store-http/01-todo.component';
import { TodosComponent02 } from './02-simple-crud-feature/02-todo.component';
import { TodosComponent03 } from './03-stream-wip-conditional-feature/03-todo.component';
import { Root05Component } from './05-bonus-WIP-mapper/05-root.component';
import { Root04Component } from './04-final-conditional-feature/04-root.component';

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
        component: Root04Component
    },
    {
        path: '05-bonus-WIP-mapper',
        component: Root05Component
    }
];

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(), provideRouter(routes)]
};
