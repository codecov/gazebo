import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { type Mock } from 'vitest'

import { useUser } from 'services/user/useUser'
import { ThemeContextProvider } from 'shared/ThemeContext'

import HelpDropdown from './HelpDropdown'

vi.mock('services/user/useUser')

const mockedUseUser = useUser as Mock

const mockUser = {
  owner: {
    defaultOrgUsername: 'codecov',
  },
  user: {
    username: 'janedoe',
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/codecov-client') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Switch>
            <Route path="/:provider/:owner/:repo" exact>
              {children}
            </Route>
            <Route path="/:provider/:owner" exact>
              {children}
            </Route>
            <Route path="/:provider" exact>
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

function buildSupportEmailHref(username: string, ownerLabel: string) {
  const subject = encodeURIComponent(
    `Codecov Support Request for ${username} on ${ownerLabel}`
  )
  const body = encodeURIComponent(
    'Please describe the issue you would like help with.'
  )

  return `mailto:support@harness.io?subject=${subject}&body=${body}`
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  queryClient.clear()
})

describe('HelpDropdown', () => {
  function setup({
    user = mockUser,
  }: {
    user?: typeof mockUser | null
  } = {}) {
    mockedUseUser.mockReturnValue({ data: user })

    return {
      user: userEvent.setup(),
    }
  }

  it('renders dropdown button', async () => {
    setup()
    render(<HelpDropdown />, { wrapper: wrapper() })

    const dropdown = await screen.findByTestId('help-dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  describe('when not clicked', () => {
    it('does not render dropdown contents', async () => {
      setup()
      render(<HelpDropdown />, { wrapper: wrapper() })

      const dropdown = await screen.findByTestId('help-dropdown')
      expect(dropdown).toBeInTheDocument()

      const docs = screen.queryByText('Developer docs')
      expect(docs).not.toBeInTheDocument()
    })
  })

  describe('when clicked', () => {
    it('renders dropdown', async () => {
      const { user } = setup()
      render(<HelpDropdown />, { wrapper: wrapper() })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()

      await user.click(dropdown)

      const docs = await screen.findByText('Developer docs')
      expect(docs).toBeInTheDocument()

      const support = await screen.findByText('Contact support')
      expect(support).toBeInTheDocument()

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()
    })
  })

  describe('contact support link', () => {
    it('uses the route owner in the mailto subject', async () => {
      const { user } = setup()
      render(<HelpDropdown />, {
        wrapper: wrapper('/gh/codecov/codecov-client'),
      })

      await user.click(await screen.findByTestId('help-dropdown-trigger'))

      const supportLink = await screen.findByTestId('support-email')
      expect(supportLink).toHaveAttribute(
        'href',
        buildSupportEmailHref('janedoe', 'codecov')
      )
    })

    it('uses personal organization in the subject when owner matches username', async () => {
      const { user } = setup({
        user: {
          owner: {
            defaultOrgUsername: 'janedoe',
          },
          user: {
            username: 'janedoe',
          },
        },
      })
      render(<HelpDropdown />, {
        wrapper: wrapper('/gh/janedoe'),
      })

      await user.click(await screen.findByTestId('help-dropdown-trigger'))

      const supportLink = await screen.findByTestId('support-email')
      expect(supportLink).toHaveAttribute(
        'href',
        buildSupportEmailHref('janedoe', 'personal organization')
      )
    })

    it('falls back when user data is unavailable', async () => {
      const { user } = setup({ user: null })
      render(<HelpDropdown />, { wrapper: wrapper('/gh') })

      await user.click(await screen.findByTestId('help-dropdown-trigger'))

      const supportLink = await screen.findByTestId('support-email')
      expect(supportLink).toHaveAttribute(
        'href',
        buildSupportEmailHref('unknown user', 'unknown owner')
      )
    })
  })

  describe('when Share feedback item is selected', () => {
    it('opens the sentry user feedback modal', async () => {
      console.error = () => {}
      const { user } = setup()

      render(<HelpDropdown />, { wrapper: wrapper() })

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

        const { unmount } = render(<HelpDropdown />, {
          wrapper: wrapper(),
        })

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
