import { Component, inject, Injectable, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { signalStore, withState } from '@ngrx/signals';
import { BaseEntity, BaseState, CrudService, withCrudOperations } from './02-feature';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Implementing model + service
export interface Todo extends BaseEntity {
    title: string;
    completed: boolean;
    userId: number;
}

@Injectable({
    providedIn: 'root',
})
export class TodoAllCRUDService implements CrudService<Todo> {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    create(value: Todo) {
        return this.http.post<Todo>(this.url, { value });
    }
    
    readOne(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`);
    }

    readAll(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.url).pipe(
            map(todos => todos.filter(td => td.id < 3))
        );
    }

    update(value: Todo) {
        return this.http.put<Todo>(`${this.url}/${value.id}`, value);
    }

    delete(value: Todo) {
        return this.http.delete(`${this.url}/${value.id}`);
    }
}

// Implementing store
export interface TodoState extends BaseState<Todo> { }

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoAllCRUDStore = signalStore(
    withState(initialState),
    withCrudOperations<Todo>(TodoAllCRUDService)
);

// Implementing component
@Component({
    selector: 'app-todos-all-crud-basic',
    imports: [JsonPipe],
    template: `
        <h1>02 Simple Crud Feature</h1>
        <p>hey</p>

        @for (todo of todos(); track $index) {
            <div>
                <pre>{{todo | json}}</pre>
                <button (click)="removeTodo(todo)">x</button>
                <button (click)="updateTodo(todo)">Flip completed state</button>
            </div>
        }
        <br />
        <button (click)="addTodos()">Add TODOs</button>
        <button (click)="getTodo(1)">Get TODO #1</button>
        @if (todoStore.selectedItem()) {
            <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
        }
    `,
    providers: [TodoAllCRUDStore]
})
export class TodosComponent02 {
    todoStore = inject(TodoAllCRUDStore);

    todos = this.todoStore.items;

    defaultId = signal(0);

    addTodos() {
        this.todoStore.create({ id: this.defaultId(), completed: false, title: 'test', userId: 1 })
        this.defaultId.set(this.defaultId() + 1)
    }

    removeTodo(todo: Todo) {
        this.todoStore.delete(todo)
    }

    getTodo(id: Todo['id']) {
        this.todoStore.readOne(id)
    }

    getTodos() {
        this.todoStore.readAll();
    }

    updateTodo(todo: Todo) {
        const _todo = todo;
        this.todoStore.update({ ..._todo, completed: !_todo.completed });
    }

    ngOnInit() {
        this.getTodos()
    }
}
