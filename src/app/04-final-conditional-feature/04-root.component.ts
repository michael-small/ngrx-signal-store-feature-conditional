import { Component } from '@angular/core';
import { TodosAllCRUDComponent04 } from './04-todos-all-crud.component';
import { TodosReadAndDeleteOnlyComponent04 } from './04-todos-read-and-delete-only.component';
import { TodosReadOnlyComponent04 } from './04-todos-read-only.component';

@Component({
    template: `
        <h1>04 Final Condition Feature</h1>
        <app-todos-all-crud-basic />
        <app-todos-read-and-delete-basic />
        <app-todos-read-basic />
    `,
    imports: [TodosAllCRUDComponent04, TodosReadAndDeleteOnlyComponent04, TodosReadOnlyComponent04]
})

export class Root04Component {}