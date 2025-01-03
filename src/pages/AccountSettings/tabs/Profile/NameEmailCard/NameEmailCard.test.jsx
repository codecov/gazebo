import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useAddNotification } from 'services/toastNotification'

import NameEmailCard from './NameEmailCard'

vi.mock('services/toastNotification')

const currentUser = {
  name: 'donald duck',
  email: 'donald@duck.com',
}
const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('NameEmailCard', () => {
  function setup() {
    const user = userEvent.setup()
    const addNotification = vi.fn()
    server.use(
      graphql.mutation('UpdateProfile', async (info) => {
        const json = await info.request.json()

        if (json.variables.input.name === 'failTest') {
          return HttpResponse.json({ data: {} }, { status: 500 })
        } else {
          return HttpResponse.json({
            data: {
              updateProfile: {
                me: {
                  email: json.variables.input.email || '',
                  privateAccess: null,
                  onboardingCompleted: true,
                  businessEmail: null,
                  user: {
                    name: json.variables.input.name || '',
                    username: 'test',
                    avatarUrl: 'http://127.0.0.1/avatar-url',
                    avatar: 'http://127.0.0.1/avatar-url',
                    student: false,
                    studentCreatedAt: null,
                    studentUpdatedAt: null,
                  },
                },
              },
            },
          })
        }
      })
    )
    useAddNotification.mockReturnValue(addNotification)

    return { addNotification, user }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders the name and email input with the data of the user', () => {
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      expect(
        screen.getByRole('textbox', {
          name: /name/i,
        })
      ).toHaveValue(currentUser.name)
      expect(
        screen.getByRole('textbox', {
          name: /email/i,
        })
      ).toHaveValue(currentUser.email)
    })

    it('has the submit button disabled', () => {
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      expect(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      ).toBeDisabled()
    })
  })

  describe('when updating one field', () => {
    it('updates the field with the right value', async () => {
      const { user } = setup()
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      await user.type(emailField, '{backspace}{backspace}{backspace}nl')

      const textBox = await screen.findByRole('textbox', {
        name: /email/i,
      })
      expect(textBox).toHaveValue('donald@duck.nl')
    })
  })

  describe('when submitting with an empty name', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      const nameField = await screen.findByRole('textbox', {
        name: /name/i,
      })
      await user.tripleClick(nameField)
      await user.keyboard('{backspace}')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      const nameRequired = await screen.findByText('Name is required')
      expect(nameRequired).toBeInTheDocument()
    })
  })

  describe('when submitting with an empty email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      const notValidEmail = await screen.findByText('Not a valid email')
      expect(notValidEmail).toBeInTheDocument()
    })
  })

  describe('when submitting with a wrong email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}blaabla')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      const invalidEmail = await screen.findByText('Not a valid email')
      expect(invalidEmail).toBeInTheDocument()
    })
  })

  describe('when submitting correct data', () => {
    it('updates the fields with the new values', async () => {
      const { user } = setup()
      render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
        wrapper,
      })

      const nameField = await screen.findByRole('textbox', {
        name: /name/i,
      })

      await user.tripleClick(nameField)
      await user.keyboard('{backspace}picsou')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      await waitFor(() => queryClient.isMutating)
      await waitFor(() => !queryClient.isMutating)

      const textBox = await screen.findByRole('textbox', {
        name: /name/i,
      })
      expect(textBox).toHaveValue('picsou')
    })

    describe('when mutation is successful', () => {
      it('adds a success notification', async () => {
        const { addNotification, user } = setup()
        render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
          wrapper,
        })

        const nameField = await screen.findByRole('textbox', {
          name: /name/i,
        })

        await user.tripleClick(nameField)
        await user.keyboard('{backspace}picsou')

        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        await user.click(button)

        await waitFor(() => queryClient.isMutating)
        await waitFor(() => !queryClient.isMutating)

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'success',
            text: 'Information successfully updated',
          })
        )
      })
    })

    describe('when mutation is not successful', () => {
      it('adds an error notification', async () => {
        const { addNotification, user } = setup()
        render(<NameEmailCard currentUser={currentUser} provider="gh" />, {
          wrapper,
        })

        const nameField = await screen.findByRole('textbox', {
          name: /name/i,
        })

        await user.tripleClick(nameField)
        await user.keyboard('failTest')

        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        await user.click(button)

        await waitFor(() => queryClient.isMutating)
        await waitFor(() => !queryClient.isMutating)

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'Something went wrong',
          })
        )
      })
    })
  })
})
