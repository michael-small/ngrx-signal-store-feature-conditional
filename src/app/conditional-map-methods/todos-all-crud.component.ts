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
export class TodoAllCRUDMappingService {
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

    createDifferent(value: Todo) {
        return this.http.post<Todo>(this.url, { value });
    }

    updateDifferent(value: Todo) {
        return this.http.put<Todo>(`${this.url}/${value.id}`, value);
    }

    deleteDifferent(value: Todo) {
        return this.http.delete<Todo>(`${this.url}/${value.id}`);
    }
}

export const TodoAllCRUDStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps(() => ({ serv: inject(TodoAllCRUDMappingService) })),
    withFeatureFactory((store) =>
        withCrudOperations({
            read: { methodGetAll: store.serv.getAllDifferentName(), methodGetOne: ((value: number) => store.serv.getOneDifferentName(value)) },
            create: { method: ((value: Todo) => store.serv.createDifferent(value)) },
            update: { method: ((value: Todo) => store.serv.updateDifferent(value)) },
            delete: { method: ((value: Todo) => store.serv.deleteDifferent(value)) }
        })
    )
);

@Component({
    selector: 'app-todos-all-crud-mapping',
    imports: [JsonPipe],
    template: `
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
    styles: ``
})
export class TodosAllCrudMapComponent {
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
