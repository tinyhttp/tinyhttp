export interface Store {
  incr: (key: string, callback: (error: Error | null, hits: number, resetTime: Date) => void) => void
  decrement: (key: string) => void
  resetAll: () => void
  resetKey: (key: string) => void
}

export class MemoryStore implements Store {
  hits = {}
  resetTime: Date

  constructor(private windowMs: number) {
    this.resetTime = this.calculateNextResetTime(windowMs)

    const interval = setInterval(this.resetAll, windowMs)
    if (interval.unref) {
      interval.unref()
    }
  }

  incr = async (key: string, callback: (error: Error | null, hits: number, resetTime: Date) => void) => {
    if (this.hits[key]) {
      this.hits[key]++
    } else {
      this.hits[key] = 1
    }

    callback(null, this.hits[key], this.resetTime)
  }

  decrement(key: string) {
    if (this.hits[key]) {
      this.hits[key]--
    }
  }

  resetAll = () => {
    this.hits = {}
    this.resetTime = this.calculateNextResetTime(this.windowMs)
  }

  resetKey(key: string) {
    delete this.hits[key]
  }

  calculateNextResetTime(windowMs) {
    const nextResetDate = new Date()
    nextResetDate.setMilliseconds(nextResetDate.getMilliseconds() + windowMs)
    return nextResetDate
  }
}
