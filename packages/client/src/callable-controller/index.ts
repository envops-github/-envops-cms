
export abstract class CallableController extends Function {
    constructor() {
        super();

        return new Proxy(this, {
            apply: (target, thisArg: unknown, argumentsList: any[]) => {
                return this.callable(...argumentsList)
            }
        });
    }

    protected abstract callable(...args: any[]): any;
}