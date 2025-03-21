import { Component, inject, Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { withCrudMappings } from './05-conditional-map-methods.store.feature';
import { withFeatureFactory } from '@angular-architects/ngrx-toolkit';
import { JsonPipe } from '@angular/common';
import { Todo, TodoState } from '../shared/todos-and-store.model';

@Injectable({
    providedIn: 'root',
})
export class TodoReadMappingService {
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
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoReadOnlyStore = signalStore(
    withState(initialState),
    withProps(() => ({ serv: inject(TodoReadMappingService) })),
    withFeatureFactory((store) =>
        withCrudMappings({
            readAll: () => store.serv.getAllDifferentName(),
            readOne: (value: number) => store.serv.getOneDifferentName(value),
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
    providers: [TodoReadOnlyStore],
})
export class TodosReadOnlyMapComponent05 {
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
