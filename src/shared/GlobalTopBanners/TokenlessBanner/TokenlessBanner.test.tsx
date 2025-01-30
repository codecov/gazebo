import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import TokenlessBanner from './TokenlessBanner'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', () => ({
  useFlags: mocks.useFlags,
}))

vi.mock('services/users')

vi.mock('./TokenRequiredBanner', () => ({
  default: () => 'TokenRequiredBanner',
}))
vi.mock('./TokenNotRequiredBanner', () => ({
  default: () => 'TokenNotRequiredBanner',
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

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
      plan: Plans.USERS_BASIC,
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

const wrapper =
  (initialEntries = ['/gh/codecov']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('TokenlessBanner', () => {
  function setup({
    tokenlessSection = true,
    uploadTokenRequired = false,
    currentUser,
  }: {
    tokenlessSection?: boolean
    uploadTokenRequired?: boolean
    currentUser?: any
  } = {}) {
    mocks.useFlags.mockReturnValue({ tokenlessSection })

    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({
          data: {
            owner: {
              uploadTokenRequired,
              isAdmin: true,
              orgUploadToken: 'test-mock-org-upload-token',
            },
          },
        })
      }),
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: currentUser })
      })
    )
  }

  it('renders nothing when tokenlessSection flag is false', () => {
    setup({ tokenlessSection: false, currentUser: mockSignedInUser })
    const { container } = render(<TokenlessBanner />, {
      wrapper: wrapper(['/gh/codecov']),
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when owner is not provided', () => {
    setup()
    const { container } = render(<TokenlessBanner />, {
      wrapper: wrapper(['/gh/codecov']),
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('renders TokenRequiredBanner when uploadTokenRequired is true', async () => {
    setup({ uploadTokenRequired: true, currentUser: mockSignedInUser })
    render(<TokenlessBanner />, { wrapper: wrapper(['/gh/codecov']) })

    await waitFor(() => {
      const banner = screen.getByText('TokenRequiredBanner')
      expect(banner).toBeInTheDocument()
    })
  })

  it('renders TokenNotRequiredBanner when uploadTokenRequired is false', async () => {
    setup({ uploadTokenRequired: false, currentUser: mockSignedInUser })
    render(<TokenlessBanner />, { wrapper: wrapper(['/gh/codecov']) })

    await waitFor(() => {
      const banner = screen.getByText('TokenNotRequiredBanner')
      expect(banner).toBeInTheDocument()
    })
  })

  it('renders nothing if coming from onboarding', async () => {
    setup({ uploadTokenRequired: true, currentUser: mockSignedInUser })
    render(<TokenlessBanner />, {
      wrapper: wrapper(['/gh/codecov?source=onboarding']),
    })
    await waitFor(() => {
      expect(screen.queryByText('TokenRequiredBanner')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(
        screen.queryByText('TokenNotRequiredBanner')
      ).not.toBeInTheDocument()
    })
  })

  it('renders nothing when currentUser is not provided', () => {
    setup({ uploadTokenRequired: false, currentUser: mockSignedInUser })
    const { container } = render(<TokenlessBanner />, { wrapper: wrapper() })
    expect(container).toBeEmptyDOMElement()
  })
})
