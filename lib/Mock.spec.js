"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mock_1 = __importStar(require("./Mock"));
const Matchers_1 = require("./Matchers");
const CalledWithFn_1 = __importDefault(require("./CalledWithFn"));
class Test1 {
    constructor(id) {
        this.deepProp = new Test2();
        this.id = id;
        this.anotherPart = id;
    }
    ofAnother(test) {
        return test.getNumber();
    }
    getNumber() {
        return this.id;
    }
    getSomethingWithArgs(arg1, arg2) {
        return this.id;
    }
}
class Test2 {
    constructor() {
        this.deeperProp = new Test3();
    }
    getNumber(num) {
        return num * 2;
    }
    getAnotherString(str) {
        return `${str} another string`;
    }
}
class Test3 {
    getNumber(num) {
        return num ^ 2;
    }
}
describe('jest-mock-extended', () => {
    test('Can be assigned back to itself even when there are private parts', () => {
        // No TS errors here
        const mockObj = Mock_1.default();
        // No error here.
        new Test1(1).ofAnother(mockObj);
        expect(mockObj.getNumber).toHaveBeenCalledTimes(1);
    });
    test('Check that a jest.fn() is created without any invocation to the mock method', () => {
        const mockObj = Mock_1.default();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(0);
    });
    test('Check that invocations are registered', () => {
        const mockObj = Mock_1.default();
        mockObj.getNumber();
        mockObj.getNumber();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(2);
    });
    test('Can mock a return value', () => {
        const mockObj = Mock_1.default();
        mockObj.getNumber.mockReturnValue(12);
        expect(mockObj.getNumber()).toBe(12);
    });
    test('Can specify args', () => {
        const mockObj = Mock_1.default();
        mockObj.getSomethingWithArgs(1, 2);
        expect(mockObj.getSomethingWithArgs).toBeCalledWith(1, 2);
    });
    test('Can specify calledWith', () => {
        const mockObj = Mock_1.default();
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(1);
        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(1);
    });
    test('Can specify multiple calledWith', () => {
        const mockObj = Mock_1.default();
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
        mockObj.getSomethingWithArgs.calledWith(6, 7).mockReturnValue(13);
        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        expect(mockObj.getSomethingWithArgs(6, 7)).toBe(13);
    });
    test('Can set props', () => {
        const mockObj = Mock_1.default();
        mockObj.id = 17;
        expect(mockObj.id).toBe(17);
    });
    test('Can set false and null boolean props', () => {
        const mockObj = Mock_1.default({
            someValue: false
        });
        const mockObj2 = Mock_1.default({
            someValue: null
        });
        expect(mockObj.someValue).toBe(false);
        expect(mockObj2.someValue).toBe(null);
    });
    test('can set undefined explicitly', () => {
        const mockObj = Mock_1.default({
            someValue: undefined // this is intentionally set to undefined
        });
        expect(mockObj.someValue).toBe(undefined);
    });
    test('Equals self', () => {
        const mockObj = Mock_1.default();
        expect(mockObj).toBe(mockObj);
        expect(mockObj).toEqual(mockObj);
        const spy = jest.fn();
        spy(mockObj);
        expect(spy).toHaveBeenCalledWith(mockObj);
    });
    describe('calledWith', () => {
        test('can use calledWith without mock', () => {
            const mockFn = CalledWithFn_1.default();
            mockFn.calledWith(Matchers_1.anyNumber(), Matchers_1.anyNumber()).mockReturnValue(3);
            expect(mockFn(1, 2)).toBe(3);
        });
        test('Can specify matchers', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(Matchers_1.anyNumber(), Matchers_1.anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });
        test('does not match when one arg does not match Matcher', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(Matchers_1.anyNumber(), Matchers_1.anyNumber()).mockReturnValue(3);
            // @ts-ignore
            expect(mockObj.getSomethingWithArgs('1', 2)).toBe(undefined);
        });
        test('can use literals', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });
        test('can mix Matchers with literals', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(1, Matchers_1.anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });
        test('supports multiple calledWith', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(2, Matchers_1.anyNumber()).mockReturnValue(4);
            mockObj.getSomethingWithArgs.calledWith(1, Matchers_1.anyNumber()).mockReturnValue(3);
            mockObj.getSomethingWithArgs.calledWith(6, Matchers_1.anyNumber()).mockReturnValue(7);
            expect(mockObj.getSomethingWithArgs(2, 2)).toBe(4);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            expect(mockObj.getSomethingWithArgs(6, 2)).toBe(7);
            expect(mockObj.getSomethingWithArgs(7, 2)).toBe(undefined);
        });
    });
    describe('Matchers with toHaveBeenCalledWith', () => {
        it('matchers allow all args to be Matcher based', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(Matchers_1.anyNumber(), Matchers_1.anyNumber());
        });
        it('matchers allow for a mix of Matcher and literal', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(Matchers_1.anyNumber(), 4);
        });
        it('matchers allow for not.toHaveBeenCalledWith', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).not.toHaveBeenCalledWith(Matchers_1.anyNumber(), 5);
        });
    });
    describe('Deep mock support', () => {
        test('can deep mock members', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
        });
        test('three level deep mock', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.deeperProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.deeperProp.getNumber(1)).toBe(4);
        });
        test('maintains API for deep mocks', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.getNumber(100);
            expect(mockObj.deepProp.getNumber.mock.calls[0][0]).toBe(100);
        });
        test('non deep expectation work as expected', () => {
            const mockObj = Mock_1.mockDeep();
            new Test1(1).ofAnother(mockObj);
            expect(mockObj.getNumber).toHaveBeenCalledTimes(1);
        });
        test('deep expectation work as expected', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.getNumber(2);
            expect(mockObj.deepProp.getNumber).toHaveBeenCalledTimes(1);
        });
    });
    describe('mock implementation support', () => {
        test('can provide mock implementation for props', () => {
            const mockObj = Mock_1.default({
                id: 61
            });
            expect(mockObj.id).toBe(61);
        });
        test('can provide mock implementation for functions', () => {
            const mockObj = Mock_1.default({
                getNumber: () => {
                    return 150;
                }
            });
            expect(mockObj.getNumber()).toBe(150);
        });
        test('Partially mocked implementations can have non-mocked function expectations', () => {
            const mockObj = Mock_1.default({
                getNumber: () => {
                    return 150;
                }
            });
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });
        test('can provide deep mock implementations', () => {
            const mockObj = Mock_1.mockDeep({
                deepProp: {
                    getNumber: (num) => {
                        return 76;
                    }
                }
            });
            expect(mockObj.deepProp.getNumber(123)).toBe(76);
        });
        test('Partially mocked implementations of deep mocks can have non-mocked function expectations', () => {
            const mockObj = Mock_1.mockDeep({
                deepProp: {
                    getNumber: (num) => {
                        return 76;
                    }
                }
            });
            mockObj.deepProp.getAnotherString.calledWith('abc').mockReturnValue('this string');
            expect(mockObj.deepProp.getAnotherString('abc')).toBe('this string');
        });
    });
    describe('Promise', () => {
        test('Can return as Promise.resolve', async () => {
            const mockObj = Mock_1.default();
            mockObj.id = 17;
            const promiseMockObj = Promise.resolve(mockObj);
            await expect(promiseMockObj).resolves.toBeDefined();
            await expect(promiseMockObj).resolves.toMatchObject({ id: 17 });
        });
        test('Can return as Promise.reject', async () => {
            const mockError = Mock_1.default();
            mockError.message = '17';
            const promiseMockObj = Promise.reject(mockError);
            try {
                await promiseMockObj;
                fail('Promise must be rejected');
            }
            catch (e) {
                await expect(e).toBeDefined();
                await expect(e).toBe(mockError);
                await expect(e).toHaveProperty('message', '17');
            }
            await expect(promiseMockObj).rejects.toBeDefined();
            await expect(promiseMockObj).rejects.toBe(mockError);
            await expect(promiseMockObj).rejects.toHaveProperty('message', '17');
        });
        test('Can mock a then function', async () => {
            const mockPromiseObj = Promise.resolve(42);
            const mockObj = Mock_1.default();
            mockObj.id = 17;
            // @ts-ignore
            mockObj.then = mockPromiseObj.then.bind(mockPromiseObj);
            const promiseMockObj = Promise.resolve(mockObj);
            await promiseMockObj;
            await expect(promiseMockObj).resolves.toBeDefined();
            await expect(promiseMockObj).resolves.toEqual(42);
        });
    });
    describe('clearing / resetting', () => {
        it('mockReset supports jest.fn()', () => {
            const fn = jest.fn().mockImplementation(() => true);
            expect(fn()).toBe(true);
            Mock_1.mockReset(fn);
            expect(fn()).toBe(undefined);
        });
        it('mockClear supports jest.fn()', () => {
            const fn = jest.fn().mockImplementation(() => true);
            fn();
            expect(fn.mock.calls.length).toBe(1);
            Mock_1.mockClear(fn);
            expect(fn.mock.calls.length).toBe(0);
        });
        it('mockReset object', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(1, Matchers_1.anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            Mock_1.mockReset(mockObj);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(undefined);
        });
        it('mockClear object', () => {
            const mockObj = Mock_1.default();
            mockObj.getSomethingWithArgs.calledWith(1, Matchers_1.anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(1);
            Mock_1.mockClear(mockObj);
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(0);
            // Does not clear mock implementations of calledWith
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });
        it('mockReset deep', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
            Mock_1.mockReset(mockObj);
            expect(mockObj.deepProp.getNumber(1)).toBe(undefined);
        });
        it('mockClear deep', () => {
            const mockObj = Mock_1.mockDeep();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(1);
            Mock_1.mockClear(mockObj);
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(0);
            // Does not clear mock implementations of calledWith
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
        });
    });
});