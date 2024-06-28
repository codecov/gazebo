import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { OktaConfigForm } from './OktaConfigForm'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/account/gh/codecov/okta-access/']}>
    <Route path="/account/:provider/:owner/okta-access/">
      <Suspense fallback={null}>{children}</Suspense>
    </Route>
  </MemoryRouter>
)

describe('OktaConfigForm', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
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
    expect(oktaSyncEnabledToggle).toHaveClass('bg-ds-gray-quinary')

    await user.click(oktaSyncEnabledToggle)
    expect(oktaSyncEnabledToggle).toHaveClass('bg-ds-primary-base')
  })

  it('should toggle Okta Login Enforce on', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-gray-quinary')

    await user.click(oktaLoginEnforceToggle)
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-primary-base')
  })

  it('toggles enabled on when enforced is on', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-gray-quinary')

    await user.click(oktaLoginEnforceToggle)
    const oktaSyncEnabledToggle = await screen.findByRole('button', {
      name: /Okta Sync Enabled/,
    })
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-primary-base')
    expect(oktaSyncEnabledToggle).toHaveClass('bg-ds-primary-base')
  })

  it('disables enforce toggle when enabled is off', async () => {
    const { user } = setup()
    render(<OktaConfigForm />, { wrapper })

    const oktaSyncEnabledToggle = await screen.findByRole('button', {
      name: /Okta Sync Enabled/,
    })
    expect(oktaSyncEnabledToggle).toBeInTheDocument()
    expect(oktaSyncEnabledToggle).toHaveClass('bg-ds-gray-quinary')

    const oktaLoginEnforceToggle = await screen.findByRole('button', {
      name: /Okta Login Enforced/,
    })
    expect(oktaLoginEnforceToggle).toBeInTheDocument()
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-gray-quinary')

    await user.click(oktaLoginEnforceToggle)
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-primary-base')

    await user.click(oktaSyncEnabledToggle)
    expect(oktaSyncEnabledToggle).toHaveClass('bg-ds-gray-quinary')
    expect(oktaLoginEnforceToggle).toHaveClass('bg-ds-gray-quinary')
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
})
