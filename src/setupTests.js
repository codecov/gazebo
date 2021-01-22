/* eslint-disable no-extend-native */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// mock the timezone to always be GMT (https://stackoverflow.com/a/313792880)
const getTimezoneOffset = Date.prototype.getTimezoneOffset
beforeAll(() => {
  Date.prototype.getTimezoneOffset = () => 0
})

afterAll(() => {
  Date.prototype.getTimezoneOffset = getTimezoneOffset
})
