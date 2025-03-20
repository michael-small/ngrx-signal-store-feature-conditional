import { Component, signal } from '@angular/core';
import { TodosAllCRUDComponent } from './basic-conditional/todos-all-crud.component';
import { TodosReadOnlyComponent } from './basic-conditional/todos-read-only.component';
import { TodosReadAndDeleteOnlyComponent } from './basic-conditional/todos-read-and-delete-only.component';
import { TodosReadOnlyMapComponent } from "./conditional-map-methods/todos-read-only.component";
import { TodosAllCrudMapComponent } from "./conditional-map-methods/todos-all-crud.component";
import { TodosReadAndDeleteOnlyMapComponent } from "./conditional-map-methods/todos-read-and-delete-only.component";

// TODO - hide this or break it apart
@Component({
    selector: 'app-root',
    imports: [TodosAllCRUDComponent, TodosReadOnlyComponent, TodosReadAndDeleteOnlyComponent, TodosReadOnlyMapComponent, TodosAllCrudMapComponent, TodosReadAndDeleteOnlyComponent, TodosReadAndDeleteOnlyMapComponent],
    template: `
        <h1>Opt-in Signal Store Features with CRUD Example</h1>
        <p>
            CRUD (Create, Read, Update, Delete) services offer various combinations of features to turn on and off.
            The following configurations are used to demonstrate how a <code>signalStoreFeature</code> can be written
            to allow the end-user to pick and choose methods that the store offers.
        </p>

        @if (type() === 'basic') {
            <button (click)="type.set('mapping')">Show Mapping Based</button>
            
            <h2>All CRUD</h2>
            <app-todos-all-crud-basic />

            <h2>READ only</h2>
            <app-todos-read-basic />

            <h2>READ and DELETE only</h2>
            <app-todos-read-and-delete-basic />
        } @else {
            <button (click)="type.set('basic')">Show Basic Based</button>

            <h2>All CRUD</h2>
            <app-todos-all-crud-mapping />

            <h2>READ only</h2>
            <app-todos-read-mapping />

            <h2>READ and DELETE only</h2>
            <app-todos-read-and-delete-mapping />
        }
  `,
})
export class AppComponent {
    type = signal<'basic' | 'mapping'>('basic')
}
