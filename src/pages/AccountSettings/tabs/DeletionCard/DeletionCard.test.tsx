import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import DeletionCard from './DeletionCard'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/account/gh/test-user']}>
    <Route path="/account/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

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
  })

  describe('when isPersonalSettings is false', () => {
    it('renders organization deletion message', () => {
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const message = screen.getByText(
        /Erase organization and all its repositories./
      )
      expect(message).toBeInTheDocument()
    })
  })
})
