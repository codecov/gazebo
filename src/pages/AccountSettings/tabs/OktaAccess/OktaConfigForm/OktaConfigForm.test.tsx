import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { OktaConfigForm } from './OktaConfigForm'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const oktaConfigMock = {
  enabled: true,
  enforced: true,
  url: 'https://okta.com',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov/okta-access/']}>
      <Route path="/account/:provider/:owner/okta-access/">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('OktaConfigForm', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()

    server.use(
      graphql.query('GetOktaConfig', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              isUserOktaAuthenticated: true,
              account: {
                oktaConfig: oktaConfigMock,
              },
            },
          },
        })
      }),
      graphql.mutation('SaveOktaConfig', (info) => {
        mutate(info.variables)
        return HttpResponse.json({
          data: {
            saveOktaConfig: {
              error: null,
            },
          },
        })
      })
    )
    return { user, mutate }
  }

  it('should render Okta Config form header', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const header = await screen.findByText(/Step 1: Enable Okta Sync/)
    expect(header).toBeInTheDocument()
  })

  it('should render Okta Config form description', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const description = await screen.findByText(
      /To connect Codecov with Okta, you need to enable the synchronization./
    )
    expect(description).toBeInTheDocument()
  })

  it('should display Client ID validation error when removing client id value', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    await userEvent.type(clientSecretInput, 'clientSecret')

    const redirectUriInput = await screen.findByLabelText(/Redirect URI/)
    await userEvent.type(redirectUriInput, 'http://localhost:3000')

    const clientIdInput = await screen.findByLabelText(/Client ID/)
    await userEvent.type(clientIdInput, 'clientId')
    await userEvent.clear(clientIdInput)

    const clientIdError = await screen.findByText(/Client ID is required/)
    expect(clientIdError).toBeInTheDocument()
  })

  it('should display Client Secret validation error when removing client secret value', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientIdInput = await screen.findByLabelText(/Client ID/)
    await userEvent.type(clientIdInput, 'clientId')

    const redirectUriInput = await screen.findByLabelText(/Redirect URI/)
    await userEvent.type(redirectUriInput, 'http://localhost:3000')

    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    await userEvent.type(clientSecretInput, 'clientSecret')
    await userEvent.clear(clientSecretInput)

    const clientSecretError = await screen.findByText(
      /Client Secret is required/
    )
    expect(clientSecretError).toBeInTheDocument()
  })

  it('shows client secret when clicking on the eye icon', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    await userEvent.type(clientSecretInput, 'clientSecret')

    const eyeIcon = await screen.findByTestId('toggle-password')
    await userEvent.click(eyeIcon)

    expect(clientSecretInput).toHaveAttribute('type', 'text')
  })

  it('hides client secret when clicking on the eye icon', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    await userEvent.type(clientSecretInput, 'clientSecret')

    const eyeIcon = await screen.findByTestId('toggle-password')
    await userEvent.click(eyeIcon)
    await userEvent.click(eyeIcon)

    expect(clientSecretInput).toHaveAttribute('type', 'password')
  })

  it('should display Redirect URI validation error when removing redirect uri value', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientIdInput = await screen.findByLabelText(/Client ID/)
    await userEvent.type(clientIdInput, 'clientId')

    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    await userEvent.type(clientSecretInput, 'clientSecret')

    const redirectUriInput = await screen.findByLabelText(/Redirect URI/)
    await userEvent.type(redirectUriInput, 'http://localhost:3000')
    await userEvent.clear(redirectUriInput)

    const redirectUriError = await screen.findByText(
      /Redirect URI must be a valid URL/
    )
    expect(redirectUriError).toBeInTheDocument()
  })

  it('should toggle Okta Sync Enabled on', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaSyncEnabledToggle = await screen.findByRole('button', {
      name: /Okta Sync Enabled/,
    })
    expect(oktaSyncEnabledToggle).toBeInTheDocument()
    expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-inactive')

    await user.click(oktaSyncEnabledToggle)
    expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-active')
  })

  it('should toggle Okta Login Enforce on', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-inactive')

    await user.click(oktaLoginEnforceToggle)
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-active')
  })

  it('toggles enabled on when enforced is on', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-inactive')

    await user.click(oktaLoginEnforceToggle)
    const oktaSyncEnabledToggle = await screen.findByRole('button', {
      name: /Okta Sync Enabled/,
    })
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-active')
    expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-active')
  })

  it('disables enforce toggle when enabled is off', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaSyncEnabledToggle = await screen.findByRole('button', {
      name: /Okta Sync Enabled/,
    })
    expect(oktaSyncEnabledToggle).toBeInTheDocument()
    expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-inactive')

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-inactive')

    await user.click(oktaLoginEnforceToggle)
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-active')

    await user.click(oktaSyncEnabledToggle)
    expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-inactive')
    expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-inactive')
  })

  it('disables save button when form is in invalid state', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const saveButton = await screen.findByRole('button', {
      name: /Save/,
    })

    expect(saveButton).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
  })

  describe('form should render default values for Okta Config', () => {
    it('renders default values for client id', async () => {
      setup()
      render(<OktaConfigForm />, { wrapper })

      const clientIdInput = await screen.findByLabelText(/Client ID/)
      await waitFor(() => {
        expect(clientIdInput).toHaveValue('clientId')
      })
    })

    it('renders default values for client secret', async () => {
      setup()
      render(<OktaConfigForm />, { wrapper })

      const clientSecretInput = await screen.findByLabelText(/Client Secret/)
      await waitFor(() => {
        expect(clientSecretInput).toHaveValue('clientSecret')
      })
    })

    it('renders default values for redirect uri', async () => {
      setup()
      render(<OktaConfigForm />, { wrapper })

      const redirectUriInput = await screen.findByLabelText(/Redirect URI/)
      await waitFor(() => {
        expect(redirectUriInput).toHaveValue('https://okta.com')
      })
    })

    it('renders default values for Okta Sync Enabled toggle', async () => {
      setup()
      render(<OktaConfigForm />, { wrapper })

      const oktaSyncEnabledToggle = await screen.findByRole('button', {
        name: /Okta Sync Enabled/,
      })
      await waitFor(() => {
        expect(oktaSyncEnabledToggle).toHaveClass('bg-toggle-inactive')
      })
    })

    it('renders default values for Okta Login Enforce toggle', async () => {
      setup()
      render(<OktaConfigForm />, { wrapper })

      const oktaLoginEnforceToggle = await screen.findByRole('button', {
        name: /Okta Login Enforced/,
      })
      await waitFor(() => {
        expect(oktaLoginEnforceToggle).toHaveClass('bg-toggle-inactive')
      })
    })
  })

  it('should submit form with valid data', async () => {
    const { user, mutate } = setup()
    render(<OktaConfigForm />, { wrapper })

    const clientIdInput = await screen.findByLabelText(/Client ID/)
    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    const redirectUriInput = await screen.findByLabelText(/Redirect URI/)

    await user.clear(clientIdInput)
    await user.clear(clientSecretInput)
    await user.clear(redirectUriInput)

    await user.type(clientIdInput, 'New client ID')
    await user.type(clientSecretInput, 'New client secret')
    await user.type(redirectUriInput, 'http://localhost:3000')

    const saveButton = await screen.findByRole('button', { name: /Save/ })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        input: {
          clientId: 'New client ID',
          clientSecret: 'New client secret',
          url: 'http://localhost:3000',
          orgUsername: 'codecov',
        },
      })
    })
  })

  it('should disable button after submitting form', async () => {
    setup()
    render(<OktaConfigForm />, { wrapper })

    const clientIdInput = await screen.findByLabelText(/Client ID/)
    const clientSecretInput = await screen.findByLabelText(/Client Secret/)
    const redirectUriInput = await screen.findByLabelText(/Redirect URI/)

    await userEvent.clear(clientIdInput)
    await userEvent.clear(clientSecretInput)
    await userEvent.clear(redirectUriInput)

    await userEvent.type(clientIdInput, 'New client ID')
    await userEvent.type(clientSecretInput, 'New client secret')
    await userEvent.type(redirectUriInput, 'http://localhost:3000')

    const saveButton = await screen.findByRole('button', { name: /Save/ })
    await userEvent.click(saveButton)

    expect(saveButton).toBeDisabled()
  })
})
