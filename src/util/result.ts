export class Result<T> {
  value: T | undefined
  error: Error | undefined
  constructor(value: T, error?: Error | undefined) {
    this.value = value
    this.error = error
  }
  just(): T {
    if (this.value === undefined) {
      throw new Error('Result is nothing')
    }
    return this.value
  }
  getError(): Error {
    if (this.error === undefined) {
      throw new Error('This result has no error')
    }
    return this.error
  }
  isOk(): boolean {
    return this.error === undefined
  }
}
