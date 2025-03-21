# Ngrx SignalStoreFeature Conditional

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/michael-small/ngrx-signal-store-feature-conditional)


[Live/Archived stream: "Dynamic SignalStore Features with Conditional Types"](https://www.youtube.com/watch?v=1D8VTlTnJ2E)

    🚀 Dynamic SignalStore CRUD: Built for Flexibility

    Ever needed a CRUD system that adapts to different use cases? 
    We’ll show you how to build a SignalStore feature that allows 
    users to dynamically toggle features and adjust types accordingly.

    Expect:
    ✔ Live coding & hands-on problem-solving
    ✔ Strong typing vs. flexibility in TypeScript
    ✔ Designing a SignalStore extension that adapts to user configurations

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.0.

## Development server

You can run the repo in Stackblitz automatically if you want with the button at the top. But if you want to run it locally: 

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Links

- [Fabian's article](https://offering.solutions/blog/articles/2024/02/07/extending-the-ngrx-signal-store-with-a-custom-feature/)  
- [withDataService](https://ngrx-toolkit.angulararchitects.io/docs/with-data-service)
- [signalStoreFeature docs](https://ngrx.io/guide/signals/signal-store/custom-store-features)
- [Slides](https://docs.google.com/presentation/d/1nZpCFDqNtvtZ-7AJ68WEEGSbYJd6-mAE4lZqCYwlLkg/edit?usp=sharing)
- [Repo](https://github.com/michael-small/ngrx-signal-store-feature-conditional)
- [Stream/VOD](https://www.youtube.com/watch?v=1D8VTlTnJ2E)

## Running unit tests

Yes, there are tests! At least for the basic store, at the time of this copy I need to make tests for the mapping version.

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```