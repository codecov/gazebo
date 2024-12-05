import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import EmailAddress from './EmailAddress'

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/plan/gh/codecov'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider/:owner">
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

const testEmail = 'testemail@gmail.com'

const mockAccountDetails = {
  subscriptionDetail: {
    customer: {
      email: testEmail,
    },
  },
}

describe('EmailAddress', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()

    server.use(
      http.get('/internal/gh/codecov/account-details', () => {
        return HttpResponse.json(mockAccountDetails)
      }),
      http.patch('/internal/gh/codecov/account-details/update_email', () => {
        mutate()
        return HttpResponse.json({})
      })
    )

    return { user, mutate }
  }

  describe(`when the form is closed`, () => {
    beforeEach(() => setup())

    it('shows the email field', async () => {
      render(<EmailAddress />, { wrapper: wrapper() })

      const currentEmail = await screen.findByText('testemail@gmail.com')
      expect(currentEmail).toBeInTheDocument()
    })

    it('shows the email title field', async () => {
      render(<EmailAddress />, { wrapper: wrapper() })

      const emailTitle = await screen.findByText('Email address')
      expect(emailTitle).toBeInTheDocument()
    })

    it('shows the edit email button', async () => {
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      expect(editButton).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit card', () => {
    it('shows the placeholder email', async () => {
      const { user } = setup()
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      await user.click(editButton)

      const placeholderEmail = await screen.findByText('Your email')
      expect(placeholderEmail).toBeInTheDocument()
    })

    it('shows the update button', async () => {
      const { user } = setup()
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      await user.click(editButton)

      const updateButton = screen.getByRole('button', { name: /Update/i })
      expect(updateButton).toBeInTheDocument()
    })

    it('shows the cancel button', async () => {
      const { user } = setup()
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      await user.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      expect(cancelButton).toBeInTheDocument()
    })

    describe('when updating the email address', () => {
      it('successfully does it', async () => {
        const { user, mutate } = setup()
        render(<EmailAddress />, { wrapper: wrapper() })

        const editButton = await screen.findByTestId('edit-email')
        await user.click(editButton)

        const input = await screen.findByPlaceholderText('Your email')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of testEmail) {
          await user.type(input, '{backspace}')
        }
        await user.type(input, 'another-email@gmail.com')
        expect(input).toHaveValue('another-email@gmail.com')

        const updateButton = screen.getByRole('button', { name: /Update/i })
        await user.click(updateButton)

        await waitFor(() => expect(mutate).toHaveBeenCalled())
      })
    })

    describe('when pressing the cancel button', () => {
      it('successfully does it', async () => {
        const { user } = setup()
        render(<EmailAddress />, { wrapper: wrapper() })

        const editButton = await screen.findByTestId('edit-email')
        await user.click(editButton)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        await user.click(cancelButton)

        const updateButton = screen.queryByRole('button', { name: /Update/i })
        expect(updateButton).not.toBeInTheDocument()
      })
    })
  })

  describe('when validating email', () => {
    it('shows minimum entry error when email is empty', async () => {
      const { user } = setup()
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      await user.click(editButton)

      const input = await screen.findByPlaceholderText('Your email')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of testEmail) {
        await user.type(input, '{backspace}')
      }

      const validationError = await screen.findByText(
        /This field has to be filled/
      )
      expect(validationError).toBeInTheDocument()

      const updateButton = screen.getByRole('button', { name: /Update/i })
      expect(updateButton).toBeDisabled()
    })

    it('shows invalid email message when invalid email', async () => {
      const { user } = setup()
      render(<EmailAddress />, { wrapper: wrapper() })

      const editButton = await screen.findByTestId('edit-email')
      await user.click(editButton)

      const input = await screen.findByPlaceholderText('Your email')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of testEmail) {
        await user.type(input, '{backspace}')
      }
      await user.type(input, 'rand123tasdf')

      const validationError = await screen.findByText(/Invalid email address/)
      expect(validationError).toBeInTheDocument()

      const updateButton = screen.getByRole('button', { name: /Update/i })
      expect(updateButton).toBeDisabled()
    })
  })
})
