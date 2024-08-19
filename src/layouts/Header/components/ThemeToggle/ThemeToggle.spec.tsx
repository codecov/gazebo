import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { SentryUserFeedback } from 'sentry'

import HelpDropdown from './ThemeToggle'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Switch>
        <Route path="/:provider/:repo" exact>
          {children}
        </Route>
      </Switch>
    </MemoryRouter>
  </QueryClientProvider>
)

afterEach(() => queryClient.clear())

describe('HelpDropdown', () => {
  function setup() {
    SentryUserFeedback.createForm = jest.fn().mockResolvedValue({
      appendToDom: jest.fn(),
      removeFromDom: jest.fn(),
      open: jest.fn(),
    })
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
      const appendToDom = jest.fn()
      const removeFromDom = jest.fn()
      const open = jest.fn()
      const createForm = jest.fn().mockResolvedValue({
        appendToDom,
        removeFromDom,
        open,
      })
      SentryUserFeedback.createForm = createForm

      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()
      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)
      expect(createForm).toHaveBeenCalled()
      expect(appendToDom).toHaveBeenCalled()
      expect(open).not.toHaveBeenCalled()

      await user.click(dropdown)

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()
      expect(open).not.toHaveBeenCalled()

      await user.click(feedback)

      expect(open).toHaveBeenCalled()
    })
  })

  describe('if Sentry form has been loaded', () => {
    describe('and component unmounts', () => {
      it('calls removeSentryForm cleanup function', async () => {
        console.error = () => {}
        const { user } = setup()
        const appendToDom = jest.fn()
        const removeFromDom = jest.fn()
        const open = jest.fn()
        const createForm = jest.fn().mockResolvedValue({
          appendToDom,
          removeFromDom,
          open,
        })
        SentryUserFeedback.createForm = createForm

        const { unmount } = render(<HelpDropdown />, { wrapper })

        const dropdown = await screen.findByTestId('help-dropdown-trigger')
        expect(dropdown).toBeInTheDocument()
        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)
        expect(createForm).toHaveBeenCalled()
        expect(appendToDom).toHaveBeenCalled()
        expect(open).not.toHaveBeenCalled()

        await user.click(dropdown)

        const feedback = await screen.findByText('Share feedback')
        expect(feedback).toBeInTheDocument()
        expect(open).not.toHaveBeenCalled()

        await user.click(feedback)
        expect(open).toHaveBeenCalled()
        expect(removeFromDom).not.toHaveBeenCalled()

        unmount()

        expect(removeFromDom).toHaveBeenCalled()
      })
    })
  })
})
