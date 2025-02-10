import { Component, inject } from '@angular/core';
import { TodoStore } from './todo.store';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-todos',
  imports: [JsonPipe],
  template: `
    <pre>{{todos() | json}}</pre>
    <button (click)="addTodos()">Add TODOs</button>
  `,
  styles: ``,
  providers: [TodoStore]
})
export class TodosComponent {
    todoStore = inject(TodoStore);

    todos = this.todoStore.items;

    addTodos() {
        this.todoStore.add('test')
    }
}
