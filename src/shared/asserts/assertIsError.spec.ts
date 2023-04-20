import { assertIsError } from './assertIsError'

describe('assertIsError', () => {
  it('should throw if error is not an instance of Error', () => {
    expect(() => assertIsError('not an error')).toThrow()
  })
  it('should not throw if error is an instance of Error', () => {
    expect(() => assertIsError(new Error('error'))).not.toThrow()
  })
})
