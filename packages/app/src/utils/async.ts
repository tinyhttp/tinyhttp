export const isAsync = (fn: Function | ((...args: any[]) => Promise<any>)) => fn[Symbol.toStringTag] === 'AsyncFunction'
