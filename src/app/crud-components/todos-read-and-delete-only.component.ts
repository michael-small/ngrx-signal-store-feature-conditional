import { Component, inject, signal } from '@angular/core';
import { initialState, Todo, TodoService } from '../todo.service';
import { JsonPipe } from '@angular/common';
import { withCrudOperations } from '../opt-in-CRUD.store.feature';
import { signalStore, withState } from '@ngrx/signals';

export const TodoReadAndDeleteOnlyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withCrudOperations(TodoService, {
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
