import { Component, inject, signal } from '@angular/core';
import { initialState, Todo, TodoAllCRUDService } from '../todo.service';
import { JsonPipe } from '@angular/common';
import { withCrudConditional } from './basic-conditional.store.feature';
import { signalStore, withState } from '@ngrx/signals';

const TodoAllCRUDStore = signalStore(
    withState(initialState),
    withCrudConditional(TodoAllCRUDService, {
        create: true,
        read: true,
        update: true,
        delete: true,
    })
);

@Component({
    selector: 'app-todos-all-crud-basic',
    imports: [JsonPipe],
    template: `
        @for (todo of todos(); track $index) {
            <div>
                <pre>{{todo | json}}</pre>
                <button (click)="removeTodo(todo)">x</button>
                <button (click)="updateTodo(todo)">Flip completed state</button>
            </div>
        }
        <br />
        <button (click)="addTodos()">Add TODOs</button>
        <button (click)="getTodo(1)">Get TODO #1</button>
        @if (todoStore.selectedItem()) {
            <pre>Todo #1: {{todoStore.selectedItem() | json}}</pre>
        }
    `,
    providers: [TodoAllCRUDStore]
})
export class TodosAllCRUDComponent {
    todoStore = inject(TodoAllCRUDStore);

    todos = this.todoStore.items;

    defaultId = signal(0);

    addTodos() {
        this.todoStore.create({ id: this.defaultId(), completed: false, title: 'test', userId: 1 })
        this.defaultId.set(this.defaultId() + 1)
    }

    removeTodo(todo: Todo) {
        this.todoStore.delete(todo)
    }

    getTodo(id: Todo['id']) {
        this.todoStore.getOne(id)
    }

    getTodos() {
        this.todoStore.getAll();
    }

    updateTodo(todo: Todo) {
        const _todo = todo;
        this.todoStore.update({ ..._todo, completed: !_todo.completed });
    }

    ngOnInit() {
        this.getTodos()
    }
}
