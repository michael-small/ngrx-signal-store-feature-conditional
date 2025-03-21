import { Component, inject, Injectable } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { signalStore, withState } from '@ngrx/signals';
import { delay, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { withCrudConditional } from './04-feature';
import { CrudService, Todo, TodoState } from '../shared/todos-and-store.model';

@Injectable({
    providedIn: 'root',
})
class TodoReadAndDeleteOnlyService implements Pick<CrudService<Todo>, 'readAll' | 'readOne' | 'delete'> {
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

    delete(value: Todo) {
        return this.http.delete(`${this.url}/${value.id}`).pipe(
            delay(500)
        );
    }
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoReadAndDeleteOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudConditional(TodoReadAndDeleteOnlyService, {
        create: false,
        readAll: true,
        readOne: true,
        update: false,
        delete: true,
    })
);

@Component({
    selector: 'app-todos-read-and-delete-basic',
    imports: [JsonPipe],
    template: `
        <h2>CD</h2>   

        @if (todoStore.loading()) {
            <p>Loading...</p>
        } @else {
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
        }
    `,
    providers: [TodoReadAndDeleteOnlyStore]
})
export class TodosReadAndDeleteOnlyComponent04 {
    todoStore = inject(TodoReadAndDeleteOnlyStore);

    todos = this.todoStore.items;

    removeTodo(todo: Todo) {
        this.todoStore.delete(todo)
    }

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
