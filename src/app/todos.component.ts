import { Component, inject } from '@angular/core';
import { TodoStore } from './todo.store';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-todos',
  imports: [JsonPipe],
  template: `
    <pre>{{todos() | json}}</pre>
    <button (click)="addTodos()">Add TODOs</button>
    <button (click)="callAltMethods()">Alt methods that work</button>
  `,
  styles: ``,
  providers: [TodoStore]
})
export class TodosComponent {
    todoStore = inject(TodoStore);

    todos = this.todoStore.items;

    addTodos() {
        this.todoStore.add({id: '1', value: '', done: false})
    }

    callAltMethods() {
        this.todoStore.getItems()
        this.todoStore.doThing()
    }
}
