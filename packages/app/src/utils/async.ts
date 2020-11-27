export const isAsync = (fn: (...args: any[]) => any | ((...args: any[]) => Promise<any>)): boolean =>
  fn[Symbol.toStringTag] === 'AsyncFunction'
