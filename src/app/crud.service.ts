import { Observable } from 'rxjs';

export interface CrudService<T> {
  getItems(): Observable<T[]>;

  getItem(id: string): Observable<T>;

  addItem(value: T): Observable<T>;

  updateItem(value: T): Observable<T>;

  deleteItem(value: T): Observable<any>;
}
