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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('DeletionCard', () => {
  function setup({ returnError = false } = { returnError: false }) {
    const user = userEvent.setup()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    server.use(
      rest.delete('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        if (returnError) {
          return res(ctx.status(500))
        }
        return res(ctx.status(200))
      })
    )

    return { addNotification, user }
  }

  describe('when rendering for individual', () => {
    beforeEach(() => setup())

    it('renders the copy for individual', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /erase all my personal content and personal projects\./i
        )
      ).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        { wrapper }
      )

      expect(
        screen.getByRole('button', {
          name: /erase account/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to erase', () => {
    it('opens the modal with warning', async () => {
      const { user } = setup()
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        { wrapper }
      )

      const eraseButton = await screen.findByRole('button', {
        name: /erase account/i,
      })
      await user.click(eraseButton)

      const confirmationButton = await screen.findByRole('heading', {
        name: /are you sure\?/i,
      })
      expect(confirmationButton).toBeInTheDocument()
    })

    describe('when clicking Cancel', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          { wrapper }
        )

        const eraseButton = await screen.findByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseButton)

        const cancelButton = await screen.findByRole('button', {
          name: /Cancel/,
        })
        await user.click(cancelButton)

        const confirmationButton = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(confirmationButton).not.toBeInTheDocument()
      })
    })

    describe('when clicking Close icon', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          { wrapper }
        )

        const eraseButton = await screen.findByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseButton)

        const closeButton = await screen.findByLabelText('Close')
        await user.click(closeButton)

        const heading = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(heading).not.toBeInTheDocument()
      })
    })

    describe('when confirming', () => {
      it('calls the mutation', async () => {
        const { user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          { wrapper }
        )

        const erase1Button = await screen.findByRole('button', {
          name: /erase account/i,
        })
        await user.click(erase1Button)

        const eraseButton = await screen.findByRole('button', {
          name: /Erase my account/,
        })
        await user.click(eraseButton)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())
      })
    })

    describe('when the mutation fails', () => {
      it('adds an error notification', async () => {
        const { user } = setup()
        const { addNotification } = setup({ returnError: true })
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          { wrapper }
        )

        const erase1Button = await screen.findByRole('button', {
          name: /erase account/i,
        })
        await user.click(erase1Button)

        const eraseButton = await screen.findByRole('button', {
          name: /Erase my account/,
        })
        await user.click(eraseButton)

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
