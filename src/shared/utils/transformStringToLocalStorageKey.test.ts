import { transformStringToLocalStorageKey } from './transformStringToLocalStorageKey'

describe('whitespace to underscore regex', () => {
  it('replaces single spaces with underscores', () => {
    expect(transformStringToLocalStorageKey('hello world')).toBe('hello_world')
  })

  it('replaces multiple consecutive spaces with underscores', () => {
    expect(transformStringToLocalStorageKey('hello    world')).toBe(
      'hello____world'
    )
  })

  it('replaces different types of whitespace', () => {
    expect(transformStringToLocalStorageKey('hello\tworld\ntest')).toBe(
      'hello_world_test'
    )
  })

  it('handles strings with no whitespace', () => {
    expect(transformStringToLocalStorageKey('helloworld')).toBe('helloworld')
  })

  it('handles strings with only whitespace', () => {
    expect(transformStringToLocalStorageKey('   ')).toBe('___')
  })

  it('handles empty strings', () => {
    expect(transformStringToLocalStorageKey('')).toBe('')
  })
})
