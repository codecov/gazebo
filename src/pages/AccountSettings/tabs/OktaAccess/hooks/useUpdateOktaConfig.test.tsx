import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { useAddNotification } from 'services/toastNotification/context'

import {
  SaveOktaConfigMessage,
  useUpdateOktaConfig,
} from './useUpdateOktaConfig'

vi.mock('services/toastNotification/context')
const mockedToastNotification = useAddNotification as Mock

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

const provider = 'gh'
const owner = 'codecov'

const oktaConfigDetails = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  url: 'https://example.com',
  enabled: true,
  enforced: true,
  orgUsername: owner,
}

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useUpdateOktaConfig', () => {
  const addToast = vi.fn()

  const setup = (response: any) => {
    mockedToastNotification.mockReturnValue(addToast)

    server.use(
      graphql.mutation(`SaveOktaConfig`, () => {
        return HttpResponse.json({ data: response })
      })
    )
  }

  describe('when calling the mutation', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('shows a success toast notification on successful response', async () => {
      setup({
        saveOktaConfig: {
          error: null,
        },
      })

      const { result } = renderHook(
        () => useUpdateOktaConfig({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => result.current.mutate(oktaConfigDetails))
      await waitFor(() =>
        expect(addToast).toHaveBeenCalledWith({
          type: 'success',
          text: 'Okta configuration saved successfully!',
          disappearAfter: 10000,
        })
      )
    })

    it('fails on invalid response schema', async () => {
      setup({
        saveOktaConfig: {
          error: {
            __typename: 'RandomError',
            message: 'Invalid input',
          },
        },
      })

      const { result } = renderHook(
        () => useUpdateOktaConfig({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate(oktaConfigDetails)

      await waitFor(() =>
        expect(addToast).toHaveBeenCalledWith({
          type: 'error',
          text: expect.anything(),
          disappearAfter: 10000,
        })
      )
    })

    it('shows an error toast notification on validation error response', async () => {
      setup({
        saveOktaConfig: {
          error: {
            __typename: 'ValidationError',
            message: 'Invalid input',
          },
        },
      })

      const { result } = renderHook(
        () => useUpdateOktaConfig({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate(oktaConfigDetails)

      await waitFor(() =>
        expect(addToast).toHaveBeenCalledWith({
          type: 'error',
          text: <SaveOktaConfigMessage />,
          disappearAfter: 10000,
        })
      )
    })

    it('shows an error toast notification on unauthorized error response', async () => {
      setup({
        saveOktaConfig: {
          error: {
            __typename: 'UnauthorizedError',
            message: 'Unauthorized',
          },
        },
      })

      const { result } = renderHook(
        () => useUpdateOktaConfig({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate(oktaConfigDetails)

      await waitFor(() =>
        expect(addToast).toHaveBeenCalledWith({
          type: 'error',
          text: <SaveOktaConfigMessage />,
          disappearAfter: 10000,
        })
      )
    })

    it('shows an error toast notification on unauthenticated error response', async () => {
      setup({
        saveOktaConfig: {
          error: {
            __typename: 'UnauthenticatedError',
            message: 'Unauthenticated',
          },
        },
      })

      const { result } = renderHook(
        () => useUpdateOktaConfig({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate(oktaConfigDetails)

      await waitFor(() =>
        expect(addToast).toHaveBeenCalledWith({
          type: 'error',
          text: <SaveOktaConfigMessage />,
          disappearAfter: 10000,
        })
      )
    })
  })
})

describe('When okta config message is rendered', () => {
  it('renders the correct message', () => {
    render(<SaveOktaConfigMessage />, { wrapper: wrapper() })

    const message = screen.getByText(/Error saving Okta config./)
    expect(message).toBeInTheDocument()
  })

  it('renders the correct link', () => {
    render(<SaveOktaConfigMessage />, { wrapper: wrapper() })

    const link = screen.getByText(/Contact us/)
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute(
      'href',
      'https://codecovpro.zendesk.com/hc/en-us'
    )
  })
})
