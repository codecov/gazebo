import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useImage } from 'services/image'
import { useFlags } from 'shared/featureFlags'

import BaseLayout from './BaseLayout'

jest.mock('services/image')
jest.mock('shared/featureFlags')

const mockOwner = {
  owner: {
    me: {},
    isCurrentUserPartOfOrg: true,
  },
}

const userSignedInIdentity = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'http://photo.com/codecov.png',
}

const loggedInLegacyUser = {
  me: {
    user: {
      ...userSignedInIdentity,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
  },
}

const loggedInUser = {
  me: {
    user: {
      ...userSignedInIdentity,
      termsAgreement: true,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
    termsAgreement: true,
  },
}

const loggedInUnsignedUser = {
  me: {
    user: {
      ...userSignedInIdentity,
      termsAgreement: false,
    },
    trackingMetadata: { ownerid: 123 },
    ...userSignedInIdentity,
    termsAgreement: false,
  },
}

const guestUser = {
  me: null,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/bb/batman/batcave']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BaseLayout', () => {
  afterEach(() => jest.resetAllMocks())
  function setup(
    { termsOfServicePage = false, currentUser = loggedInUser } = {
      termsOfServicePage: false,
      currentUser: loggedInUser,
    }
  ) {
    useImage.mockReturnValue({
      src: 'http://photo.com/codecov.png',
      isLoading: false,
      error: null,
    })
    useFlags.mockReturnValue({
      termsOfServicePage,
    })

    server.use(
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(currentUser))
      ),
      graphql.query('DetailOwner', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOwner))
      ),
      rest.get('/internal/:provider/:owner/account-details', (_, res, ctx) =>
        res(ctx.status(200), ctx.json({}))
      ),
      // Self hosted only
      graphql.query('HasAdmins', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('Seats', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('TermsOfService', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('UseMyOrganizations', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      rest.get('/internal/users/current', (_, res, ctx) =>
        res(ctx.status(200), ctx.json({}))
      )
    )
  }

  describe.each([
    ['cloud', false, 'TOS', /Welcome to Codecov/],
    ['self hosted', true, 'children', /hello/],
  ])('%s', (_, isSelfHosted, expectedPage, expectedMatcher) => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = isSelfHosted
    })
    afterAll(() => (config.IS_SELF_HOSTED = undefined))

    describe('user is guest', () => {
      beforeEach(() => {
        setup({ termsOfServicePage: false, currentUser: guestUser })
      })

      it('renders the children', async () => {
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        const tos = screen.queryByText('Welcome to Codecov')
        expect(tos).not.toBeInTheDocument()

        const hello = await screen.findByText('hello')
        expect(hello).toBeInTheDocument()
      })
    })

    describe('user is signed', () => {
      beforeEach(() =>
        setup({ termsOfServicePage: false, currentUser: loggedInUser })
      )

      it('renders the children', async () => {
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        const tos = screen.queryByText('Welcome to Codecov')
        expect(tos).not.toBeInTheDocument()

        const hello = await screen.findByText('hello')
        expect(hello).toBeInTheDocument()
      })
    })

    describe('user unsigned', () => {
      beforeEach(() =>
        setup({ termsOfServicePage: true, currentUser: loggedInUnsignedUser })
      )

      it(`renders the ${expectedPage}`, async () => {
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        const tos = await screen.findByText(expectedMatcher)
        expect(tos).toBeInTheDocument()
      })
    })

    describe('user was created pre TOS', () => {
      beforeEach(() =>
        setup({ termsOfServicePage: true, currentUser: loggedInLegacyUser })
      )

      it('renders the children', async () => {
        render(<BaseLayout>hello</BaseLayout>, {
          wrapper: wrapper(),
        })

        const tos = screen.queryByText('Welcome to Codecov')
        expect(tos).not.toBeInTheDocument()

        const hello = await screen.findByText('hello')
        expect(hello).toBeInTheDocument()
      })
    })
  })
})
