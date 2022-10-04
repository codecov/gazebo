import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'

import { ThemeContext, ThemeContextProvider } from './ThemeContext'

const TestComponent = () => {
  const { setTheme } = useContext(ThemeContext)

  return (
    <div>
      <h1>Test theme context</h1>
      <button onClick={() => setTheme('color-blind')}>set theme</button>
    </div>
  )
}

describe('Theme context', () => {
  function setup() {
    window.localStorage.__proto__.setItem = jest.fn()
    window.localStorage.__proto__.getItem = jest.fn()

    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })
    it('renders with default theme', () => {
      const theme = window.localStorage.getItem('current-theme')

      expect(window.localStorage.getItem).toBeCalled()
      expect(theme).toBeUndefined()
    })

    it('sets localStorage current-theme to the expected theme', () => {
      userEvent.click(screen.getByText('set theme'))

      expect(window.localStorage.setItem).toBeCalledWith(
        'current-theme',
        'color-blind'
      )
    })
  })
})
