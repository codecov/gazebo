import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import AccountOrgs from './AccountOrgs'

import { Account } from '../hooks/useEnterpriseAccountDetails'

const mockAccount: Account = {
  name: 'my-account',
  totalSeatCount: 10,
  activatedUserCount: 3,
  organizations: {
    totalCount: 4,
  },
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/plan/gh/codecov']}>
    <Route path="/plan/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('AccountOrgs', () => {
  it('renders Header', async () => {
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const header = await screen.findByText('Account details')
    expect(header).toBeInTheDocument()
    const description = await screen.findByText(
      /To modify your orgs and seats, please/
    )
    expect(description).toBeInTheDocument()
  })

  it('renders total orgs', async () => {
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Total organizations')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(mockAccount.organizations.totalCount)
    expect(number).toBeInTheDocument()
  })

  it('renders total seats', async () => {
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Total seats')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(mockAccount.totalSeatCount)
    expect(number).toBeInTheDocument()
  })

  it('renders seats remaining', async () => {
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Seats remaining')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(
      mockAccount.totalSeatCount - mockAccount.activatedUserCount
    )
    expect(number).toBeInTheDocument()
  })
})
