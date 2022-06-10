import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEncodeString } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import SecretString from './SecretString'

jest.mock('services/toastNotification')
jest.mock('services/repo')

const queryClient = new QueryClient()

describe('SecretString', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup(value = '') {
    useAddNotification.mockReturnValue(addNotification)
    useEncodeString.mockReturnValue({
      isLoading: false,
      mutate,
      data: {
        value,
      },
    })

    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/codecov-client/settings/yaml']}
      >
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings/yaml">
            <SecretString />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders SecretString componenet', () => {
    beforeEach(() => {
      setup('')
    })
    it('renders title', () => {
      const title = screen.getByText('Secret string')
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        /Secret strings are encrypted values used instead of plain text data that may be sensitive to eyes. The resulting string can be made public and used in your codecov yaml./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders generate button', () => {
      expect(
        screen.getByRole('button', { name: 'Create New Secret String' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Create New Secret String button', () => {
    beforeEach(() => {
      setup()
      userEvent.click(
        screen.getByRole('button', { name: 'Create New Secret String' })
      )
    })

    it('displays the generate secret string modal', () => {
      expect(screen.getByText('Create Secret String')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Please type the information you would like encrypted:'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Generate' })
      ).toBeInTheDocument()
    })

    describe('when user clicks on Generate button', () => {
      beforeEach(async () => {
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Secret String' }),
          'test'
        )
        await act(
          async () =>
            await userEvent.click(
              screen.getByRole('button', { name: 'Generate' })
            )
        )
      })
      it('calls the mutation', () => {
        expect(mutate).toHaveBeenCalled()
      })

      it('renders the new token', () => {
        expect(screen.getByText('New secret string')).toBeInTheDocument()
      })

      describe('when user clicks on Close button', () => {
        beforeEach(() => {
          userEvent.click(screen.getByRole('button', { name: 'Close' }))
        })

        it('closes the modal', () => {
          expect(
            screen.getByText('Create New Secret String')
          ).toBeInTheDocument()
        })
      })
    })

    describe('when mutation is not successful', () => {
      beforeEach(async () => {
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Secret String' }),
          'test'
        )
        await act(
          async () =>
            await userEvent.click(
              screen.getByRole('button', { name: 'Generate' })
            )
        )
        mutate.mock.calls[0][1].onError()
      })
      it('calls the mutation', () => {
        expect(mutate).toHaveBeenCalled()
      })

      it('adds an error notification', () => {
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were unable to generate the secret string',
        })
      })
    })
  })
})
