import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import DeletionCard from './DeletionCard'

jest.mock('services/toastNotification')
jest.mock('js-cookie')

const server = setupServer()

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: false,
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('DeletionCard', () => {
  function setup(
    { failMutation = false } = {
      failMutation: false,
    }
  ) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.delete(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        mutate()

        if (failMutation) {
          return res(ctx.status(500))
        }

        return res(ctx.status(200), null)
      })
    )

    return { mutate, addNotification, user }
  }

  describe('when rendered for organization', () => {
    beforeEach(() => setup())

    it('renders the copy for organization', () => {
      render(<DeletionCard isPersonalSettings={false} />, {
        wrapper,
      })

      const EraseOrgContent = screen.getByText(
        /Erase all my organization content and projects/
      )
      expect(EraseOrgContent).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      render(<DeletionCard isPersonalSettings={false} />, {
        wrapper,
      })

      const contactSupport = screen.getByRole('link', {
        name: /contact support/i,
      })
      expect(contactSupport).toBeInTheDocument()
    })
  })

  describe('when rendering for individual', () => {
    beforeEach(setup)

    it('renders the copy for individual', () => {
      render(<DeletionCard isPersonalSettings={true} />, {
        wrapper,
      })

      const eraseAllContent = screen.getByText(
        /erase all my personal content and personal projects\./i
      )
      expect(eraseAllContent).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      render(<DeletionCard isPersonalSettings={true} />, {
        wrapper,
      })

      const eraseAccount = screen.getByRole('button', {
        name: /erase account/i,
      })
      expect(eraseAccount).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to erase', () => {
    it('opens the modal with warning', async () => {
      const { user } = setup()
      render(<DeletionCard isPersonalSettings={true} />, {
        wrapper,
      })

      const eraseAccount = screen.getByRole('button', {
        name: /erase account/i,
      })
      await user.click(eraseAccount)

      const areYouSure = screen.getByRole('heading', {
        name: /are you sure\?/i,
      })
      expect(areYouSure).toBeInTheDocument()
    })

    describe('when clicking Cancel', () => {
      beforeEach(() => {})

      it('closes the modal', async () => {
        const { user } = setup()
        render(<DeletionCard isPersonalSettings={true} />, {
          wrapper,
        })

        const eraseAccount = screen.getByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseAccount)

        const cancel = screen.getByRole('button', { name: /Cancel/ })
        await user.click(cancel)

        const areYouSure = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(areYouSure).not.toBeInTheDocument()
      })
    })

    describe('when clicking Close icon', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(<DeletionCard isPersonalSettings={true} />, {
          wrapper,
        })

        const eraseAccount = screen.getByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseAccount)

        const close = screen.getByRole('button', { name: /Close/ })
        await user.click(close)

        const areYouSure = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(areYouSure).not.toBeInTheDocument()
      })
    })

    describe('when confirming', () => {
      it('calls the mutation', async () => {
        const { mutate, user } = setup()
        render(<DeletionCard isPersonalSettings={true} />, {
          wrapper,
        })

        const eraseAccount = await screen.findByRole('button', {
          name: /Erase account/,
        })
        await user.click(eraseAccount)

        const eraseMyAccount = await screen.findByRole('button', {
          name: /Erase my account/,
        })
        await user.click(eraseMyAccount)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())
        await waitFor(() => expect(mutate).toHaveBeenCalled())
      })

      describe('when the mutation fails', () => {
        it('adds an error notification', async () => {
          const { user, addNotification } = setup({
            failMutation: true,
          })
          render(<DeletionCard isPersonalSettings={true} />, {
            wrapper,
          })

          const eraseAccount = await screen.findByRole('button', {
            name: /erase account/i,
          })
          await user.click(eraseAccount)

          const eraseMyAccount = await screen.findByRole('button', {
            name: /Erase my account/,
          })
          await user.click(eraseMyAccount)

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
})
