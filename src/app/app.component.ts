import { Component } from '@angular/core';
import { TodosComponent } from './todos.component';

@Component({
  selector: 'app-root',
  imports: [TodosComponent],
  template: `<app-todos />`,
})
export class AppComponent {
}
