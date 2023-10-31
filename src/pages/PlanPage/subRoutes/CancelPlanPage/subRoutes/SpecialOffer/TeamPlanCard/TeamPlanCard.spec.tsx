import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import TeamPlanCard from './TeamPlanCard'

jest.mock('shared/plan/BenefitList', () => () => 'BenefitsList')

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'yearly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
    <Route path="/plan/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('TeamPlanCard', () => {
  it('shows the monthly marketing name', async () => {
    render(
      <TeamPlanCard
        teamPlanMonth={teamPlanMonth}
        teamPlanYear={teamPlanYear}
      />,
      {
        wrapper,
      }
    )

    const marketingName = await screen.findByText(/Users Team/)
    expect(marketingName).toBeInTheDocument()
  })

  it('show the benefits list', async () => {
    render(
      <TeamPlanCard
        teamPlanMonth={teamPlanMonth}
        teamPlanYear={teamPlanYear}
      />,
      {
        wrapper,
      }
    )

    const benefitsIncludes = await screen.findByText(/Includes/)
    expect(benefitsIncludes).toBeInTheDocument()

    const benefitsList = await screen.findByText(/BenefitsList/)
    expect(benefitsList).toBeInTheDocument()
  })

  it('shows pricing for monthly card', async () => {
    render(
      <TeamPlanCard
        teamPlanMonth={teamPlanMonth}
        teamPlanYear={teamPlanYear}
      />,
      {
        wrapper,
      }
    )

    const yearlyPrice = await screen.findByText(/5/)
    expect(yearlyPrice).toBeInTheDocument()

    const monthlyPrice = await screen.findByText(/6/)
    expect(monthlyPrice).toBeInTheDocument()

    const auxiliaryText = await screen.findByText(/per user billing monthly/)
    expect(auxiliaryText).toBeInTheDocument()
  })

  it('shows action button', async () => {
    render(
      <TeamPlanCard
        teamPlanMonth={teamPlanMonth}
        teamPlanYear={teamPlanYear}
      />,
      {
        wrapper,
      }
    )

    const buttonText = await screen.findByText(/Change to Team plan/)
    expect(buttonText).toBeInTheDocument()
  })
})
