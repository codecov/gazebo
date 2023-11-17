import { act, render, screen } from 'custom-testing-library'

import Cookies from 'js-cookie'
import { MemoryRouter, Route } from 'react-router-dom'

import SessionExpiryModal from './SessionExpiryModal'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">{children}</Route>
  </MemoryRouter>
)

describe('SessionExpiryModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date())
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows expired modal only 2 minutes before expiry or later', () => {
    const expiryTime = new Date()
    expiryTime.setMinutes(expiryTime.getMinutes() + 15)
    Cookies.get = jest.fn().mockImplementation(() => expiryTime.toString())

    render(<SessionExpiryModal />, { wrapper })
    expect(
      screen.queryByText('Your session has expired')
    ).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(60 * 14 * 1000) // Advance time by 10 minutes
    })

    const headerText = screen.getByText('Your session has expired')
    expect(headerText).toBeInTheDocument()
    const button = screen.getByText(
      'Please log in again to continue using Codecov'
    )
    expect(button).not.toBeDisabled()
  })

  it('should not display modal when session expiry time is not set', () => {
    Cookies.get = jest.fn().mockImplementation(() => undefined)
    render(<SessionExpiryModal />, { wrapper })
    expect(
      screen.queryByText('Your session has expired')
    ).not.toBeInTheDocument()
  })

  it('has the correct sign out path', () => {
    const expiryTime = new Date()
    Cookies.get = jest.fn().mockImplementation(() => expiryTime.toString())
    render(<SessionExpiryModal />, { wrapper })
    act(() => jest.advanceTimersByTime(60 * 1000))

    const headerText = screen.getByText('Your session has expired')
    expect(headerText).toBeInTheDocument()
    const button = screen.getByText(
      'Please log in again to continue using Codecov'
    )
    expect(button).not.toBeDisabled()
  })
})
