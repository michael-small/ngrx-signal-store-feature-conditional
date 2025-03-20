import { Component, inject, Injectable } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { signalStore, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { withCrudConditional } from './04-feature';
import { CrudService, Todo, TodoState } from '../shared/todos.model';

@Injectable({
    providedIn: 'root',
})
class TodoReadOnlyService implements Pick<CrudService<Todo>, 'readOne' | 'readAll'> {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    readOne(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`);
    }

    readAll(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.url).pipe(
            map(todos => todos.filter(td => td.id < 3))
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
    providers: [TodoReadOnlyStore]
})
export class TodosReadOnlyComponent {
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
