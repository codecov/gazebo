import { kebabifyKeys } from './kebabifyKeys'

describe('kebabifyKeys', () => {
  it('converts an object from CamelCase to KebabCase', () => {
    expect(kebabifyKeys({ fooBar: 1, bizBaz: 3 })).toStrictEqual({
      'foo-bar': 1,
      'biz-baz': 3,
    })
  })

  it('else passes through', () => {
    expect(kebabifyKeys([1, 2, 3])).toStrictEqual([1, 2, 3])
    expect(kebabifyKeys(1)).toStrictEqual(1)
    expect(kebabifyKeys('test')).toStrictEqual('test')
  })
})
