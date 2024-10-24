import { ApiFilterEnum, normalizeFormData } from './normalize'

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
  it('numbers returns same number', () => {
    expect(normalizeFormData({ test: 9999 })).toStrictEqual({
      test: 9999,
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
