import { setFileLabel } from './setFileLabel'

describe('setFileLabel', () => {
  describe('file is new', () => {
    it('returns new', () => {
      const data = setFileLabel({ isNewFile: true })

      expect(data).toBe('New')
    })
  })

  describe('file is renamed', () => {
    it('returns renamed', () => {
      const data = setFileLabel({ isRenamedFile: true })

      expect(data).toBe('Renamed')
    })
  })

  describe('file is deleted', () => {
    it('returns deleted', () => {
      const data = setFileLabel({ isDeletedFile: true })

      expect(data).toBe('Deleted')
    })
  })

  describe('file is not modified', () => {
    it('returns null', () => {
      const data = setFileLabel({})

      expect(data).toBeNull()
    })
  })
})
