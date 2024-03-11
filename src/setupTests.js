// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

jest.mock('@sentry/react', () => {
  const originalModule = jest.requireActual('@sentry/react')
  return {
    ...originalModule,
    metrics: {
      ...originalModule.metrics,
      distribution: jest.fn(),
      gauge: jest.fn(),
      increment: jest.fn(),
      set: jest.fn(),
    },
  }
})
