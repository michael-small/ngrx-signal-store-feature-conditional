import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseEntity, BaseState, CrudService } from './opt-in-CRUD.store.feature';

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

@Injectable({
  providedIn: 'root',
})
export class TodoService implements Partial<CrudService<Todo>> {
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