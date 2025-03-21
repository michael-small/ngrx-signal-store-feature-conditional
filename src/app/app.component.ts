import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
@Component({
    selector: 'app-root',
    imports: [RouterModule, FormsModule],
    template: `
        <p>External Links</p>
        <ul>
            <li><a routerLink="https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/">Fabian's article</a></li>
            <li><a routerLink="https://ngrx-toolkit.angulararchitects.io/docs/with-data-service">withDataService</a></li>
            <li><a routerLink="https://docs.google.com/presentation/d/1nZpCFDqNtvtZ-7AJ68WEEGSbYJd6-mAE4lZqCYwlLkg/edit?usp=sharing">Slides</a></li>
            <li><a routerLink="https://github.com/michael-small/ngrx-signal-store-feature-conditional">Repo</a></li>
            <li><a routerLink="https://www.youtube.com/watch?v=1D8VTlTnJ2E">Stream/VOD</a></li>
        </ul>

        <p>App Links</p>
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
        { url: '/04-final-conditional-feature' },
        { url: '/05-bonus-WIP-mapper' }
    ]
}
