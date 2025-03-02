import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseEntity, BaseState, CrudService } from './basic-conditional/basic-conditional.store.feature';

export interface TodoState extends BaseState<Todo> { }

export interface Todo extends BaseEntity {
    title: string;
    completed: boolean;
    userId: number;
}

export const initialState: TodoState = {
    selectedItem: null,
    items: [],
    loading: false,
};

// Implementing services can pick and choose what to implement, and then
//     reflect that choice with the `CrudConfig` of the feature.
// For maximizing correctness of everything implementing the right features,
//     use the TypeScript `Pick` helper per each `CrudService` method
//     corresponding to your `CrudConfig`

// Corresponds to `todos-all-crud` component
@Injectable({
  providedIn: 'root',
})
export class TodoAllCRUDService implements CrudService<Todo> {
  private readonly http = inject(HttpClient);

  private url = `https://jsonplaceholder.typicode.com/todos`;

  getOne(id: number) {
    return this.http.get<Todo>(`${this.url}/${id}`);
  }

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.url).pipe(
        map(todos => todos.filter(td => td.id < 3))
    );
  }

  create(value: Todo) {
    return this.http.post<Todo>(this.url, { value });
  }

  update(value: Todo) {
    return this.http.put<Todo>(`${this.url}/${value.id}`, value);
  }

  delete(value: Todo) {
    return this.http.delete(`${this.url}/${value.id}`);
  }
}
