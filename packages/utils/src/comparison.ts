export type ComparisonStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export type Comparison<T = any> =
    T extends any[] ?
    Comparison<T[number]>[]
    :
    T extends string | number | boolean ?
    PrimitiveComparison<T> : {
        status: ComparisonStatus
    } & { [P in keyof T]: Comparison<T[P]> }

export type PrimitiveComparison<T = any> = {
    status: ComparisonStatus,
    source?: T,
    target?: T
}

export function valueFromComparison<T = any>(comparison: PrimitiveComparison<T>): T {
    return comparison.target ?? comparison.source as T;
}


export function compareItems(source: any, target: any): {
    status: ComparisonStatus,
    source?: any,
    target?: any
} {

    let status: ComparisonStatus = 'unchanged';

    if (source !== target) status = 'changed';
    if (source === undefined) status = 'added';
    if (target === undefined) status = 'removed';
    if (source === target) status = 'unchanged';

    return {
        status,
        source,
        target
    }
}

export function matchArrays<T extends Array<any>>(sourceArr: T, targetArr: T, matcher: (sourceItem: T[number], targetItem: T[number]) => boolean): { source?: T[number], target?: T[number] }[] {

    return [...(sourceArr || []).map(sourceItem => {
        const targetItem = (targetArr || []).find(targetItem => matcher(sourceItem, targetItem));
        return { source: sourceItem, target: targetItem }
    }), ...(targetArr || []).filter(targetItem => !(sourceArr || []).some(srcItem => matcher(srcItem, targetItem)))
        .map(targetItem => {
            return { source: undefined, target: targetItem }
        })
    ];
}

export type ComparisonSchema = {
    matcher?: (source: any, target: any) => boolean,
    children?: {
        [key: string]: ComparisonSchema | true
    }
}

export function compare<T = any>(source?: T, target?: T, schema?: { [key: string]: ComparisonSchema | true }): Comparison<T> {

        // console.log(schema)
        // console.log(source)
        // console.log(target)
        // console.log('---------------------------')


    schema = schema || {};

    let status: ComparisonStatus = 'unchanged';

    let comparison = Object.fromEntries(Object.entries(schema).map(([k, _]) => {

        if (schema[k] === true) {
            //@ts-expect-error assumes schema and input types match
            return [k, compareItems(source?.[k], target?.[k])]
        }

        if (schema[k].matcher) {
            //@ts-expect-error assumes schema and input types match
            const matchedArrays = matchArrays(source?.[k], target?.[k], schema[k].matcher)
            return [k, matchedArrays.map(i => {
                //@ts-expect-error schema[k] is definetly an object
                return compare(i.source, i.target, schema?.[k].children)
            })]
        }

        return [k,
            compare(source?.[k as keyof typeof source], target?.[k as keyof typeof target], schema?.[k].children)
        ]
    }));

    //@ts-expect-error
    if (Object.values(comparison).some(v => Array.isArray(v) ? v.some(i => i.status !== 'unchanged') : v.status !== 'unchanged')) {
        status = 'changed'
    }

    if (!source) status = 'added';
    if (!target) status = 'removed';
    if (source === target) {
        status = 'unchanged';
    }

    return {
        ...comparison,
        status
    }
}
