import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
@Component({
    selector: 'app-root',
    imports: [RouterModule, FormsModule],
    template: `
        <p>External Links</p>
        <ul>
            <li><a href="https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/" target="_blank">Fabian Gosebrink's article</a></li>
            <li><a href="https://ngrx-toolkit.angulararchitects.io/docs/with-data-service" target="_blank">withDataService</a></li>
            <li><a href="https://ngrx.io/guide/signals/signal-store/custom-store-features" target="_blank">signalStoreFeature docs</a></li>
            <li><a href="https://docs.google.com/presentation/d/1nZpCFDqNtvtZ-7AJ68WEEGSbYJd6-mAE4lZqCYwlLkg/edit?usp=sharing" target="_blank">Slides</a></li>
            <li><a href="https://github.com/michael-small/ngrx-signal-store-feature-conditional" target="_blank">Repo</a></li>
            <li><a href="https://www.youtube.com/watch?v=1D8VTlTnJ2E" target="_blank">Stream/VOD</a></li>
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
