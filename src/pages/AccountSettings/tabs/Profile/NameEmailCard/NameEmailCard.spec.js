import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useAddNotification } from 'services/toastNotification'

import NameEmailCard from './NameEmailCard'

jest.mock('services/toastNotification')

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

describe('NameEmailCard', () => {
  const addNotification = jest.fn()

  function setup() {
    server.use(
      graphql.mutation('UpdateProfile', (req, res, ctx) => {
        if (req.body.variables.input.name === 'failTest') {
          return res(
            ctx.status(500)
            // ctx.errors([
            //   {
            //     message: 'Unable to update',
            //     locations: [
            //       {
            //         line: 8,
            //         column: 12,
            //       },
            //     ],
            //   },
            // ])
          )
        } else {
          return res(
            ctx.data({
              updateProfile: {
                me: {
                  email: req.body.variables.input.email || '',
                  user: { name: req.body.variables.input.name || '' },
                },
              },
            })
          )
        }
      })
    )
    useAddNotification.mockReturnValue(addNotification)

    render(
      <QueryClientProvider client={queryClient}>
        <NameEmailCard currentUser={currentUser} provider="gh" />
      </QueryClientProvider>
    )
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('renders the name and email input with the data of the user', () => {
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
      expect(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      ).toBeDisabled()
    })
  })

  describe('when updating one field', () => {
    beforeEach(() => {
      setup()
    })

    it('updates the field with the right value', async () => {
      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      userEvent.type(emailField, '{backspace}{backspace}{backspace}nl')

      const textBox = await screen.findByRole('textbox', {
        name: /email/i,
      })
      expect(textBox).toHaveValue('donald@duck.nl')
    })
  })

  describe('when submitting with an empty name', () => {
    beforeEach(() => {
      setup()
    })

    it('renders an error message', async () => {
      const nameField = await screen.findByRole('textbox', {
        name: /name/i,
      })
      userEvent.type(nameField, '{selectall}{backspace}')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      userEvent.click(button)

      const nameRequired = await screen.findByText('Name is required')
      expect(nameRequired).toBeInTheDocument()
    })
  })

  describe('when submitting with an empty email', () => {
    beforeEach(() => {
      setup()
    })

    it('renders an error message', async () => {
      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      userEvent.type(emailField, '{selectall}{backspace}')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      userEvent.click(button)

      const emailRequired = await screen.findByText('Email is required')
      expect(emailRequired).toBeInTheDocument()
    })
  })

  describe('when submitting with a wrong email', () => {
    beforeEach(() => {
      setup()
    })

    it('renders an error message', async () => {
      const emailField = await screen.findByRole('textbox', {
        name: /email/i,
      })
      userEvent.type(emailField, '{selectall}{backspace}blaabla')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      userEvent.click(button)

      const invalidEmail = await screen.findByText('Not a valid email')
      expect(invalidEmail).toBeInTheDocument()
    })
  })

  describe('when submitting correct data', () => {
    beforeEach(() => {
      setup()
    })

    it('updates the fields with the new values', async () => {
      const nameField = await screen.findByRole('textbox', {
        name: /name/i,
      })
      userEvent.type(nameField, '{selectall}{backspace}picsou')

      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      userEvent.click(button)

      await waitFor(() => queryClient.isMutating)
      await waitFor(() => !queryClient.isMutating)

      const textBox = await screen.findByRole('textbox', {
        name: /name/i,
      })
      expect(textBox).toHaveValue('picsou')
    })

    describe('when mutation is successful', () => {
      it('adds a success notification', async () => {
        const nameField = await screen.findByRole('textbox', {
          name: /name/i,
        })
        userEvent.type(nameField, '{selectall}{backspace}picsou')

        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        userEvent.click(button)

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
        const nameField = await screen.findByRole('textbox', {
          name: /name/i,
        })
        userEvent.type(nameField, '{selectall}{backspace}')
        userEvent.type(nameField, 'failTest')

        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        userEvent.click(button)

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
