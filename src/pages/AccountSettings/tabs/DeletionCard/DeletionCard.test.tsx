import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import DeletionCard from './DeletionCard'

const mockMutate = vi.fn()
vi.mock('services/account/useEraseAccount', () => ({
  useEraseAccount: () => ({ mutate: mockMutate, isLoading: false }),
}))

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/account/gh/test-user']}>
    <Route path="/account/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

afterEach(() => {
  vi.clearAllMocks()
})

describe('DeletionCard', () => {
  it('renders header', () => {
    render(<DeletionCard isPersonalSettings={true} />, { wrapper })

    const header = screen.getByRole('heading', { name: 'Delete account' })
    expect(header).toBeInTheDocument()
  })

  describe('when isPersonalSettings is true', () => {
    it('renders account deletion message', () => {
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const message = screen.getByText(
        /Erase my personal account and all my repositories./
      )
      expect(message).toBeInTheDocument()
    })

    it('renders a delete personal account button', () => {
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const button = screen.getByRole('button', {
        name: 'Delete personal account',
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when isPersonalSettings is false', () => {
    it('renders organization deletion message', () => {
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const message = screen.getByText(
        /Erase organization and all its repositories./
      )
      expect(message).toBeInTheDocument()
    })

    it('renders a delete organization button', () => {
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const button = screen.getByRole('button', {
        name: 'Delete organization',
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when the delete button is clicked', () => {
    it('opens the confirmation modal', async () => {
      const user = userEvent.setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      expect(
        screen.queryByText(/this action is not reversible/i)
      ).not.toBeInTheDocument()

      await user.click(screen.getByTestId('show-deletion-modal'))

      expect(
        screen.getByText(/this action is not reversible/i)
      ).toBeInTheDocument()
    })
  })
})
