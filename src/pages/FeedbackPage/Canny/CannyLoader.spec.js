import CannyLoader from './CannyLoader'

describe('CannyLoader', () => {
  const cannyLoader = new CannyLoader()

  it('has Canny property', () => {
    expect(cannyLoader).toHaveProperty('Canny')
  })

  it('defines load()', () => {
    expect(typeof cannyLoader.load).toBe('function')
  })
})
