/*
  Mocking window was difficult, this is helpful for cleanup.
  Example use in ui/Banner.spec.js
  https://github.com/facebook/jest/issues/6798#issuecomment-486400590
*/
const mockWindowProperty = (property, value) => {
  const { [property]: originalProperty } = window
  delete window[property]
  beforeAll(() => {
    Object.defineProperty(window, property, {
      configurable: true,
      writable: true,
      value,
    })
  })
  afterAll(() => {
    window[property] = originalProperty
  })
}

export default mockWindowProperty
