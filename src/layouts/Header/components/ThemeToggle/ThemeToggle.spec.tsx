import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ThemeToggle from './ThemeToggle'

const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

describe('ThemeToggle', () => {
  function setup() {
    return {
      user: userEvent.setup(),
    }
  }

  beforeEach(() => {
    mockSetItem.mockClear()
    mockGetItem.mockClear()
    localStorage.clear()
  })

  it('displays the correct icon and update localStorage when toggling theme', async () => {
    setup()

    // start with light mode
    mockGetItem.mockImplementation((key) => {
      if (key === 'theme') {
        return 'light'
      }
      return null
    })
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveTextContent('moon')

    // toggle to dark mode
    userEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark')
    })
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('sun')
    })
  })
})
