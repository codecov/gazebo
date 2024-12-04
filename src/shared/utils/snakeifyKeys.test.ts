import { snakeifyKeys } from './snakeifyKeys'

describe('snakeifyKeys', () => {
  it('converts an object from CamelCast to SnakeCase', () => {
    expect(snakeifyKeys({ fooBar: 1, bizBaz: 3 })).toStrictEqual({
      foo_bar: 1,
      biz_baz: 3,
    })
  })

  it('else passes through', () => {
    expect(snakeifyKeys([1, 2, 3])).toStrictEqual([1, 2, 3])
    // @ts-expect-error
    expect(snakeifyKeys(1)).toStrictEqual(1)
    // @ts-expect-error
    expect(snakeifyKeys('test')).toStrictEqual('test')
  })
})
