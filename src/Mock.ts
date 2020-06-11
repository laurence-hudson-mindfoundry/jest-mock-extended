import calledWithFn from './CalledWithFn';
import { MatchersOrLiterals } from './Matchers';
import { DeepPartial } from 'ts-essentials';

type ProxiedProperty = string | number | symbol;

export interface CalledWithMock<T, Y extends any[]> extends jest.Mock<T, Y> {
    calledWith: (...args: Y | MatchersOrLiterals<Y>) => jest.Mock<T, Y>;
}

export type MockProxy<T> = {
    // This supports deep mocks in the else branch
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> & T[K] : MockProxy<T[K]> & T[K];
};

export interface MockOpts {
    deep?: boolean;
}

export const mockClear = (mock: MockProxy<any>) => {
    for (let key of Object.keys(mock)) {
        if (mock[key]._isMockObject) {
            mockClear(mock[key]);
        }

        if (mock[key]._isMockFunction) {
            mock[key].mockClear();
        }
    }

    // This is a catch for if they pass in a jest.fn()
    if (!mock._isMockObject) {
        return mock.mockClear();
    }
};


export const mockReset = (mock: MockProxy<any>) => {
    for (let key of Object.keys(mock)) {
        if (mock[key]._isMockObject) {
            mockReset(mock[key]);
        }
        if (mock[key]._isMockFunction) {
            mock[key].mockReset();
        }
    }

    // This is a catch for if they pass in a jest.fn()
    // Worst case, we will create a jest.fn() (since this is a proxy)
    // below in the get and call mockReset on it
    if (!mock._isMockObject) {
        return mock.mockReset();
    }
};

export const mockDeep = <T>(mockImplementation?: DeepPartial<T>): MockProxy<T> & T => mock(mockImplementation, { deep: true });

const overrideMockImp = (obj: DeepPartial<any>, opts?: MockOpts) => {
    const proxy = new Proxy<MockProxy<any>>(obj, handler(opts));
    for (let name of Object.keys(obj)) {
        if (typeof obj[name] === 'object' && obj[name] !== null) {
            proxy[name] = overrideMockImp(obj[name], opts);
        } else {
            proxy[name] = obj[name];
        }
    }

    return proxy;
};

const handler = (opts?: MockOpts) => ({
    ownKeys (target: MockProxy<any>) {
        return Reflect.ownKeys(target);
    },

    set: (obj: MockProxy<any>, property: ProxiedProperty, value: any) => {
        // @ts-ignore All of these ignores are due to https://github.com/microsoft/TypeScript/issues/1863
        obj[property] = value;
        return true;
    },

    get: (obj: MockProxy<any>, property: ProxiedProperty) => {
        let fn = calledWithFn();

        // @ts-ignore
        if (!(property in obj)) {
            // This condition is required to use the mock object in the promise.
            // For example Promise.resolve (layout) and async return values.
            // These solutions check the "then" property.
            // If "then" is function, then call it else return mock object.
            if (property === 'then') {
                return undefined;
            }
            // Jest's internal equality checking does some wierd stuff to check for iterable equality
            if (property === Symbol.iterator) {
                // @ts-ignore
                return obj[property];
            }
            // So this calls check here is totally not ideal - jest internally does a
            // check to see if this is a spy - which we want to say no to, but blindly returning
            // an proxy for calls results in the spy check returning true. This is another reason
            // why deep is opt in.
            if (opts?.deep && property !== 'calls') {
                // @ts-ignore
                obj[property] = new Proxy<MockProxy<any>>(fn, handler(opts));
                // @ts-ignore
                obj[property]._isMockObject = true;
            } else {
                // @ts-ignore
                obj[property] = calledWithFn();
            }
        }
        // @ts-ignore
        return obj[property];
    }
});

const mock = <T>(mockImplementation: DeepPartial<T> = {} as DeepPartial<T>, opts?: MockOpts): MockProxy<T> & T => {
    // @ts-ignore private
    mockImplementation!._isMockObject = true;
    return overrideMockImp(mockImplementation, opts);
};

export default mock;
