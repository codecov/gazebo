import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import DetailsSection from './DetailsSection'

jest.mock('services/toastNotification')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/RulaKhaled']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('DetailsSection', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    server.use(
      graphql.mutation('UpdateProfile', (req, res, ctx) => {
        mutate(req.variables)

        return res(
          ctx.status(200),
          ctx.data({
            updateProfile: {
              me: {
                username: 'donald duck',
                email: req.variables.input.email
                  ? req.variables.input.email
                  : 'donald@duck.com',
                name: req.variables.input.name
                  ? req.variables.input.name
                  : 'donald duck',
                avatarUrl: 'photo',
                onboardingCompleted: false,
              },
            },
          })
        )
      })
    )

    return { mutate, addNotification, user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the name and email input with the data of the user', async () => {
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const name = await screen.findByTestId('name-input')
      expect(name).toHaveValue('donald duck')

      const email = await screen.findByTestId('email-input')
      expect(email).toHaveValue('donald@duck.com')
    })

    it('has the submit button disabled', async () => {
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const saveChangesButton = await screen.findByRole('button', {
        name: /save changes/i,
      })
      expect(saveChangesButton).toBeDisabled()
    })
  })

  describe('when updating one field', () => {
    it('updates the field with the right value', async () => {
      const { user } = setup()
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const emailField = await screen.findByTestId('email-input')
      await user.type(emailField, '{backspace}{backspace}{backspace}nl')

      const email = await screen.findByTestId('email-input')
      expect(email).toHaveValue('donald@duck.nl')
    })
  })

  describe('when submitting with an empty name', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const nameField = await screen.findByTestId('name-input')
      await user.tripleClick(nameField)
      await user.keyboard('{backspace}')

      const saveChanges = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(saveChanges)

      const nameIsRequired = await screen.findByText('Name is required')
      expect(nameIsRequired).toBeInTheDocument()
    })
  })

  describe('when submitting with an empty email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const emailField = await screen.findByTestId('email-input')
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}')
      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      const error = await screen.findByText('Not a valid email')
      expect(error).toBeInTheDocument()
    })
  })

  describe('when submitting with a wrong email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const emailField = await screen.findByTestId('email-input')
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}blaabla')
      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      const error = await screen.findByText('Not a valid email')
      expect(error).toBeInTheDocument()
    })
  })

  describe('when submitting correct data', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup()
      render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
        wrapper,
      })

      const nameField = await screen.findByTestId('name-input')
      await user.tripleClick(nameField)
      await user.keyboard('{backspace}picsou')
      const button = await screen.findByRole('button', {
        name: /save changes/i,
      })
      await user.click(button)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    describe('when mutation is successful', () => {
      it('adds a success notification', async () => {
        const { user, mutate, addNotification } = setup()
        render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
          wrapper,
        })

        const nameField = await screen.findByTestId('name-input')
        await user.tripleClick(nameField)
        await user.keyboard('{backspace}picsou')
        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        await user.click(button)

        await waitFor(() => expect(mutate).toHaveBeenCalled())
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
        const { user, addNotification } = setup()
        render(<DetailsSection name="donald duck" email="donald@duck.com" />, {
          wrapper,
        })

        const nameField = await screen.findByTestId('name-input')
        await user.tripleClick(nameField)
        await user.keyboard('{backspace}picsou')
        const button = await screen.findByRole('button', {
          name: /save changes/i,
        })
        await user.click(button)

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
