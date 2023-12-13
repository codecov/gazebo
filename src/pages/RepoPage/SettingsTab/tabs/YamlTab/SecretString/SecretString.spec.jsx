import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEncodeString } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import SecretString from './SecretString'

jest.mock('services/toastNotification')
jest.mock('services/repo')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings/yaml']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/settings/yaml">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

describe('SecretString', () => {
  function setup(value = '') {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    useEncodeString.mockReturnValue({
      isLoading: false,
      mutate,
      data: {
        value,
      },
    })

    return { mutate, addNotification, user }
  }

  describe('renders SecretString component', () => {
    beforeEach(() => setup(''))
    it('renders title', () => {
      render(<SecretString />, { wrapper })

      const title = screen.getByText('Secret string')
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<SecretString />, { wrapper })

      const p = screen.getByText(
        /Secret strings are encrypted values used instead of plain text data that may be sensitive to eyes. The resulting string can be made public and used in your codecov YAML./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders generate button', () => {
      render(<SecretString />, { wrapper })

      const createNewSecret = screen.getByRole('button', {
        name: 'Create New Secret String',
      })
      expect(createNewSecret).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Create New Secret String button', () => {
    it('displays the generate secret string modal', async () => {
      const { user } = setup('test')
      render(<SecretString />, { wrapper })

      const createNewSecret = screen.getByRole('button', {
        name: 'Create New Secret String',
      })
      await user.click(createNewSecret)

      const createSecretString = screen.getByText('Create Secret String')
      expect(createSecretString).toBeInTheDocument()
      const encryptedPrompt = screen.getByText(
        'Please type the information you would like encrypted:'
      )
      expect(encryptedPrompt).toBeInTheDocument()
      const generate = screen.getByRole('button', { name: 'Generate' })
      expect(generate).toBeInTheDocument()
    })

    describe('when user clicks on Generate button', () => {
      it('calls the mutation', async () => {
        const { user, mutate } = setup('test')
        render(<SecretString />, { wrapper })

        const createNewSecret = screen.getByRole('button', {
          name: 'Create New Secret String',
        })
        await user.click(createNewSecret)
        const secretString = screen.getByRole('textbox', {
          name: 'Secret String',
        })
        await user.type(secretString, 'test')

        const generate = screen.getByRole('button', { name: 'Generate' })
        await user.click(generate)

        expect(mutate).toHaveBeenCalled()
      })

      it('renders the new token', async () => {
        const { user } = setup('test')
        render(<SecretString />, { wrapper })

        const createNewSecret = screen.getByRole('button', {
          name: 'Create New Secret String',
        })
        await user.click(createNewSecret)
        const secretString = screen.getByRole('textbox', {
          name: 'Secret String',
        })
        await user.type(secretString, 'test')
        const generate = screen.getByRole('button', { name: 'Generate' })
        await user.click(generate)

        const newSecret = screen.getByText('New secret string')
        expect(newSecret).toBeInTheDocument()
      })

      describe('when user clicks on Close button', () => {
        beforeEach(() => {})

        it('closes the modal', async () => {
          const { user } = setup('test')
          render(<SecretString />, { wrapper })

          let createNewSecret = screen.getByRole('button', {
            name: 'Create New Secret String',
          })
          await user.click(createNewSecret)
          const secretString = screen.getByRole('textbox', {
            name: 'Secret String',
          })
          await user.type(secretString, 'test')
          const generate = screen.getByRole('button', { name: 'Generate' })
          await user.click(generate)

          const close = screen.getByRole('button', { name: 'Close' })
          await user.click(close)

          createNewSecret = screen.getByRole('button', {
            name: 'Create New Secret String',
          })
          expect(createNewSecret).toBeInTheDocument()
        })
      })
    })

    describe('when mutation is not successful', () => {
      it('calls the mutation', async () => {
        const { user, mutate } = setup('test')
        render(<SecretString />, { wrapper })

        const createNewSecret = screen.getByRole('button', {
          name: 'Create New Secret String',
        })
        await user.click(createNewSecret)
        const secretString = screen.getByRole('textbox', {
          name: 'Secret String',
        })
        await user.type(secretString, 'test')
        const generate = screen.getByRole('button', { name: 'Generate' })
        await user.click(generate)

        mutate.mock.calls[0][1].onError()

        expect(mutate).toHaveBeenCalled()
      })

      it('adds an error notification', async () => {
        const { user, mutate, addNotification } = setup('test')
        render(<SecretString />, { wrapper })

        const createNewSecret = screen.getByRole('button', {
          name: 'Create New Secret String',
        })
        await user.click(createNewSecret)
        const secretString = screen.getByRole('textbox', {
          name: 'Secret String',
        })
        await user.type(secretString, 'test')
        const generate = screen.getByRole('button', { name: 'Generate' })
        await user.click(generate)

        mutate.mock.calls[0][1].onError()

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were unable to generate the secret string',
        })
      })
    })
  })
})
