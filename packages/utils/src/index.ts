export * from './comparison';

export type OmitTupleFirst<T extends Array<unknown>> =
    T extends [unknown, ...infer F]
    ? F
    : never
    ;

export type TupleFirst<T extends Array<unknown>> =
    T extends [infer F, ...unknown[]]
    ? F
    : never
    ;

export type MaybePromise<T = any> = T | Promise<T>;

export type Result =
    | { success: true; }
    | { success: false; error: Error };

export type NoReadonly<T> = { -readonly [P in keyof T]: T[P] };