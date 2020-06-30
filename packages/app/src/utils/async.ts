export const isAsync = (fn: Function) => fn[Symbol.toStringTag] === 'AsyncFunction'
