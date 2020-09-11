export const isAsync = (fn: (...args: any[]) => any | ((...args: any[]) => Promise<any>)) => fn[Symbol.toStringTag] === 'AsyncFunction'
