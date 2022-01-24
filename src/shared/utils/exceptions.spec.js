import { NotFoundException } from './exceptions'
describe('expection objects', () => {
  describe('Not Found', () => {
    it('sets a status', () => {
      const errorObject = new NotFoundException()
      expect(errorObject.status).toBe('404')
    })

    it('sets a name', () => {
      const errorObject = new NotFoundException()
      expect(errorObject.name).toBe('Not Found')
    })
  })
})
