import { Component, inject, Injectable, signal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { initialState, Todo } from '../todo.service';
import { CrudService } from '../basic-conditional/basic-conditional.store.feature';
import { HttpClient } from '@angular/common/http';
import { signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { withCrudOperations } from './conditional-map-methods.store.feature';
import { withFeatureFactory } from '@angular-architects/ngrx-toolkit';
import { JsonPipe } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class TodoReadMappingService {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    getOne(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`);
    }

    // For todo read only passing methods feature
    getAllDifferentName(): Observable<Todo[]> {
        return this.http
            .get<Todo[]>(this.url)
            .pipe(map((todos) => todos.filter((td) => td.id < 3)));
    }
}

export const TodoReadOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps(() => ({ serv: inject(TodoReadMappingService) })),
    withFeatureFactory((store) =>
        withCrudOperations({
            read: { methodGetAll: store.serv.getAllDifferentName(), methodGetOne: ((value: number) => store.serv.getOne(value)) },
            create: false,
            update: false,
            delete: false
        })
    )
);

@Component({
    selector: 'app-todos-read-mapping',
    imports: [JsonPipe],
    template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
        </div>
    }
    <br />
    <button (click)="getTodo(1)">Get TODO #1</button>
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
    providers: [TodoReadOnlyStore],
})
export class TodosReadOnlyMapComponent {
    todoStore = inject(TodoReadOnlyStore);

    todos = this.todoStore.items;

    getTodo(id: Todo['id']) {
        this.todoStore.getOne(id)
    }

    getTodos() {
        this.todoStore.getAll();
    }

    ngOnInit() {
        this.getTodos()
    }
}
