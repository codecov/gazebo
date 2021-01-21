import { getApiFilterEnum, normalizeFormData, ApiFilterEnum } from './helpers'

describe('getApiFilterEnum', () => {
  it('converts ""', () => {
    expect(getApiFilterEnum('')).toBe(ApiFilterEnum.none)
  })
  it('converts True', () => {
    expect(getApiFilterEnum('True')).toBe(ApiFilterEnum.true)
  })
  it('converts False', () => {
    expect(getApiFilterEnum('False')).toBe(ApiFilterEnum.false)
  })
  it('Unexpected is none', () => {
    expect(getApiFilterEnum('jijij')).toBe(ApiFilterEnum.none)
    expect(getApiFilterEnum(123)).toBe(ApiFilterEnum.none)
    expect(getApiFilterEnum({ foo: 'bar' })).toBe(ApiFilterEnum.none)
  })
})

// normalizeFormData for API requests, as Django has some odd behavior in string expectations
describe('normalizeFormData', () => {
  it('Undefined returns empty string', () => {
    expect(normalizeFormData({ test: undefined })).toStrictEqual({ test: '' })
  })
  it('string returns same string', () => {
    expect(normalizeFormData({ test: 'hello' })).toStrictEqual({
      test: 'hello',
    })
  })
  it('filter enum returns correct string for api', () => {
    expect(normalizeFormData({ test: ApiFilterEnum.true })).toStrictEqual({
      test: 'True',
    })
    expect(normalizeFormData({ test: ApiFilterEnum.false })).toStrictEqual({
      test: 'False',
    })
    expect(normalizeFormData({ test: ApiFilterEnum.none })).toStrictEqual({
      test: '',
    })
  })
})
