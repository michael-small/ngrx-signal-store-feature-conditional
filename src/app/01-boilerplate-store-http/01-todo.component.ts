import { Component, inject, Injectable, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { map, Observable, pipe, switchMap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

// Implementing model + service
interface Todo {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
}

@Injectable({
    providedIn: 'root',
})
class TodoAllCRUDService {
    private readonly http = inject(HttpClient);

    private url = `https://jsonplaceholder.typicode.com/todos`;

    getItem(id: number) {
        return this.http.get<Todo>(`${this.url}/${id}`);
    }

    getItems(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.url).pipe(
            map(todos => todos.filter(td => td.id < 3))
        );
    }

    addItem(value: Todo) {
        return this.http.post<Todo>(this.url, { value });
    }

    updateItem(value: Todo) {
        return this.http.put<Todo>(`${this.url}/${value.id}`, value);
    }

    deleteItem(value: Todo) {
        return this.http.delete(`${this.url}/${value.id}`);
    }
}

// Implementing store
type TodoState = {
    selectedItem: Todo | null;
    items: Todo[];
    loading: boolean;
};

const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

const TodoAllCRUDStore = signalStore(
    withState(initialState),
    withMethods(( store, service = inject(TodoAllCRUDService) ) => ({
        addItem: rxMethod<Todo>(
            pipe(
                switchMap((value) => {
                    patchState(store, { loading: true });

                    return service.addItem(value).pipe(
                        tapResponse({
                            next: (addedItem) => {
                                patchState(store, {
                                    items: [...store.items(), addedItem],
                                });
                            },
                            error: console.error,
                            finalize: () => patchState(store, { loading: false }),
                        })
                    );
                })
            )
        ),
        getItems: rxMethod<void>(
            pipe(
                switchMap(() => {
                    patchState(store, { loading: true });

                    return service.getItems!().pipe(
                        tapResponse({
                            next: (items) => {
                                patchState(store, {
                                    items: items,
                                });
                            },
                            error: console.error,
                            finalize: () => patchState(store, { loading: false }),
                        })
                    )
                })
            )
        ),
        getItem: rxMethod<number>(
            pipe(
                switchMap((id) => {
                    patchState(store, { loading: true });

                    return service.getItem!(id).pipe(
                        tapResponse({
                            next: (item) => {
                                patchState(store, {
                                    selectedItem: item,
                                });
                            },
                            error: console.error,
                            finalize: () => patchState(store, { loading: false }),
                        })
                    )
                })
            )
        ),
        deleteItem: rxMethod<Todo>(
            pipe(
                switchMap((item) => {
                    patchState(store, { loading: true });

                    return service.deleteItem(item).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, {
                                    items: [...store.items().filter((x) => x.id !== item.id)],
                                });
                            },
                            error: console.error,
                            finalize: () => patchState(store, { loading: false }),
                        })
                    );
                })
            )
        ),
        updateItem: rxMethod<Todo>(
            pipe(
                switchMap((item) => {
                    patchState(store, { loading: true });

                    return service.updateItem(item).pipe(
                        tapResponse({
                            next: (updatedItem) => {
                                const allItems = [...store.items()];
                                const index = allItems.findIndex((x) => x.id === item.id);

                                allItems[index] = updatedItem;

                                patchState(store, {
                                    items: allItems,
                                });
                            },
                            error: console.error,
                            finalize: () => patchState(store, { loading: false }),
                        })
                    );
                })
            )
        )
    }))
)

// Implementing component
@Component({
    selector: 'app-todos-all-crud-basic',
    imports: [JsonPipe],
    template: `
        <h1>01 Boilerplate Store HTTP</h1>
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
export class TodosComponent01 {
    todoStore = inject(TodoAllCRUDStore);

    todos = this.todoStore.items;

    defaultId = signal(0);

    addTodos() {
        this.todoStore.addItem({ id: this.defaultId(), completed: false, title: 'test', userId: 1 })
        this.defaultId.set(this.defaultId() + 1)
    }

    removeTodo(todo: Todo) {
        this.todoStore.deleteItem(todo)
    }

    getTodo(id: Todo['id']) {
        this.todoStore.getItem(id)
    }

    getTodos() {
        this.todoStore.getItems();
    }

    updateTodo(todo: Todo) {
        const _todo = todo;
        this.todoStore.updateItem({ ..._todo, completed: !_todo.completed });
    }

    ngOnInit() {
        this.getTodos()
    }
}
