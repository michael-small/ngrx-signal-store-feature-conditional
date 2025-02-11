import { Component, inject, signal } from '@angular/core';
import { initialState, Todo, TodoService } from '../todo.service';
import { JsonPipe } from '@angular/common';
import { withCrudOperations } from '../opt-in-CRUD.store.feature';
import { signalStore, withState } from '@ngrx/signals';

export const TodoReadOnlyStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudOperations(TodoService, {
      create: false,
      read: true,
      update: false,
      delete: false,
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
