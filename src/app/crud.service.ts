import { Observable } from 'rxjs';
import { BaseState, Todo } from './opt-in-CRUD.store.feature';

export interface CrudService<T> {
  getItems(): Observable<T[]>;

  getItem(id: number): Observable<T>;

  addItem(value: T): Observable<T>;

  updateItem(value: T): Observable<T>;

  deleteItem(value: T): Observable<any>;
}

export interface TodoState extends BaseState<Todo> {}

export const initialState: TodoState = {
  selectedItem: null,
  items: [],
  loading: false,
};