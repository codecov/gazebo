import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useIsUploadsNumberExceeded } from 'services/uploadsNumber'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/uploadsNumber')
jest.mock('config')

const queryClient = new QueryClient()

describe('Header', () => {
  afterAll(() => jest.clearAllMocks())
  function setup(props = {}, isUploadsExceeded = false, isEnterprise = false) {
    config.IS_ENTERPRISE = isEnterprise
    useIsUploadsNumberExceeded.mockReturnValue({ data: isUploadsExceeded })

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

  describe('in cloud', () => {
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
          screen.getByText(
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
          true
        )
      })

      it('renders the uploads number exceed alert', () => {
        expect(
          screen.getByText(/Upload limit has been reached/)
        ).toBeInTheDocument()
      })

      it('renders the body of the alert', () => {
        expect(
          screen.getByText(
            /This org is currently on the free plan; which includes 250 free uploads on a rolling monthly basis. This limit has been reached and the reports will not generate/
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
  describe('in enterprise', () => {
    describe('when user is part of the org', () => {
      beforeEach(() => {
        config.IS_ENTERPRISE = true

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

      it('Ask for feedback banner is not rendered', () => {
        expect(
          screen.queryByText(
            /We would love to hear your feedback! Let us know what you think/
          )
        ).not.toBeInTheDocument()
      })
    })
    describe('when user is not part of the org', () => {
      beforeEach(() => {
        config.IS_ENTERPRISE = true
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
  })
})
