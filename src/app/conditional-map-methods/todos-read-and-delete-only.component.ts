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
export class TodoReadAndDeleteMappingService {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    getOneDifferentName(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`);
    }

    getAllDifferentName(): Observable<Todo[]> {
        return this.http
            .get<Todo[]>(this.url)
            .pipe(map((todos) => todos.filter((td) => td.id < 3)));
    }

    deleteDifferent(value: Todo) {
        return this.http.delete<Todo>(`${this.url}/${value.id}`);
    }
}

export const TodoReadAndDeleteOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps(() => ({ serv: inject(TodoReadAndDeleteMappingService) })),
    withFeatureFactory((store) =>
        withCrudOperations({
            read: { methodGetAll: store.serv.getAllDifferentName(), methodGetOne: ((value: number) => store.serv.getOneDifferentName(value)) },
            create: false,
            update: false,
            delete: { method: ((value: Todo) => store.serv.deleteDifferent(value)) }
        })
    )
);
@Component({
    selector: 'app-todos-read-and-delete-mapping',
    imports: [JsonPipe],
    template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
            <button (click)="removeTodo(todo)">x</button>
        </div>
    }
    <br />
    <button (click)="getTodo(1)">Get TODO #1</button>
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
    providers: [TodoReadAndDeleteOnlyStore]
})
export class TodosReadAndDeleteOnlyMapComponent {
    todoStore = inject(TodoReadAndDeleteOnlyStore);

    todos = this.todoStore.items;

    removeTodo(todo: Todo) {
        this.todoStore.delete(todo)
    }

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