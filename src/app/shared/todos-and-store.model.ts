import { Observable } from "rxjs";

// Gaurantees minimum identifier + type
export type BaseEntity = { id: number };

// Minimum for CRUD feature
export type BaseState<Entity> = {
    selectedItem: Entity | null;
    items: Entity[];
    loading: boolean;
};

// The users can implement a `Partial` (or to be more precise use a `Pick`)
//     of this service, provided that it matches the respective CrudConfig options.
// The feature uses non-null assertions (`!`) internally with the
//     assumption that the `CrudConfig` is valid to what the
//     implementing service offers.
export interface CrudService<T> {
    readAll(): Observable<T[]>;

    readOne(id: number): Observable<T>;

    create(value: T): Observable<T>;

    update(value: T): Observable<T>;

    delete(value: T): Observable<any>;
}

// Actual model
export interface TodoState extends BaseState<Todo> { }
export interface Todo extends BaseEntity {
    title: string;
    completed: boolean;
    userId: number;
}