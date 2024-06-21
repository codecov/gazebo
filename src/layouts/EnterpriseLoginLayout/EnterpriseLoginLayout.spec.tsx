import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { LOCAL_STORAGE_SESSION_EXPIRED_KEY } from 'config'

import EnterpriseLoginLayout from './EnterpriseLoginLayout'

jest.mock('./Header', () => () => 'Header')
jest.mock('layouts/Footer', () => () => 'Footer')
jest.mock('shared/GlobalBanners', () => () => 'GlobalBanners')
jest.mock('layouts/ToastNotifications', () => () => 'ToastNotifications')
jest.mock('ui/SessionExpiryTracker', () => () => 'SessionExpiryTracker')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

const mockedUseLocation = useLocation as jest.Mock

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">
        <EnterpriseLoginLayout>{children}</EnterpriseLoginLayout>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('EnterpriseLoginLayout', () => {
  beforeAll(() => {
    console.error = () => {}
  })
  beforeEach(() => {
    mockedUseLocation.mockReturnValue({ search: [] })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('renders children', () => {
    render(<>children</>, { wrapper })

    const children = screen.getByText(/children/)
    expect(children).toBeInTheDocument()
  })

  it('renders global banners', () => {
    render(<>children</>, { wrapper })

    const globalBanners = screen.getByText(/GlobalBanners/)
    expect(globalBanners).toBeInTheDocument()
  })

  it('renders the header', () => {
    render(<>children</>, { wrapper })

    const header = screen.getByText(/Header/)
    expect(header).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<>children</>, { wrapper })

    const footer = screen.getByText(/Footer/)
    expect(footer).toBeInTheDocument()
  })

  it('renders toast notifications', () => {
    render(<>children</>, { wrapper })

    const ToastNotifications = screen.getByText(/ToastNotifications/)
    expect(ToastNotifications).toBeInTheDocument()
  })

  it('does not render the session expired banner if session not expired', () => {
    render(<>children</>, { wrapper })

    const session = screen.queryByText(/Your session has expired/)
    expect(session).not.toBeInTheDocument()
  })

  it('renders the session expired banner if session is expired', () => {
    localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRED_KEY, 'true')

    render(<>children</>, { wrapper })

    const session = screen.getByText(/Your session has expired/)
    expect(session).toBeInTheDocument()
  })

  it('renders the session expired banner when expired query param set', () => {
    mockedUseLocation.mockReturnValueOnce({
      search: 'expired',
    })

    render(<>children</>, { wrapper })

    const session = screen.getByText(/Your session has expired/)
    expect(session).toBeInTheDocument()
  })
})
