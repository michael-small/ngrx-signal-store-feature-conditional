import { Component } from '@angular/core';
import { TodosAllCRUDComponent } from './crud-components/todos-all-crud.component';
import { TodosReadOnlyComponent } from './crud-components/todos-read-only.component';
import { TodosReadAndDeleteOnlyComponent } from './crud-components/todos-read-and-delete-only.component';

@Component({
  selector: 'app-root',
  imports: [TodosAllCRUDComponent, TodosReadOnlyComponent, TodosReadAndDeleteOnlyComponent],
  template: `
    <h1>Opt-in Signal Store Features with CRUD Example</h1>
    <p>
        CRUD (Create, Read, Update, Delete) services offer various combinations of features to turn on and off.
        The following configurations are used to demonstrate how a <code>signalStoreFeature</code> can be written
        to allow the end-user to pick and choose methods that the store offers.
    </p>

    <h2>All CRUD</h2>
    <app-todos-all-crud />

    <h2>READ only</h2>
    <app-todos-read-only />

    <h2>READ and DELETE only</h2>
    <app-todos-read-and-delete-only />
  `,
})
export class AppComponent {}
