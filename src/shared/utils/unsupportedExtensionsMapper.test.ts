import { unsupportedExtensionsMapper } from './unsupportedExtensionsMapper'

describe('unsupportedExtensionsMapper', () => {
  describe('when called with a file with an invalid extension', () => {
    it('returns the proper value', () => {
      expect(unsupportedExtensionsMapper({ path: 'file.jpg' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.aif' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.pdf' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.png' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.jpeg' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.gif' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.jpgv' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.mov' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.mp4' })).toBe(true)
      expect(unsupportedExtensionsMapper({ path: 'file.vtf' })).toBe(true)
    })
  })

  describe('when called with a file with a valid extension', () => {
    it('returns false', () => {
      expect(unsupportedExtensionsMapper({ path: 'file.py' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.js' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.c' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.java' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.cs' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.php' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.swift' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.vb' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.html' })).toBe(false)
      expect(unsupportedExtensionsMapper({ path: 'file.css' })).toBe(false)
    })
  })
})
