import * as Sentry from '@sentry/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeContextProvider } from 'shared/ThemeContext'

import ThemeToggle from './ThemeToggle'

const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

describe('ThemeToggle', () => {
  function setup({ isMediaPrefersDark }: { isMediaPrefersDark: boolean }) {
    window.matchMedia = jest
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

  afterAll(() => {
    jest.clearAllMocks()
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
    expect(screen.getByRole('button')).toHaveTextContent('moon')

    // toggle to dark mode
    userEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark')
    })
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('sun')
    })
    expect(Sentry.metrics.increment).toHaveBeenCalledWith(
      'button_clicked.theme.dark',
      1,
      undefined
    )

    // toggle back to light mode
    userEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'light')
    })
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('moon')
    })
    await waitFor(() => {
      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'button_clicked.theme.light',
        1,
        undefined
      )
    })
  })

  it('assumes light mode when there is no theme in local storage', () => {
    setup({ isMediaPrefersDark: false })
    mockGetItem.mockImplementation((key) => null)
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>
    )
    expect(screen.getByRole('button')).toHaveTextContent('moon')
  })
})
