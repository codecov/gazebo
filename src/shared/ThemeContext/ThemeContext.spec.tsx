import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Theme, ThemeContextProvider, useThemeContext } from './ThemeContext'

describe('Theme context', () => {
  const TestComponent = () => {
    const { theme, setTheme } = useThemeContext()

    return (
      <div>
        <span data-testid="current-theme">{theme}</span>
        <button onClick={() => setTheme(Theme.DARK)}>set theme</button>
      </div>
    )
  }

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

  describe('useThemeContext', () => {
    it('should throw an error if used outside of ThemeContextProvider', () => {
      const TestComponentWithError: React.FC = () => {
        try {
          useThemeContext()
          return null
        } catch (error) {
          return <div>{(error as Error).message}</div>
        }
      }

      const { container } = render(<TestComponentWithError />)
      expect(container.textContent).toBe(
        'useThemeContext must be used within a ThemeContextProvider'
      )
    })

    it('should not throw an error if used inside ThemeContextProvider', async () => {
      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      )

      expect(screen.getByTestId('current-theme').textContent).toBe(Theme.LIGHT)
      screen.getByText('set theme').click()
      await waitFor(() =>
        expect(screen.getByTestId('current-theme').textContent).toBe(Theme.DARK)
      )
    })
  })
})
