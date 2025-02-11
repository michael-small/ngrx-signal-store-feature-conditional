import { Component, inject, signal } from '@angular/core';
import { TodoService } from './todo.store';
import { JsonPipe } from '@angular/common';
import { Todo, withCrudOperations } from './opt-in-CRUD.store.feature';
import { signalStore, withState } from '@ngrx/signals';
import { initialState } from './crud.service';

export const TodoAllCRUDStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withCrudOperations(TodoService, {
    add: true,
    load: true,
    delete: true,
    update: true,
  })
);

@Component({
  selector: 'app-todos-all-crud',
  imports: [JsonPipe],
  template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
            <button (click)="removeTodo(todo)">x</button>
            <button (click)="updateTodo(todo)">Flip completed state</button>
        </div>
    }
    <button (click)="addTodos()">Add TODOs</button>
    <button (click)="getTodo(1)">Get TODO #1</button>
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
  styles: ``,
  providers: [TodoAllCRUDStore]
})
export class TodosAllCRUDComponent {
    todoStore = inject(TodoAllCRUDStore);

    todos = this.todoStore.items;

    defaultId = signal(0);

    addTodos() {
        this.todoStore.add({id: this.defaultId(), completed: false, title: 'test', userId: 1})
        this.defaultId.set(this.defaultId() + 1)
    }

    removeTodo(todo: Todo) {
        this.todoStore.remove(todo)
    }

    getTodo(id: Todo['id']) {
        this.todoStore.getItem(id)
    }
    
    getTodos() {
        this.todoStore.getItems();
    }

    updateTodo(todo: Todo) {
        const _todo = todo;
        this.todoStore.update({..._todo, completed: !_todo.completed});
    }

    ngOnInit() {
        this.getTodos()
    }
}
