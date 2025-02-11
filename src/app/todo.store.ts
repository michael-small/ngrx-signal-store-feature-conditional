import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withState } from '@ngrx/signals';
import { CrudService } from './crud.service';
import { BaseState } from './opt-in-CRUD.store.feature';
import { Todo } from './opt-in-CRUD.store.feature';
import { withCrudOperations } from './opt-in-CRUD.store.feature';
import { Observable, EMPTY, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoService implements CrudService<Todo> {
  private readonly http = inject(HttpClient);

  private url = `https://jsonplaceholder.typicode.com/todos`;

  getItem(id: number) {
    return this.http.get<Todo>(`${this.url}/${id}`);
  }

  getItems(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.url).pipe(
        map(todos => todos.filter(td => td.id < 5))
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
export interface TodoState extends BaseState<Todo> {}
export const initialState: TodoState = {
  selectedItem: null,
  items: [],
  loading: false,
};

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withCrudOperations(TodoService, {
    add: true,
    load: true,
    delete: true,
    update: true,
  })
);
