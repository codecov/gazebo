// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

jest.mock('@sentry/react', () => {
  const originalModule = jest.requireActual('@sentry/react')
  return {
    ...originalModule,
    setUser: jest.fn(),
    metrics: {
      ...originalModule.metrics,
      distribution: jest.fn(),
      gauge: jest.fn(),
      increment: jest.fn(),
      set: jest.fn(),
    },
  }
})

global.matchMedia = (query) => {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}
