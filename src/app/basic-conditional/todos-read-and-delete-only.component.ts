import { Component, inject, Injectable, signal } from '@angular/core';
import { initialState, Todo } from '../todo.service';
import { JsonPipe } from '@angular/common';
import { CrudService, withCrudConditional } from '../opt-in-CRUD.store.feature';
import { signalStore, withState } from '@ngrx/signals';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Corresponds to `todos-read-and-delete-only` component
@Injectable({
    providedIn: 'root',
  })
  export class TodoReadAndDeleteOnlyService implements Pick<CrudService<Todo>, 'getAll' | 'getOne' | 'delete'> {
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

    delete(value: Todo) {
        return this.http.delete(`${this.url}/${value.id}`);
      }
  }

export const TodoReadAndDeleteOnlyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withCrudConditional(TodoReadAndDeleteOnlyService, {
    create: false,
    read: true,
    update: false,
    delete: true,
  })
);

@Component({
  selector: 'app-todos-read-and-delete-only',
  imports: [JsonPipe],
  template: `
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
  `,
  providers: [TodoReadAndDeleteOnlyStore]
})
export class TodosReadAndDeleteOnlyComponent {
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
