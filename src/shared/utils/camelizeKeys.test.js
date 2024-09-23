import { camelizeKeys } from './camelizeKeys'

describe('camelizeKeys', () => {
  it('converts an object from snake_case to camelCase', () => {
    expect(camelizeKeys({ foo_bar: 1, biz_baz: 3 })).toStrictEqual({
      fooBar: 1,
      bizBaz: 3,
    })
  })

  it('converts an array of objects from snake_case to camelCase', () => {
    expect(camelizeKeys([{ foo_bar: 1 }, { biz_baz: 3 }])).toStrictEqual([
      { fooBar: 1 },
      { bizBaz: 3 },
    ])
  })

  it('else passes through', () => {
    expect(camelizeKeys([1, 2, 3])).toStrictEqual([1, 2, 3])
    expect(camelizeKeys(1)).toStrictEqual(1)
    expect(camelizeKeys('test')).toStrictEqual('test')
    expect(camelizeKeys()).toStrictEqual({})
  })
})
