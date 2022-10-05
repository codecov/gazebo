import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import DeletionCard from './DeletionCard'

jest.mock('services/toastNotification')

const queryClient = new QueryClient({
  logger: {
    error: () => {},
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

describe('DeletionCard', () => {
  let returnError = false
  const addNotification = jest.fn()

  function setup(over = {}) {
    const props = {
      provider: 'gh',
      owner: 'codecov',
      isPersonalSettings: true,
      ...over,
    }

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.delete('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        if (returnError) {
          return res(ctx.status(500))
        }
        return res(ctx.status(200))
      })
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeletionCard {...props} />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('when rendering for individual', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the copy for individual', () => {
      expect(
        screen.getByText(
          /erase all my personal content and personal projects\./i
        )
      ).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      expect(
        screen.getByRole('button', {
          name: /erase account/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to erase', () => {
    beforeEach(() => {
      setup()
    })

    it('opens the modal with warning', async () => {
      const eraseButton = await screen.findByRole('button', {
        name: /erase account/i,
      })
      userEvent.click(eraseButton)

      const confirmationButton = await screen.findByRole('heading', {
        name: /are you sure\?/i,
      })
      expect(confirmationButton).toBeInTheDocument()
    })

    describe('when clicking Cancel', () => {
      it('closes the modal', async () => {
        const eraseButton = await screen.findByRole('button', {
          name: /erase account/i,
        })
        userEvent.click(eraseButton)

        const cancelButton = await screen.findByRole('button', {
          name: /Cancel/,
        })
        userEvent.click(cancelButton)

        const confirmationButton = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(confirmationButton).not.toBeInTheDocument()
      })
    })

    describe('when clicking Close icon', () => {
      it('closes the modal', async () => {
        const eraseButton = await screen.findByRole('button', {
          name: /erase account/i,
        })
        userEvent.click(eraseButton)

        const closeButton = await screen.findByLabelText('Close')
        userEvent.click(closeButton)

        const heading = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(heading).not.toBeInTheDocument()
      })
    })

    describe('when confirming', () => {
      it('calls the mutation', async () => {
        const erase1Button = await screen.findByRole('button', {
          name: /erase account/i,
        })
        userEvent.click(erase1Button)

        const eraseButton = await screen.findByRole('button', {
          name: /Erase my account/,
        })
        userEvent.click(eraseButton)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())
      })
    })

    describe('when the mutation fails', () => {
      beforeEach(() => {
        returnError = true
      })

      it('adds an error notification', async () => {
        const erase1Button = await screen.findByRole('button', {
          name: /erase account/i,
        })
        userEvent.click(erase1Button)

        const eraseButton = await screen.findByRole('button', {
          name: /Erase my account/,
        })
        userEvent.click(eraseButton)

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
