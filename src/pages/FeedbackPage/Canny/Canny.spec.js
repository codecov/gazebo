import Canny from './Canny'

describe('Canny', () => {
  const canny = new Canny({})

  it('defines render()', () => {
    expect(typeof canny.render).toBe('function')
  })
})
