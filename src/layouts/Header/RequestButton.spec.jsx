import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import * as Segment from 'services/tracking/segment'

import RequestButton from './RequestButton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})
const server = setupServer()

const trackSegmentSpy = jest.spyOn(Segment, 'trackSegmentEvent')

jest.mock('config')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('RequestButton', () => {
  function setup(accountDetails) {
    server.use(
      graphql.mutation('Seats', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      rest.get(
        '/internal/:provider/:owner/account-details/',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      ),
      rest.get('/internal/users/current', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: {} }))
      })
    )

    return {
      user: userEvent.setup(),
    }
  }

  describe('when the owner is not part of the org', () => {
    beforeEach(() => {
      setup(null)
    })

    it('does not render the request button', () => {
      render(<RequestButton owner="beauregard" provider="gh" />, { wrapper })
      expect(screen.queryByText(/Request Button/)).toBeNull()
    })

    it(`renders null when there isn't data`, () => {
      const { container } = render(
        <RequestButton owner="beauregard" provider="gh" />,
        { wrapper }
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the owner is part of the org', () => {
    it('renders request demo button if org has a free plan', async () => {
      setup({
        plan: {
          value: 'users-free',
        },
      })

      render(<RequestButton owner="beauregard" provider="gh" />, { wrapper })

      const requestDemoButton = await screen.findByTestId('request-demo')
      expect(requestDemoButton).toBeInTheDocument()
      expect(requestDemoButton).toHaveAttribute(
        'href',
        'https://about.codecov.io/demo'
      )
    })

    it('sends a tracking event when clicked and users are free', async () => {
      const { user } = setup({
        plan: {
          value: 'users-free',
        },
      })

      render(<RequestButton owner="beauregard" provider="gh" />, { wrapper })

      const button = await screen.findByTestId('request-demo')
      await user.click(button)
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
    })

    it('does not render request demo button when owner without free plan is logged in', () => {
      setup({
        plan: {
          value: 'not-users-free',
        },
      })

      render(<RequestButton owner="beauregard" provider="gh" />, { wrapper })

      expect(screen.queryByText(/Request demo/)).toBeNull()
    })
  })

  describe('when the app is in enterprise mode', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true

      setup(null)
    })
    afterEach(() => jest.resetAllMocks())

    it('does not render the request button', () => {
      render(<RequestButton owner="beauregard" provider="gh" />, { wrapper })

      expect(screen.queryByText(/Request Button/)).toBeNull()
    })

    it(`renders null when there isn't data`, () => {
      const { container } = render(
        <RequestButton owner="beauregard" provider="gh" />,
        { wrapper }
      )
      expect(container).toBeEmptyDOMElement()
    })
  })
})
