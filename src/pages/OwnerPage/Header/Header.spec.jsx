import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('./HeaderBanners/HeaderBanners', () => () => 'HeaderBanners')
jest.mock('config')

const queryClient = new QueryClient()

describe('Header', () => {
  afterAll(() => jest.clearAllMocks())

  function setup(props = {}, isUploadsExceeded = false, isSelfHosted = false) {
    config.IS_SELF_HOSTED = isSelfHosted

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
  })

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

      it('does not render the context switcher', () => {
        expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
      })
    })
  })

  describe('in enterprise', () => {
    describe('when user is part of the org', () => {
      beforeEach(() => {
        setup(
          {
            provider: 'gh',
            owner: {
              username: 'codecov',
              isCurrentUserPartOfOrg: true,
            },
          },
          false,
          true
        )
      })

      it('renders the context switcher', () => {
        expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
      })
    })

    describe('when user is not part of the org', () => {
      beforeEach(() => {
        setup(
          {
            provider: 'gh',
            owner: {
              username: 'codecov',
              isCurrentUserPartOfOrg: false,
            },
          },
          false,
          true
        )
      })

      it('renders the title of the owner', () => {
        expect(
          screen.getByRole('heading', {
            name: /codecov/i,
          })
        ).toBeInTheDocument()
      })

      it('does not render the context switcher', () => {
        expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
      })
    })
  })
})
