import { Component, inject, Injectable } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { signalStore, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { delay, map, Observable } from 'rxjs';
import { withCrudConditional } from './04-feature';
import { CrudService, Todo, TodoState } from '../shared/todos-and-store.model';

@Injectable({
    providedIn: 'root',
})
class TodoReadOnlyService implements Pick<CrudService<Todo>, 'readOne' | 'readAll'> {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    readOne(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`).pipe(
            delay(1000)
        );
    }

    readAll(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.url).pipe(
            map(todos => todos.filter(td => td.id < 3)),
            delay(1000)
        );
    }
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoReadOnlyStore = signalStore(
    withState(initialState),
    withCrudConditional(TodoReadOnlyService, {
        create: false,
        readOne: true,
        readAll: true,
        update: false,
        delete: false,
    })
);

@Component({
    selector: 'app-todos-read-basic',
    imports: [JsonPipe],
    template: `
        <h2>R</h2>

        @if (todoStore.loading()) {
            <p>Loading...</p>
        } @else {
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
        }
    `,
    providers: [TodoReadOnlyStore]
})
export class TodosReadOnlyComponent04 {
    todoStore = inject(TodoReadOnlyStore);

    todos = this.todoStore.items;

    getTodo(id: Todo['id']) {
        this.todoStore.readOne(id)
    }

    getTodos() {
        this.todoStore.readAll();
    }

    ngOnInit() {
        this.getTodos()
    }
}
