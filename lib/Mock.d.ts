/// <reference types="jest" />
import { MatchersOrLiterals } from './Matchers';
import { DeepPartial } from 'ts-essentials';
export interface CalledWithMock<T, Y extends any[]> extends jest.Mock<T, Y> {
    calledWith: (...args: Y | MatchersOrLiterals<Y>) => jest.Mock<T, Y>;
}
export declare type MockProxy<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> & T[K] : MockProxy<T[K]> & T[K];
};
export interface MockOpts {
    deep?: boolean;
}
export declare const mockClear: (mock: MockProxy<any>) => any;
export declare const mockReset: (mock: MockProxy<any>) => any;
export declare const mockDeep: <T>(mockImplementation?: DeepPartial<T> | undefined) => MockProxy<T> & T;
declare const mock: <T>(mockImplementation?: DeepPartial<T>, opts?: MockOpts | undefined) => MockProxy<T> & T;
export default mock;