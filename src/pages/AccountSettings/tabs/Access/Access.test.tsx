import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import Access from './Access'

window.confirm = vi.fn(() => true)

const mockSignedInUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
      customerIntent: 'PERSONAL',
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const mockSessionInfo = {
  me: {
    sessions: {
      edges: [
        {
          node: {
            sessionid: 32,
            ip: '172.21.0.1',
            lastseen: subDays(new Date(), 3).toISOString(),
            useragent: 'Chrome/5.0 (Windows; Intel 10)',
            type: 'login',
            name: null,
            lastFour: 'baaa',
          },
        },
      ],
    },
    tokens: {
      edges: [],
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

let testLocation: ReturnType<typeof useLocation>
const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/account/gh/janedoe/access') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Suspense fallback={<p>loading</p>}>
          <Route path="/account/:provider/:owner/access">{children}</Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </Suspense>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AccessTab', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('MySessions', (info) => {
        return HttpResponse.json({ data: mockSessionInfo })
      }),
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockSignedInUser })
      }),
      graphql.mutation('DeleteSession', (info) => {
        return HttpResponse.json({ data: {} })
      })
    )

    return { user }
  }

  describe('when rendering on base url', () => {
    describe('renders elements', () => {
      it('renders title', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const title = await screen.findByText(/API Tokens/)
        expect(title).toBeInTheDocument()
      })

      it('renders button', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const button = await screen.findByText(/Generate Token/)
        expect(button).toBeInTheDocument()
      })

      it('renders sessions title', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const sessionsTitle = await screen.findByText(/Login Sessions/)
        expect(sessionsTitle).toBeInTheDocument()
      })

      it('renders tokens summary', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const tokenSummary = await screen.findByText(
          /Tokens created to access Codecov/
        )
        expect(tokenSummary).toBeInTheDocument()
      })

      it('renders tokens docs link', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const tokenDocsLink = await screen.findByRole('link', {
          name: 'learn more',
        })
        expect(tokenDocsLink).toBeInTheDocument()
      })

      it('renders no tokens message', async () => {
        setup()
        render(<Access />, { wrapper: wrapper() })

        const sessionsTitle = await screen.findByText(/No tokens created yet/)
        expect(sessionsTitle).toBeInTheDocument()
      })
    })

    describe('on revoke', () => {
      it('triggers confirmation Modal', async () => {
        const { user } = setup()
        render(<Access />, { wrapper: wrapper() })

        const revokeButtons = await screen.findAllByText(/Revoke/)

        await user.click(revokeButtons[0]!)

        await waitFor(() => expect(window.confirm).toHaveBeenCalled())
      })
    })

    describe('on open modal', () => {
      it('opens create token modal', async () => {
        const { user } = setup()
        render(<Access />, { wrapper: wrapper() })

        const generateToken = await screen.findByText(/Generate Token/)
        await user.click(generateToken)

        const modalText = await screen.findByText(
          'Generate new API access token'
        )
        expect(modalText).toBeInTheDocument()

        const cancelBtn = await screen.findByText(/Cancel/)
        await user.click(cancelBtn)

        const generateToken_2 = await screen.findByText('Generate Token')
        expect(generateToken_2).toBeInTheDocument()
      })
    })
  })

  describe('user is not viewing their own settings', () => {
    it('redirects the user', async () => {
      setup()

      render(<Access />, { wrapper: wrapper('/account/gh/codecov/access') })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/account/gh/codecov')
      )
    })
  })
})
