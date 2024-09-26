import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import TeamPlanSpecialOffer from './TeamPlanSpecialOffer'

vi.mock('./TeamPlanCard', () => ({ default: () => 'Team Plan Card' }))

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cancel']}>
    <Route path="/:provider/:owner/cancel">{children}</Route>
  </MemoryRouter>
)

describe('TeamPlanSpecialOffer', () => {
  it('renders the header', async () => {
    render(<TeamPlanSpecialOffer />, { wrapper })

    const header = await screen.findByRole('heading', {
      name: 'Alternative plan offer',
    })
    expect(header).toBeInTheDocument()
  })

  it('renders team plan card', async () => {
    render(<TeamPlanSpecialOffer />, { wrapper })

    const teamPlanCard = await screen.findByText('Team Plan Card')
    expect(teamPlanCard).toBeInTheDocument()
  })

  it('renders link to change plan', async () => {
    render(<TeamPlanSpecialOffer />, { wrapper })

    const link = await screen.findByRole('link', {
      name: /No thanks, I'll proceed with cancellation/,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel/downgrade')
  })
})
