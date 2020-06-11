"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// needs to be a class so we can instanceof
class Matcher {
    constructor(matcher) {
        this.asymmetricMatch = matcher;
    }
}
exports.Matcher = Matcher;
exports.any = () => new Matcher(() => true);
exports.anyBoolean = () => new Matcher((actualValue) => typeof actualValue === 'boolean');
exports.anyNumber = () => new Matcher(actualValue => typeof actualValue === 'number' && !isNaN(actualValue));
exports.anyString = () => new Matcher((actualValue) => typeof actualValue === 'string');
exports.anyFunction = () => new Matcher((actualValue) => typeof actualValue === 'function');
exports.anySymbol = () => new Matcher(actualValue => typeof actualValue === 'symbol');
exports.anyObject = () => new Matcher(actualValue => typeof actualValue === 'object' && actualValue !== null);
exports.anyArray = () => new Matcher(actualValue => Array.isArray(actualValue));
exports.anyMap = () => new Matcher(actualValue => actualValue instanceof Map);
exports.anySet = () => new Matcher(actualValue => actualValue instanceof Set);
exports.isA = clazz => new Matcher(actualValue => actualValue instanceof clazz);
exports.arrayIncludes = arrayVal => new Matcher(actualValue => Array.isArray(actualValue) && actualValue.includes(arrayVal));
exports.setHas = arrayVal => new Matcher(actualValue => exports.anySet().asymmetricMatch(actualValue) && actualValue.has(arrayVal));
exports.mapHas = mapVal => new Matcher(actualValue => exports.anyMap().asymmetricMatch(actualValue) && actualValue.has(mapVal));
exports.objectContainsKey = key => new Matcher(actualValue => exports.anyObject().asymmetricMatch(actualValue) && actualValue[key] !== undefined);
exports.objectContainsValue = value => new Matcher(actualValue => exports.anyObject().asymmetricMatch(actualValue) && Object.values(actualValue).includes(value));
exports.notNull = () => new Matcher(actualValue => actualValue !== null);
exports.notUndefined = () => new Matcher(actualValue => actualValue !== undefined);
exports.notEmpty = () => new Matcher(actualValue => actualValue !== null && actualValue !== undefined && actualValue !== '');