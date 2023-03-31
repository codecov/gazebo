import { unsupportedExtensionsMapper } from './unsupportedExtensionsMapper'

describe('unsupportedExtensionsMapper', () => {
  describe('when called with a file with an invalid extension', () => {
    it('returns the proper value', () => {
      expect(unsupportedExtensionsMapper([{ text: 'file.jpg' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.aif' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.pdf' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.png' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.jpeg' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.gif' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.jpgv' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.mov' }])).toBe(true)
      expect(unsupportedExtensionsMapper([{ text: 'file.mp4' }])).toBe(true)
    })
  })

  describe('when called with a file with a valid extension', () => {
    it('returns false', () => {
      expect(unsupportedExtensionsMapper([{ text: 'file.py' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.js' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.c' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.java' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.cs' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.php' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.swift' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.vb' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.html' }])).toBe(false)
      expect(unsupportedExtensionsMapper([{ text: 'file.css' }])).toBe(false)
    })
  })
})
