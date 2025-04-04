import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeContextProvider } from 'shared/ThemeContext'

import ThemeToggle from './ThemeToggle'

const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

describe('ThemeToggle', () => {
  function setup({ isMediaPrefersDark }: { isMediaPrefersDark: boolean }) {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: isMediaPrefersDark } as MediaQueryList)

    return {
      user: userEvent.setup(),
    }
  }

  beforeEach(() => {
    mockSetItem.mockClear()
    mockGetItem.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('displays the correct icon and updates localStorage when toggling theme', async () => {
    // start with light mode
    setup({ isMediaPrefersDark: false })
    mockGetItem.mockImplementation((key) => {
      if (key === 'theme') {
        return 'light'
      }
      return null
    })
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>
    )

    const button = screen.getByRole('button')
    const icon = within(button).getByTestId('moon')
    expect(icon).toBeInTheDocument()

    // toggle to dark mode
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark')
    })

    await waitFor(() => {
      const sunIcon = within(button).getByTestId('sun')
      expect(sunIcon).toHaveAttribute('data-icon', 'sun')
    })

    // toggle back to light mode
    await userEvent.click(button)
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'light')
    })

    await waitFor(() => {
      expect(icon).toHaveAttribute('data-icon', 'moon')
    })
  })

  it('assumes light mode when there is no theme in local storage', () => {
    setup({ isMediaPrefersDark: false })
    mockGetItem.mockImplementation(() => null)
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>
    )

    const button = screen.getByRole('button')
    const icon = within(button).getByTestId('moon')
    expect(icon).toBeInTheDocument()
  })
})
