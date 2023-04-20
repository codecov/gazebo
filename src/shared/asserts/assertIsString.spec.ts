import { assertIsString } from './assertIsString'

describe('assertIsString', () => {
  it('should throw if value is not a string', () => {
    expect(() => assertIsString(123)).toThrow()
  })
  it('should not throw if value is a string', () => {
    expect(() => assertIsString('string')).not.toThrow()
  })
})
