import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'

import { Theme, ThemeContext, ThemeContextProvider } from './ThemeContext'

const TestComponent = () => {
  const { setTheme } = useContext(ThemeContext)

  return (
    <div>
      <button onClick={() => setTheme(Theme.DARK)}>set theme</button>
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
      const theme = window.localStorage.getItem('theme')

      expect(window.localStorage.getItem).toHaveBeenCalled()
      expect(theme).toBeUndefined()
    })

    it('sets localStorage theme to the expected theme', async () => {
      userEvent.click(screen.getByText('set theme'))

      await waitFor(() =>
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'theme',
          'dark'
        )
      )
    })
  })
})
