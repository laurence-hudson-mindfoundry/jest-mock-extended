"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CalledWithFn_1 = __importDefault(require("./CalledWithFn"));
exports.mockClear = (mock) => {
    for (let key of Object.keys(mock)) {
        if (mock[key]._isMockObject) {
            exports.mockClear(mock[key]);
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
exports.mockReset = (mock) => {
    for (let key of Object.keys(mock)) {
        if (mock[key]._isMockObject) {
            exports.mockReset(mock[key]);
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
exports.mockDeep = (mockImplementation) => mock(mockImplementation, { deep: true });
const overrideMockImp = (obj, opts) => {
    const proxy = new Proxy(obj, handler(opts));
    for (let name of Object.keys(obj)) {
        if (typeof obj[name] === 'object' && obj[name] !== null) {
            proxy[name] = overrideMockImp(obj[name], opts);
        }
        else {
            proxy[name] = obj[name];
        }
    }
    return proxy;
};
const handler = (opts) => ({
    ownKeys(target) {
        return Reflect.ownKeys(target);
    },
    set: (obj, property, value) => {
        // @ts-ignore All of these ignores are due to https://github.com/microsoft/TypeScript/issues/1863
        obj[property] = value;
        return true;
    },
    get: (obj, property) => {
        var _a;
        let fn = CalledWithFn_1.default();
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
            if (((_a = opts) === null || _a === void 0 ? void 0 : _a.deep) && property !== 'calls') {
                // @ts-ignore
                obj[property] = new Proxy(fn, handler(opts));
                // @ts-ignore
                obj[property]._isMockObject = true;
            }
            else {
                // @ts-ignore
                obj[property] = CalledWithFn_1.default();
            }
        }
        // @ts-ignore
        return obj[property];
    }
});
const mock = (mockImplementation = {}, opts) => {
    // @ts-ignore private
    mockImplementation._isMockObject = true;
    return overrideMockImp(mockImplementation, opts);
};
exports.default = mock;