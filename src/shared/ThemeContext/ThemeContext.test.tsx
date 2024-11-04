import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Theme, ThemeContextProvider, useThemeContext } from './ThemeContext'

const TestComponent = () => {
  const { theme, setTheme } = useThemeContext()

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme(Theme.DARK)}>set theme</button>
    </div>
  )
}

const TestComponentWithError: React.FC = () => {
  try {
    useThemeContext()
    return null
  } catch (error) {
    return <div>{(error as Error).message}</div>
  }
}

describe('Theme context', () => {
  function setup() {
    window.localStorage.__proto__.setItem = vi.fn()
    window.localStorage.__proto__.getItem = vi.fn()
    window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

    const user = userEvent.setup()

    return { user }
  }

  describe('when called', () => {
    it('renders with default theme', () => {
      setup()
      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      )

      const theme = window.localStorage.getItem('theme')

      expect(window.localStorage.getItem).toHaveBeenCalled()
      expect(theme).toBeUndefined()
    })

    it('sets localStorage theme to the expected theme', async () => {
      const { user } = setup()
      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      )

      await user.click(screen.getByText('set theme'))

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
      setup()

      const { container } = render(<TestComponentWithError />)
      expect(container).toHaveTextContent(
        'useThemeContext must be used within a ThemeContextProvider'
      )
    })

    it('should not throw an error if used inside ThemeContextProvider', async () => {
      const { user } = setup()
      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      )

      const theme = screen.getByTestId('current-theme')
      expect(theme).toHaveTextContent(Theme.LIGHT)

      const setThemeButton = screen.getByText('set theme')
      await user.click(setThemeButton)

      const updatedTheme = await screen.findByTestId('current-theme')
      await waitFor(() => expect(updatedTheme).toHaveTextContent(Theme.DARK))
    })
  })
})
