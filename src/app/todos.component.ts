import { Component, inject, signal } from '@angular/core';
import { TodoStore } from './todo.store';
import { JsonPipe } from '@angular/common';
import { Todo } from './opt-in-CRUD.store.feature';

@Component({
  selector: 'app-todos',
  imports: [JsonPipe],
  template: `
    @for (todo of todos(); track $index) {
        <div>
            <pre>{{todo | json}}</pre>
            <button (click)="removeTodo(todo)">x</button>
        </div>
    }
    <button (click)="addTodos()">Add TODOs</button>
    <button (click)="getTodo(1)">Get TODO #1</button>
    @if (todoStore.selectedItem()) {
        <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
    }
  `,
  styles: ``,
  providers: [TodoStore]
})
export class TodosComponent {
    todoStore = inject(TodoStore);

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

    ngOnInit() {
        this.getTodos()
    }
}
