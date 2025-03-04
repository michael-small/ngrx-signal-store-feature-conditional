import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { initialState, Todo } from '../todo.service';
import { Observable, of } from 'rxjs';
import { CrudService, withCrudConditional } from './basic-conditional.store.feature';
import { signalStore, withHooks, withState } from '@ngrx/signals';

describe('withCrudConditional', () => {
    it('should do all CRUD if all enabled', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
            const store = new AllCRUDStore();

            tick();
            expect(store.items().length).toBe(0);

            store.getAll();
            tick();
            expect(store.items().length).toBe(1);

            store.create({ ...createTodo(), id: 2 })
            tick();
            expect(store.items().length).toBe(2)

            store.getOne(1)
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
        TestBed.runInInjectionContext(() => {
            const store = new CStore();

            expect(typeof store.create).toBe('function')

            // @ts-expect-error
            expect(() => store.getAll()).toThrow();
            // @ts-expect-error
            expect(() => store.getOne(1)).toThrow();
            // @ts-expect-error
            expect(() => store.update({ ...createTodo(), id: 1, completed: true })).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose getOne() and getAll() if only R = true', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
            const store = new RStore();

            store.getAll();
            store.getOne(1);

            expect(typeof store.getAll).toBe('function')
            expect(typeof store.getOne).toBe('function')

            // @ts-expect-error
            expect(() => store.create({ ...createTodo(), id: 2 })).toThrow();
            // @ts-expect-error
            expect(() => store.update({ ...createTodo(), id: 1, completed: true })).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose update() if only U = true', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
            const store = new UStore();

            expect(typeof store.update).toBe('function')

            // @ts-expect-error
            expect(() => store.getAll()).toThrow();
            // @ts-expect-error
            expect(() => store.getOne(1)).toThrow();
            // @ts-expect-error
            expect(() => store.create(createTodo())).toThrow();
            // @ts-expect-error
            expect(() => store.delete({ ...createTodo(), id: 2 })).toThrow();
        });
    }))
    it('should do expose delete() if only D = true', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
            const store = new DStore();

            expect(typeof store.delete).toBe('function')

            // @ts-expect-error
            expect(() => store.getAll()).toThrow();
            // @ts-expect-error
            expect(() => store.getOne(1)).toThrow();
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

@Injectable({
    providedIn: 'root',
})
export class TodoAllCRUDService implements CrudService<Todo> {
    getOne(id: number) {
        return of(createTodo({ id: id }))
    }

    getAll(): Observable<Todo[]> {
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

const AllCRUDStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudConditional(TodoAllCRUDService, {
        create: true,
        read: true,
        update: true,
        delete: true,
    }),
    withHooks({
        onInit(store) {
            currentTodoId = 0;
        },
    }),
);

const CStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withCrudConditional(TodoAllCRUDService, {
        create: true,
        read: false,
        update: false,
        delete: false,
    })
);
const RStore = signalStore(
    { providedIn: 'root' },
    withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
    withCrudConditional(TodoAllCRUDService, {
        create: false,
        read: true,
        update: false,
        delete: false,
    })
);
const UStore = signalStore(
    { providedIn: 'root' },
    withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
    withCrudConditional(TodoAllCRUDService, {
        create: false,
        read: false,
        update: true,
        delete: false,
    })
);
const DStore = signalStore(
    { providedIn: 'root' },
    withState({ ...initialState, items: [{ ...createTodo(), id: 1 }] }),
    withCrudConditional(TodoAllCRUDService, {
        create: false,
        read: false,
        update: false,
        delete: true,
    })
);