import { Component, inject, Injectable, signal } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { withCrudMappings } from './05-conditional-map-methods.store.feature';
import { withFeatureFactory } from '@angular-architects/ngrx-toolkit';
import { JsonPipe } from '@angular/common';
import { Todo, TodoState } from '../shared/todos.model';

@Injectable({
    providedIn: 'root',
})
export class TodoAllCRUDMappingService {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    getOneDifferentName(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`).pipe(delay(1000));
    }

    getAllDifferentName(): Observable<Todo[]> {
        return this.http
            .get<Todo[]>(this.url)
            .pipe(map((todos) => todos.filter((td) => td.id < 3)), delay(1000));
    }

    createDifferent(value: Partial<Todo>) {
        return this.http.post<Todo>(this.url, { value }).pipe(delay(1000));
    }

    updateDifferent(value: Partial<Todo>) {
        return this.http.put<Todo>(`${this.url}/${value.id}`, value).pipe(delay(1000));
    }

    deleteDifferent(value: Partial<Todo>) {
        return this.http.delete<Todo>(`${this.url}/${value.id}`).pipe(delay(1000));
    }
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoAllCRUDStore = signalStore(
    withState(initialState),
    withProps(() => ({ serv: inject(TodoAllCRUDMappingService) })),
    withFeatureFactory((store) =>
        withCrudMappings({
            readAll: () => store.serv.getAllDifferentName(),
            readOne: (value: number) => store.serv.getOneDifferentName(value),
            create: (value: Partial<Todo>) => store.serv.createDifferent(value),
            update: (value: Partial<Todo>) => store.serv.updateDifferent(value),
            delete: (value: Partial<Todo>) => store.serv.deleteDifferent(value),
        })
    )
);

@Component({
    selector: 'app-todos-all-crud-mapping',
    imports: [JsonPipe],
    template: `
        <h2>CRUD</h2>     
           
        @if (todoStore.loading()) {
            <p>Loading...</p>
        } @else {
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
        }
    `,
    providers: [TodoAllCRUDStore]
})
export class TodosAllCrudMapComponent05 {
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
        this.todoStore.getOne(id)
    }

    getTodos() {
        this.todoStore.getAll();
    }

    updateTodo(todo: Todo) {
        const _todo = todo;
        this.todoStore.update({ ..._todo, completed: !_todo.completed });
    }

    ngOnInit() {
        this.getTodos()
    }
}
