"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Matchers_1 = require("./Matchers");
const checkCalledWith = (calledWithStack, actualArgs) => {
    const calledWithInstance = calledWithStack.find(instance => instance.args.every((matcher, i) => matcher instanceof Matchers_1.Matcher ? matcher.asymmetricMatch(actualArgs[i]) : actualArgs[i] === matcher));
    // @ts-ignore cannot return undefined, but this will fail the test if there is an expectation which is what we want
    return calledWithInstance ? calledWithInstance.calledWithFn(...actualArgs) : undefined;
};
exports.calledWithFn = () => {
    const fn = jest.fn();
    const calledWithStack = [];
    let hasImplementation = false;
    fn.calledWith = (...args) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args.
        // If that set of args is matched, we just call that jest.fn() for the result.
        const calledWithFn = jest.fn();
        if (!hasImplementation) {
            // Our original function gets a mock implementation which handles the matching
            fn.mockImplementation((...args) => checkCalledWith(calledWithStack, args));
        }
        calledWithStack.push({ args, calledWithFn });
        hasImplementation = true;
        return calledWithFn;
    };
    return fn;
};
exports.default = exports.calledWithFn;