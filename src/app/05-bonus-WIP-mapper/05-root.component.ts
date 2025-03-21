import { Component } from '@angular/core';
import { TodosAllCrudMapComponent05 } from './05-todos-all-crud.component';
import { TodosReadAndDeleteOnlyMapComponent05 } from './05-todos-read-and-delete-only.component';
import { TodosReadOnlyMapComponent05 } from './05-todos-read-only.component';

@Component({
    template: `
        <h1>05 Bonus WIP Mapper</h1>
        <app-todos-all-crud-mapping />
        <app-todos-read-and-delete-mapping />
        <app-todos-read-mapping />
    `,
    imports: [TodosAllCrudMapComponent05, TodosReadAndDeleteOnlyMapComponent05, TodosReadOnlyMapComponent05]
})

export class Root05Component {}