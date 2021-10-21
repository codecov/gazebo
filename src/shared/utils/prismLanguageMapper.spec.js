import { prismLanguageMapper } from './prismLanguageMapper'

describe('prismLanguageMapper', () => {
  describe('when called with a file with a valid extension', () => {
    it('returns the proper value', () => {
      expect(prismLanguageMapper('file.py')).toBe('python')
      expect(prismLanguageMapper('file.js')).toBe('javascript')
      expect(prismLanguageMapper('file.sh')).toBe('bash')
      expect(prismLanguageMapper('file.c')).toBe('c')
      expect(prismLanguageMapper('file.cpp')).toBe('cpp')
      expect(prismLanguageMapper('file.go')).toBe('go')
      expect(prismLanguageMapper('file.ts')).toBe('typescript')
      expect(prismLanguageMapper('file.yaml')).toBe('yaml')
    })
  })

  describe('when called with a file with an invalid extension', () => {
    it('returns the undefined', () => {
      expect(prismLanguageMapper('file.omgwhatisdis')).toBe(undefined)
    })
  })
})
