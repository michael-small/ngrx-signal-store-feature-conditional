import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
@Component({
    selector: 'app-root',
    imports: [RouterModule, FormsModule],
    template: `
        <ul>
            @for (page of pages; track $index) {
                <li><a [routerLink]="page.url">{{page.url}}</a></li>
            }
        </ul>

        <router-outlet />
    `,
})
export class AppComponent {
    currentPage = signal<{ url: string } | undefined>(undefined);

    pages: { url: string }[] = [
        { url: '/01-boilerplate-store-http' },
        { url: '/02-simple-crud-feature' },
        { url: '/03-stream-wip-conditional-feature' },
        { url: '/04-final-conditional-feature' }
    ]
}
