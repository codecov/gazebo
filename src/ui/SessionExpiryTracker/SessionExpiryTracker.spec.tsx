import { act, render, screen, waitFor } from '@testing-library/react'
import Cookies from 'js-cookie'
import { MemoryRouter, Route } from 'react-router-dom'

import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'

import SessionExpiryTracker from './SessionExpiryTracker'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">{children}</Route>
    <Route path="/login" render={() => <SessionExpiredBanner />} />
  </MemoryRouter>
)

describe('SessionExpiryTracker', () => {
  function setup() {
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockRemoveItem = jest.spyOn(
      window.localStorage.__proto__,
      'removeItem'
    )
    return { mockSetItem, mockRemoveItem }
  }
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('shows expired modal only 2 minutes before expiry or later', async () => {
    const expiryTime = new Date()
    expiryTime.setMinutes(expiryTime.getMinutes() + 15)
    Cookies.get = jest.fn().mockImplementation(() => expiryTime.toString())
    const { mockSetItem, mockRemoveItem } = setup()
    render(<SessionExpiryTracker />, { wrapper })

    expect(
      screen.queryByText('Your session has expired')
    ).not.toBeInTheDocument()
    expect(mockRemoveItem).toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(60 * 14 * 1000) // Advance time by 14 minutes
    })
    await waitFor(() => {
      expect(screen.getByText(/Your session has expired/)).toBeInTheDocument()
    })
    expect(mockSetItem).toHaveBeenCalled()
  })

  it('using real timers', async () => {
    jest.useRealTimers()
    const expiryTime = new Date()
    Cookies.get = jest.fn().mockImplementation(() => expiryTime.toString())

    render(<SessionExpiryTracker />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Your session has expired/)).toBeInTheDocument()
    })
  })

  it('should not display modal when session expiry time is not set', () => {
    Cookies.get = jest.fn().mockImplementation(() => undefined)
    const { mockSetItem, mockRemoveItem } = setup()

    render(<SessionExpiryTracker />, { wrapper })
    expect(
      screen.queryByText(/Your session has expired/)
    ).not.toBeInTheDocument()
    expect(mockRemoveItem).toHaveBeenCalled()
    expect(mockSetItem).toHaveBeenCalled()
  })

  it('should clear interval and timeout on unmount', () => {
    const expiryTime = new Date()
    expiryTime.setMinutes(expiryTime.getMinutes() + 15)
    Cookies.get = jest.fn().mockImplementation(() => expiryTime.toString())
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(<SessionExpiryTracker />, { wrapper })

    act(() => {
      jest.advanceTimersByTime(60 * 14 * 1000)
    })

    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
