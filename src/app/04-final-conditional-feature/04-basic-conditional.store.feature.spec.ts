import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { signalStore, withHooks, withState } from '@ngrx/signals';
import { withCrudConditional } from './04-feature';
import { initialState } from './04-todos-all-crud.component';
import { CrudService, Todo } from '../shared/todos-and-store.model';

@Injectable({
    providedIn: 'root',
})
class TodoAllCRUDService implements CrudService<Todo> {
    readOne(id: number) {
        return of(createTodo({ id: id }))
    }

    readAll(): Observable<Todo[]> {
        return of([{ ...createTodo(), id: 1 }])
    }

    create(value: Todo) {
        return of(value)
    }

    update(value: Todo) {
        return of(value)
    }

    delete(value: Todo) {
        return of(undefined)
    }
}

describe('withCrudConditional', () => {
    it('should do all CRUD if all enabled', fakeAsync(() => {
        const AllCRUDStore = signalStore(
            { providedIn: 'root' },
            withState(initialState),
            withCrudConditional(TodoAllCRUDService, {
                create: true,
                readOne: true,
                readAll: true,
                update: true,
                delete: true,
            }),
            withHooks({
                onInit(store) {
                    currentTodoId = 0;
                },
            }),
        );

        TestBed.runInInjectionContext(() => {
            const store = new AllCRUDStore();

            tick();
            expect(store.items().length).toBe(0);

            store.readAll();
            tick();
            expect(store.items().length).toBe(1);

            store.create({ ...createTodo(), id: 2 })
            tick();
            expect(store.items().length).toBe(2)

            store.readOne(1)
            tick()
            expect(store.selectedItem()).toEqual({ ...createTodo(), id: 1 })

            store.update({ ...createTodo(), id: 1, completed: true })
            tick();
            expect(store.items()[0]).toEqual({ ...createTodo(), id: 1, completed: true })

            store.delete({ ...createTodo(), id: 1, completed: true })
            tick()
            expect(store.items().length).toBe(1)
            expect(store.items()[0]).toEqual({ ...createTodo(), id: 2 })
        });
    }))
    it('should do expose create() if only C = true', fakeAsync(() => {
        const CStore = signalStore(
            { providedIn: 'root' },
            withState(initialState),
            withCrudConditional(TodoAllCRUDService, {
                create: true,
                readOne: false,
                readAll: false,
                update: false,
                delete: false,
            })
        );

        TestBed.runInInjectionContext(() => {
            const store = new CStore();

            expect(typeof store.create).toBe('function')

            // @ts-expect-error
            expect(() => store.readAll()).toThrow();
            // @ts-expect-error
            expect(() => store.readOne(1)).toThrow();
            // @ts-expect-error
            expect(() => store.update({ ...createTodo(), id: 1, completed: true })).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose readOne() and readAll() if only R = true', fakeAsync(() => {
        const RStore = signalStore(
            { providedIn: 'root' },
            withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
            withCrudConditional(TodoAllCRUDService, {
                create: false,
                readOne: true,
                readAll: true,
                update: false,
                delete: false,
            })
        );
        TestBed.runInInjectionContext(() => {
            const store = new RStore();

            store.readAll();
            store.readOne(1);

            expect(typeof store.readAll).toBe('function')
            expect(typeof store.readOne).toBe('function')

            // @ts-expect-error
            expect(() => store.create({ ...createTodo(), id: 2 })).toThrow();
            // @ts-expect-error
            expect(() => store.update({ ...createTodo(), id: 1, completed: true })).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose update() if only U = true', fakeAsync(() => {
        const UStore = signalStore(
            { providedIn: 'root' },
            withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
            withCrudConditional(TodoAllCRUDService, {
                create: false,
                readOne: false,
                readAll: false,
                update: true,
                delete: false,
            })
        );

        TestBed.runInInjectionContext(() => {
            const store = new UStore();

            expect(typeof store.update).toBe('function')

            // @ts-expect-error
            expect(() => store.readAll()).toThrow();
            // @ts-expect-error
            expect(() => store.readOne(1)).toThrow();
            // @ts-expect-error
            expect(() => store.create(createTodo())).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose delete() if only D = true', fakeAsync(() => {
        const DStore = signalStore(
            { providedIn: 'root' },
            withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
            withCrudConditional(TodoAllCRUDService, {
                create: false,
                readOne: false,
                readAll: false,
                update: false,
                delete: true,
            })
        );

        TestBed.runInInjectionContext(() => {
            const store = new DStore();

            expect(typeof store.delete).toBe('function')

            // @ts-expect-error
            expect(() => store.readAll()).toThrow();
            // @ts-expect-error
            expect(() => store.readOne(1)).toThrow();
            // @ts-expect-error
            expect(() => store.create(createTodo())).toThrow();
            // @ts-expect-error
            expect(() => store.update({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
})

let currentTodoId = 0;
const createTodo = (todo: Partial<Todo> = {}) => ({
    ...{
        id: ++currentTodoId,
        title: 'test',
        completed: false,
        userId: 4
    },
    ...todo
})