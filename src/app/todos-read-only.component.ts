import { Component, inject, signal } from '@angular/core';
import { TodoService } from './todo.store';
import { JsonPipe } from '@angular/common';
import { Todo, withCrudOperations } from './opt-in-CRUD.store.feature';
import { signalStore, withState } from '@ngrx/signals';
import { initialState } from './crud.service';

export const TodoReadOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudOperations(TodoService, {
      add: false,
      load: true,
      delete: false,
      update: false,
    })
  );

@Component({
  selector: 'app-todos-read-only',
  imports: [JsonPipe],
  template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
        </div>
    }
    <button (click)="getTodo(1)">Get TODO #1</button>
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
  styles: ``,
  providers: [TodoReadOnlyStore]
})
export class TodosReadOnlyComponent {
    todoStore = inject(TodoReadOnlyStore);

    todos = this.todoStore.items;

    defaultId = signal(0);

    getTodo(id: Todo['id']) {
        this.todoStore.getItem(id)
    }
    
    getTodos() {
        this.todoStore.getItems();
    }

    ngOnInit() {
        this.getTodos()
    }
}
