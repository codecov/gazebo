import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { accountDetailsParsedObj } from 'services/account/mocks'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { usePlanData } from 'services/account/usePlanData'
import { useOwner } from 'services/user'

import DeletionCard from './DeletionCard'

const mockMutate = vi.fn()
vi.mock('services/account/useEraseAccount', () => ({
  useEraseAccount: () => ({ mutate: mockMutate, isLoading: false }),
}))

vi.mock('services/account/useAccountDetails')
const mockedUseAccountDetails = vi.mocked(useAccountDetails)

vi.mock('services/account/usePlanData')
const mockedUsePlanData = vi.mocked(usePlanData)

vi.mock('services/user', async () => {
  const actual = await vi.importActual('services/user')
  return {
    ...actual,
    useOwner: vi.fn(),
  }
})
const mockedUseOwner = vi.mocked(useOwner)

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/test-user']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

afterEach(() => {
  queryClient.clear()
  vi.clearAllMocks()
})

describe('DeletionCard', () => {
  function setup({
    usesInvoice = false,
    planProvider = null as string | null,
    subscriptionDetail = accountDetailsParsedObj.subscriptionDetail,
    isFreePlan = true,
    rootOrganization = null as { username?: string } | null,
    isLoading = false,
    isLoadingPlan = false,
    isAdmin = true,
    isLoadingOwner = false,
  }: {
    usesInvoice?: boolean
    planProvider?: string | null
    subscriptionDetail?: typeof accountDetailsParsedObj.subscriptionDetail
    isFreePlan?: boolean
    rootOrganization?: { username?: string } | null
    isLoading?: boolean
    isLoadingPlan?: boolean
    isAdmin?: boolean
    isLoadingOwner?: boolean
  } = {}) {
    mockedUseAccountDetails.mockReturnValue({
      data: isLoading
        ? undefined
        : {
            ...accountDetailsParsedObj,
            usesInvoice,
            planProvider,
            rootOrganization,
            subscriptionDetail,
          },
      isLoading,
    } as ReturnType<typeof useAccountDetails>)

    mockedUsePlanData.mockReturnValue({
      data: isLoadingPlan
        ? undefined
        : {
            owner: {
              plan: {
                isFreePlan,
              },
            },
          },
      isLoading: isLoadingPlan,
    } as ReturnType<typeof usePlanData>)

    mockedUseOwner.mockReturnValue({
      data: isLoadingOwner ? undefined : { isAdmin },
      isLoading: isLoadingOwner,
    } as ReturnType<typeof useOwner>)
  }

  it('renders header', async () => {
    setup()
    render(<DeletionCard isPersonalSettings={true} />, { wrapper })

    const header = await screen.findByRole('heading', {
      name: 'Delete account',
    })
    expect(header).toBeInTheDocument()
  })

  describe('when isPersonalSettings is true', () => {
    it('renders account deletion message', async () => {
      setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const message = await screen.findByText(
        /Erase my personal account and all my repositories./
      )
      expect(message).toBeInTheDocument()
    })

    it('renders a delete personal account button', async () => {
      setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const button = await screen.findByRole('button', {
        name: 'Delete personal account',
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when isPersonalSettings is false', () => {
    it('renders organization deletion message', async () => {
      setup()
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const message = await screen.findByText(
        /Erase organization and all its repositories./
      )
      expect(message).toBeInTheDocument()
    })

    it('renders a delete organization button', async () => {
      setup()
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const button = await screen.findByRole('button', {
        name: 'Delete organization',
      })
      expect(button).toBeInTheDocument()
    })

    it('does not render for non-admin users', () => {
      setup({ isAdmin: false })
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      expect(
        screen.queryByRole('heading', { name: 'Delete organization' })
      ).not.toBeInTheDocument()
    })
  })

  describe('when the account uses invoice billing', () => {
    it('does not render the delete button', async () => {
      setup({ usesInvoice: true })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(screen.getByText(/Contact support/)).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Delete personal account' })
      ).not.toBeInTheDocument()
    })

    it('does not render the delete button for send_invoice collection', async () => {
      setup({
        subscriptionDetail: {
          ...accountDetailsParsedObj.subscriptionDetail!,
          collectionMethod: 'send_invoice',
        },
      })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(screen.getByText(/Contact support/)).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Delete personal account' })
      ).not.toBeInTheDocument()
    })
  })

  describe('when the account has an active paid subscription', () => {
    it('does not render the delete button for GitHub Marketplace billing', async () => {
      setup({
        planProvider: 'github',
        isFreePlan: false,
        subscriptionDetail: null,
      })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(screen.getByText(/GitHub Marketplace/)).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Delete personal account' })
      ).not.toBeInTheDocument()
    })

    it('does not render the delete button for Stripe billing', async () => {
      setup({
        isFreePlan: false,
        subscriptionDetail: accountDetailsParsedObj.subscriptionDetail,
      })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(screen.getByText(/Plan page/)).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Delete personal account' })
      ).not.toBeInTheDocument()
    })

    it('renders the delete button when billing is managed by a root org', async () => {
      setup({
        isFreePlan: false,
        planProvider: 'github',
        rootOrganization: { username: 'root-org' },
        subscriptionDetail: null,
      })
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      expect(
        await screen.findByRole('button', { name: 'Delete organization' })
      ).toBeInTheDocument()
    })
  })

  describe('when plan data are loading', () => {
    it('renders nothing', () => {
      setup({ isLoadingPlan: true })
      const { container } = render(<DeletionCard isPersonalSettings={true} />, {
        wrapper,
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when account details are loading', () => {
    it('renders nothing', () => {
      setup({ isLoading: true })
      const { container } = render(<DeletionCard isPersonalSettings={true} />, {
        wrapper,
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when owner details are loading for org settings', () => {
    it('renders nothing', () => {
      setup({ isLoadingOwner: true })
      const { container } = render(
        <DeletionCard isPersonalSettings={false} />,
        {
          wrapper,
        }
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the delete button is clicked', () => {
    it('opens the confirmation modal', async () => {
      const user = userEvent.setup()
      setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(
        screen.queryByText(/this action is not reversible/i)
      ).not.toBeInTheDocument()

      await user.click(await screen.findByTestId('show-deletion-modal'))

      expect(
        screen.getByText(/Warning: this action is not reversible/i)
      ).toBeInTheDocument()
    })

    it('closes the confirmation modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      await user.click(await screen.findByTestId('show-deletion-modal'))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(
        screen.queryByText(/Warning: this action is not reversible/i)
      ).not.toBeInTheDocument()
    })
  })
})
