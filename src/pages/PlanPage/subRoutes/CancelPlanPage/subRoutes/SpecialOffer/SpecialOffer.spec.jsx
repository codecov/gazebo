import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import SpecialOffer from './SpecialOffer'

const mockBody = jest.fn()
const mockToast = jest.fn()
jest.mock('services/toastNotification', () => ({
  useAddNotification: () => (data) => mockToast(data),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = '/plan/gh/codecov/cancel') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider/:owner/cancel">{children}</Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
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
afterAll(() => {
  server.close()
})

describe('SpecialOffer', () => {
  function setup(
    { unsuccessfulReq = false, multipleTiers } = {
      unsuccessfulReq: false,
      multipleTiers: false,
    }
  ) {
    const user = userEvent.setup()

    server.use(
      rest.patch(
        '/internal/gh/codecov/account-details',
        async (req, res, ctx) => {
          if (unsuccessfulReq) {
            return res(ctx.status(500))
          }

          const body = await req.json()
          mockBody(body)

          return res(ctx.status(200))
        }
      )
    )

    return { user }
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders header', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const header = screen.getByRole('heading', {
        name: "We'd love to keep you under our umbrella.",
      })
      expect(header).toBeInTheDocument()
    })

    it('renders first body text', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const body = screen.getByText(
        'Keep enjoying the features that help you analyze your code coverage quickly so you can deploy with confidence... for less.'
      )
      expect(body).toBeInTheDocument()
    })

    it('renders discount message', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const discountMessage = screen.getByText(
        'Get 30% off Codecov for 6 months! 🎉'
      )
      expect(discountMessage).toBeInTheDocument()
    })

    it('renders discount button', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const button = screen.getByRole('button', {
        name: "Yes, I'd like 6 months with 30% discount",
      })
      expect(button).toBeInTheDocument()
    })

    it('renders link to downgrade plan', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const link = screen.getByRole('link', {
        name: /No thanks, I'll proceed to the basic plan/,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel/downgrade')
    })

    it('renders question with link to sales', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const paragraph = screen.getByText(/Questions\?/)
      expect(paragraph).toBeInTheDocument()

      const salesLink = screen.getByRole('link', { name: /Contact Sales/ })
      expect(salesLink).toBeInTheDocument()
      expect(salesLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/sales'
      )
    })
  })

  describe('user accepts discount offer', () => {
    describe('discount is successfully applied', () => {
      it('passes the correct body', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockBody).toHaveBeenCalledWith({
            apply_cancellation_discount: true,
          })
        )
      })

      it('renders a success toast', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockToast).toHaveBeenCalledWith({
            type: 'success',
            text: 'Discount successfully applied.',
          })
        )
      })

      it('redirects the user to the org page', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() => expect(testLocation.pathname).toBe('/gh/codecov'))
      })
    })

    describe('discount is not successfully applied', () => {
      it('renders an error toast', async () => {
        const { user } = setup({ unsuccessfulReq: true })
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockToast).toHaveBeenCalledWith({
            type: 'error',
            text: 'Something went wrong while applying discount.',
          })
        )
      })
    })
  })

  describe('user continues with downgrade', () => {
    it('navigates to downgrade page', async () => {
      const { user } = setup({ unsuccessfulReq: true })
      render(<SpecialOffer />, { wrapper: wrapper() })

      const link = screen.getByRole('link', {
        name: /No thanks, I'll proceed to the basic plan/,
      })
      expect(link).toBeInTheDocument()

      expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel')

      await user.click(link)

      expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel/downgrade')
    })
  })
})
