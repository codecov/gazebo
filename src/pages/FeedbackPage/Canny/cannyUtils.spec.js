import { Canny, CannyLoader } from './cannyUtils'

describe('Canny', () => {
  const canny = new Canny({})

  it('defines render()', () => {
    expect(typeof canny.render).toBe('function')
  })
})

describe('CannyLoader', () => {
  const cannyLoader = new CannyLoader()

  it('has Canny property', () => {
    expect(cannyLoader).toHaveProperty('Canny')
  })

  it('defines load()', () => {
    expect(typeof cannyLoader.load).toBe('function')
  })
})
