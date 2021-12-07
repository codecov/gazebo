import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useUploadsNumber } from 'services/uploadsNumber'
import { useAccountDetails } from 'services/account'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/uploadsNumber')
jest.mock('services/account')

const queryClient = new QueryClient()

describe('Header', () => {
  function setup(props = {}, plan = '', uploadsNumber = 0) {
    const accountDetails = {
      plan: {
        marketingName: 'Pro Team',
        baseUnitPrice: 12,
        benefits: ['Configureable # of users', 'Unlimited repos'],
        quantity: 5,
        value: plan,
      },
      activatedUserCount: 2,
      inactiveUserCount: 1,
    }
    useUploadsNumber.mockReturnValue({ data: uploadsNumber })
    useAccountDetails.mockReturnValue({ data: accountDetails })

    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner">
            <Header {...props} />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })

    it('Ask for feedback banner is rendered', () => {
      expect(
        screen.queryByText(
          /We would love to hear your feedback! Let us know what you think/
        )
      ).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    it('renders the title of the owner', () => {
      expect(
        screen.getByRole('heading', {
          name: /codecov/i,
        })
      ).toBeInTheDocument()
    })

    it('doesnt render the context switcher', () => {
      expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
    })
  })

  describe('when user is part of org and limits uploads exceeded', () => {
    beforeEach(() => {
      setup(
        {
          provider: 'gh',
          owner: {
            username: 'codecov',
            isCurrentUserPartOfOrg: true,
          },
        },
        'users-basic',
        250
      )
    })

    it('renders the uploads number exceed alert', () => {
      expect(
        screen.queryByText(/Upload limit has been reached/)
      ).toBeInTheDocument()
    })

    it('renders the body of the alert', () => {
      expect(
        screen.queryByText(
          /This org is currently on the free plan; which includes 250 free uploads monthly/
        )
      ).toBeInTheDocument()
    })

    it('does not render previous header', () => {
      expect(
        screen.queryByText(
          /We would love to hear your feedback! Let us know what you think/
        )
      ).not.toBeInTheDocument()
    })
  })
})
