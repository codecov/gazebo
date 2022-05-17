import { imageReducer } from './hooks'

describe('imageReducer', () => {
  describe('type set to pending', () => {
    it('sets status to pending', () => {
      const { status } = imageReducer({}, { type: 'pending' })

      expect(status).toBe('pending')
    })
    it('sets src to undefined', () => {
      const { src } = imageReducer({}, { type: 'pending' })

      expect(src).toBeUndefined()
    })
    it('sets error to null', () => {
      const { error } = imageReducer({}, { type: 'pending' })

      expect(error).toBeNull()
    })
  })
  describe('type set to resolved', () => {
    it('sets status to resolved', () => {
      const { status } = imageReducer(
        {},
        { type: 'resolved', src: 'image.png' }
      )

      expect(status).toBe('resolved')
    })
    it('sets src to passed src', () => {
      const { src } = imageReducer({}, { type: 'resolved', src: 'image.png' })

      expect(src).toBe('image.png')
    })
    it('sets error to null', () => {
      const { error } = imageReducer({}, { type: 'resolved', src: 'image.png' })

      expect(error).toBeNull()
    })
  })
  describe('type set to rejected', () => {
    it('sets status to rejected', () => {
      const { status } = imageReducer({}, { type: 'rejected', error: true })

      expect(status).toBe('rejected')
    })
    it('sets src to undefined', () => {
      const { src } = imageReducer({}, { type: 'rejected', error: true })

      expect(src).toBeUndefined()
    })
    it('sets error to passed in error', () => {
      const { error } = imageReducer({}, { type: 'rejected', error: true })

      expect(error).toBeTruthy()
    })
  })
  describe('type set to unknown case', () => {
    it('throws an error', () => {
      expect(imageReducer({}, { type: 'unknown' })).toThrowError(
        'Unhandled action type: unknown'
      )
    })
  })
})
