import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import HelpDropdown from './HelpDropdown'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeContextProvider>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Switch>
          <Route path="/:provider/:repo" exact>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    </ThemeContextProvider>
  </QueryClientProvider>
)

const mocks = vi.hoisted(() => {
  const appendToDom = vi.fn()
  const removeFromDom = vi.fn()
  const open = vi.fn()

  return {
    appendToDom,
    removeFromDom,
    open,
    attachTo: vi.fn(),
    createWidget: vi.fn(),
    remove: vi.fn(),
    createForm: vi.fn().mockResolvedValue({
      appendToDom,
      removeFromDom,
      open,
    }),
  }
})

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')

  return {
    ...originalModule,
    feedbackIntegration: () => ({
      createForm: mocks.createForm,
      name: '',
      attachTo: mocks.attachTo,
      createWidget: mocks.createWidget,
      remove: mocks.remove,
    }),
  }
})

window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  queryClient.clear()
})

describe('HelpDropdown', () => {
  function setup() {
    return {
      user: userEvent.setup(),
    }
  }

  it('renders dropdown button', async () => {
    setup()
    render(<HelpDropdown />, { wrapper })

    const dropdown = await screen.findByTestId('help-dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  describe('when not clicked', () => {
    it('does not render dropdown contents', async () => {
      setup()
      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown')
      expect(dropdown).toBeInTheDocument()

      const docs = screen.queryByText('Developer docs')
      expect(docs).not.toBeInTheDocument()
    })
  })

  describe('when clicked', () => {
    it('renders dropdown', async () => {
      const { user } = setup()
      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()

      await user.click(dropdown)

      const docs = await screen.findByText('Developer docs')
      expect(docs).toBeInTheDocument()

      const support = await screen.findByText('Support center')
      expect(support).toBeInTheDocument()

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()

      const discussions = await screen.findByText('Join GitHub discussions')
      expect(discussions).toBeInTheDocument()
    })
  })

  describe('when Share feedback item is selected', () => {
    it('opens the sentry user feedback modal', async () => {
      console.error = () => {}
      const { user } = setup()

      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      expect(mocks.createForm).toHaveBeenCalled()
      expect(mocks.appendToDom).toHaveBeenCalled()
      expect(mocks.open).not.toHaveBeenCalled()

      await user.click(dropdown)

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()
      expect(mocks.open).not.toHaveBeenCalled()

      await user.click(feedback)

      expect(mocks.open).toHaveBeenCalled()
    })
  })

  describe('if Sentry form has been loaded', () => {
    describe('and component unmounts', () => {
      it('calls removeSentryForm cleanup function', async () => {
        console.error = () => {}
        const { user } = setup()

        const { unmount } = render(<HelpDropdown />, { wrapper })

        const dropdown = await screen.findByTestId('help-dropdown-trigger')
        expect(dropdown).toBeInTheDocument()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        expect(mocks.createForm).toHaveBeenCalled()
        expect(mocks.appendToDom).toHaveBeenCalled()
        expect(mocks.open).not.toHaveBeenCalled()

        await user.click(dropdown)

        const feedback = await screen.findByText('Share feedback')
        expect(feedback).toBeInTheDocument()
        expect(mocks.open).not.toHaveBeenCalled()

        await user.click(feedback)
        expect(mocks.open).toHaveBeenCalled()
        expect(mocks.removeFromDom).not.toHaveBeenCalled()

        unmount()

        expect(mocks.removeFromDom).toHaveBeenCalled()
      })
    })
  })
})
