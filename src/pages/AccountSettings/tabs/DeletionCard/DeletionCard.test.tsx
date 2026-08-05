import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { accountDetailsParsedObj } from 'services/account/mocks'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { useOwner } from 'services/user'

import DeletionCard from './DeletionCard'

const mockMutate = vi.fn()
vi.mock('services/account/useEraseAccount', () => ({
  useEraseAccount: () => ({ mutate: mockMutate, isLoading: false }),
}))

vi.mock('services/account/useAccountDetails')
const mockedUseAccountDetails = vi.mocked(useAccountDetails)

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
    collectionMethod = 'charge_automatically',
    isLoading = false,
    isAdmin = true,
    isLoadingOwner = false,
  }: {
    usesInvoice?: boolean
    collectionMethod?: string
    isLoading?: boolean
    isAdmin?: boolean
    isLoadingOwner?: boolean
  } = {}) {
    mockedUseAccountDetails.mockReturnValue({
      data: isLoading
        ? undefined
        : {
            ...accountDetailsParsedObj,
            usesInvoice,
            subscriptionDetail: {
              ...accountDetailsParsedObj.subscriptionDetail,
              collectionMethod,
            },
          },
      isLoading,
    } as ReturnType<typeof useAccountDetails>)

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
      setup({ collectionMethod: 'send_invoice' })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(screen.getByText(/Contact support/)).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Delete personal account' })
      ).not.toBeInTheDocument()
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
