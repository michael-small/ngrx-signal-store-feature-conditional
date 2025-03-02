import { Component, inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { initialState, Todo } from '../todo.service';
import { CrudService } from '../basic-conditional/basic-conditional.store.feature';
import { HttpClient } from '@angular/common/http';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { withCrudOperations } from './conditional-map-methods.store.feature';
import { withFeatureFactory } from '@angular-architects/ngrx-toolkit';
import { JsonPipe } from '@angular/common';

// Corresponds to `todos-read-only` component
@Injectable({
    providedIn: 'root',
  })
  export class TodoReadOnlyService implements Pick<CrudService<Todo>, 'getOne'> {
    private readonly http = inject(HttpClient);
  
    private url = `https://jsonplaceholder.typicode.com/todos`;
  
    getOne(id: number) {
      return this.http.get<Todo>(`${this.url}/${id}`);
    }
  
    getAll(): Observable<Todo[]> {
      return this.http
        .get<Todo[]>(this.url)
        .pipe(map((todos) => todos.filter((td) => td.id < 3)));
    }
  
    // For todo read only passing methods feature
    getAllDifferentName(): Observable<Todo[]> {
      return this.http
        .get<Todo[]>(this.url)
        .pipe(map((todos) => todos.filter((td) => td.id < 3)));
    }
  }

  export const TodoReadOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps(() => ({ serv: inject(TodoReadOnlyService) })),
    withFeatureFactory((store) =>
      withCrudOperations({
        read: { method: store.serv.getAllDifferentName() },
        // read: true,
      })
    )
  );
  
@Component({
  selector: 'app-todos-read-only-mapping',
  imports: [JsonPipe],
  template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
        </div>
    }
    <br />
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
  providers: [TodoReadOnlyStore],
})
export class TodosReadOnlyMapComponent {
    todoStore = inject(TodoReadOnlyStore);

    todos = this.todoStore.items;
  
    getTodos() {
      this.todoStore.getAll();
    }
  
    ngOnInit() {
      this.getTodos();
    }
}
