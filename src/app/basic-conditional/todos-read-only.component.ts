import { Component, inject, Injectable, signal } from '@angular/core';
import { initialState, Todo } from '../todo.service';
import { JsonPipe } from '@angular/common';
import { CrudService, withCrudConditional } from './basic-conditional.store.feature';
import { signalStore, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Corresponds to `todos-read-only` component
@Injectable({
    providedIn: 'root',
  })
  export class TodoReadOnlyService implements Pick<CrudService<Todo>, 'getAll' | 'getOne'> {
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
  }

export const TodoReadOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudConditional(TodoReadOnlyService, {
      create: false,
      read: true,
      update: false,
      delete: false,
    })
  );

@Component({
  selector: 'app-todos-read-basic',
  imports: [JsonPipe],
  template: `
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
  `,
  providers: [TodoReadOnlyStore]
})
export class TodosReadOnlyComponent {
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
