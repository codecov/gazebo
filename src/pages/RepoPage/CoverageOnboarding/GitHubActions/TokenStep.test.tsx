import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ThemeContextProvider } from 'shared/ThemeContext'

import TokenStepSection from './TokenStep'

vi.mock('services/uploadTokenRequired')
vi.mock('services/orgUploadToken')
vi.mock('services/repo')
vi.mock('shared/featureFlags')
vi.mock('services/user')

const mocks = vi.hoisted(() => ({
  useUploadTokenRequired: vi.fn(),
  useOrgUploadToken: vi.fn(),
  useRepo: vi.fn(),
  useFlags: vi.fn(),
  useIsCurrentUserAnAdmin: vi.fn(),
}))

vi.mock('services/uploadTokenRequired', async () => {
  const original = await vi.importActual('services/uploadTokenRequired')
  return {
    ...original,
    useUploadTokenRequired: mocks.useUploadTokenRequired,
  }
})

vi.mock('services/orgUploadToken', async () => {
  const original = await vi.importActual('services/orgUploadToken')
  return {
    ...original,
    useOrgUploadToken: mocks.useOrgUploadToken,
  }
})

vi.mock('services/repo', async () => {
  const original = await vi.importActual('services/repo')
  return {
    ...original,
    useRepo: mocks.useRepo,
  }
})

vi.mock('shared/featureFlags', async () => {
  const original = await vi.importActual('shared/featureFlags')
  return {
    ...original,
    useFlags: mocks.useFlags,
  }
})

vi.mock('services/user', async () => {
  const original = await vi.importActual('services/user')
  return {
    ...original,
    useIsCurrentUserAnAdmin: mocks.useIsCurrentUserAnAdmin,
  }
})

const queryClient = new QueryClient()

describe('TokenStepSection', () => {
  function setup({
    uploadTokenRequired = true,
  }: {
    uploadTokenRequired?: boolean
  }) {
    mocks.useUploadTokenRequired.mockReturnValue({
      data: { uploadTokenRequired: uploadTokenRequired },
      isLoading: false,
    })
    mocks.useOrgUploadToken.mockReturnValue({
      data: 'org-upload-token',
      isLoading: false,
    })
    mocks.useRepo.mockReturnValue({
      data: { repository: { uploadToken: 'repo-upload-token' } },
      isLoading: false,
    })
    mocks.useFlags.mockReturnValue({ newRepoFlag: true })
    mocks.useIsCurrentUserAnAdmin.mockReturnValue(true)
    mocks.useIsCurrentUserAnAdmin.mockReturnValue(false)
  }

  const wrapper =
    (
      initialEntries = '/gh/codecov/test-repo'
    ): React.FC<React.PropsWithChildren> =>
    ({ children }) => (
      <MemoryRouter initialEntries={[initialEntries]}>
        <ThemeContextProvider>
          <Route path="/:provider/:owner/:repo">
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </Route>
        </ThemeContextProvider>
      </MemoryRouter>
    )

  it('renders token selection when previouslyGeneratedOrgToken is false', () => {
    setup({})
    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })

    expect(screen.getByText(/Select an upload token/)).toBeInTheDocument()
    expect(screen.getByText(/Global upload token/)).toBeInTheDocument()
    expect(screen.getByText(/Repository token/)).toBeInTheDocument()
  })

  it('shows only the add token step when previouslyGeneratedOrgToken is true', () => {
    setup({})
    render(<TokenStepSection previouslyGeneratedOrgToken={true} />, {
      wrapper: wrapper(),
    })

    expect(screen.getByText(/Step 2: add token/)).toBeInTheDocument()
    expect(screen.queryByText(/Select an upload token/)).not.toBeInTheDocument()
  })

  it('displays org token when global token is selected', async () => {
    setup({ uploadTokenRequired: false })
    render(<TokenStepSection previouslyGeneratedOrgToken={true} />, {
      wrapper: wrapper(),
    })

    const globalTokenRadio = screen.getByTestId('global-token-radio')
    await userEvent.click(globalTokenRadio)

    expect(screen.getByText('org-upload-token')).toBeInTheDocument()
  })

  it('displays repo token when repository token is selected', async () => {
    setup({})
    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })

    const repoTokenRadio = await screen.findByTestId('repo-token-radio')
    await userEvent.click(repoTokenRadio)

    expect(screen.getByText('repo-upload-token')).toBeInTheDocument()
  })

  it('shows generate button for non-admin users in disabled state', () => {
    setup({})
    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })

    const generateButton = screen.getByRole('button', { name: /Generate/i })
    expect(generateButton).toBeDisabled()
  })

  it('shows optional text when upload token is not required', () => {
    setup({ uploadTokenRequired: false })
    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })

    expect(screen.getByText(/-optional/)).toBeInTheDocument()
  })

  it('does not show org token when it is not generated', async () => {
    setup({})
    mocks.useOrgUploadToken.mockImplementation(() => ({
      data: null,
      isLoading: false,
    }))

    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })
    expect(
      screen.getByText(/Step 2: Select an upload token/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Step 3: add token as/)).not.toBeInTheDocument()
    expect(screen.queryByText('org-upload-token')).not.toBeInTheDocument()
  })

  it('shows step 3 add token step when org token is generated', async () => {
    setup({})
    render(<TokenStepSection previouslyGeneratedOrgToken={false} />, {
      wrapper: wrapper(),
    })

    const generateButton = await screen.findByRole('button', {
      name: /Generate/i,
    })
    await userEvent.click(generateButton)

    const step3 = await screen.findByText(/Step 3: add token as/)
    const orgToken = await screen.findByText('org-upload-token')
    expect(step3).toBeInTheDocument()
    expect(orgToken).toBeInTheDocument()
  })

  it('renders correct link text based on token selection', async () => {
    setup({ uploadTokenRequired: false })
    const user = userEvent.setup()
    render(<TokenStepSection previouslyGeneratedOrgToken={true} />, {
      wrapper: wrapper(),
    })

    const orgLink = await screen.findByText('organization secret')
    expect(orgLink).toBeInTheDocument()
    expect(orgLink).toHaveAttribute(
      'href',
      'https://github.com/organizations/codecov/settings/secrets/actions/new'
    )

    const repoTokenRadio = await screen.findByTestId('repo-token-radio')
    await user.click(repoTokenRadio)
    const repoLink = await screen.findByText('repository secret')
    expect(repoLink).toBeInTheDocument()
    expect(repoLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/test-repo/settings/secrets/actions/new'
    )
  })
})
