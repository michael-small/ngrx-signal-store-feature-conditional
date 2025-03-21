import { Component, inject, Injectable } from '@angular/core';
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
export class TodoReadAndDeleteMappingService {
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

    deleteDifferent(value: Partial<Todo>) {
        return this.http.delete<Todo>(`${this.url}/${value.id}`).pipe(delay(1000));
    }
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoReadAndDeleteOnlyStore = signalStore(
    withState(initialState),
    withProps(() => ({ serv: inject(TodoReadAndDeleteMappingService) })),
    withFeatureFactory((store) =>
        withCrudMappings({
            readAll: () => store.serv.getAllDifferentName(),
            readOne: (value: number) => store.serv.getOneDifferentName(value),
            create: false,
            update: false,
            delete: (value: Partial<Todo>) => store.serv.deleteDifferent(value)
        })
    )
);
@Component({
    selector: 'app-todos-read-and-delete-mapping',
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
export class TodosReadAndDeleteOnlyMapComponent05 {
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