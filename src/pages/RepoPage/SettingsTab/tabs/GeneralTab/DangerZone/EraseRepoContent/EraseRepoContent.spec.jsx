import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import EraseRepoContent from './EraseRepoContent'

jest.mock('services/toastNotification')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)
describe('EraseRepoContent', () => {
  function setup(
    { failedMutation = false, isLoading = false } = {
      failedMutation: false,
      isLoading: false,
    }
  ) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()
    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.patch(
        '/internal/github/codecov/repos/codecov-client/erase/',
        (req, res, ctx) => {
          mutate()

          if (isLoading) {
            // https://cathalmacdonnacha.com/mocking-error-empty-and-loading-states-with-msw
            return res(ctx.status(200), ctx.json({}), ctx.delay(100))
          }

          if (failedMutation) {
            return res(ctx.status(500))
          }
          return res(ctx.status(200))
        }
      )
    )

    return { user, mutate, addNotification }
  }

  describe('renders EraseRepoContent component', () => {
    beforeEach(() => setup())

    it('renders title', async () => {
      render(<EraseRepoContent />, { wrapper })

      const title = await screen.findByText(/Erase repo coverage content/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', async () => {
      render(<EraseRepoContent />, { wrapper })

      const firstBlock = await screen.findByText(
        /This will remove all coverage reporting from the repo./
      )
      expect(firstBlock).toBeInTheDocument()
    })

    it('renders erase button', async () => {
      render(<EraseRepoContent />, { wrapper })

      const eraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      expect(eraseButton).toBeInTheDocument()
    })

    it('renders processing copy when isLoading is true', async () => {
      const { user } = setup({ isLoading: true })
      render(<EraseRepoContent />, { wrapper })

      const eraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(eraseButton)

      const modalCancelButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(modalCancelButton)

      const processingCopy = await screen.findByText(
        /processing erase, this may take a while/
      )
      await waitFor(() => expect(processingCopy).toBeInTheDocument())
    })
  })

  describe('when the user clicks on erase content button', () => {
    describe('displays Erase Content Modal', () => {
      beforeEach(() => setup())

      it('displays erase content button', async () => {
        const { user } = setup()
        render(<EraseRepoContent />, { wrapper })

        const eraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        user.click(eraseButton)

        const modalEraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        expect(modalEraseButton).toBeInTheDocument()
      })

      it('displays modal body', async () => {
        const { user } = setup()
        render(<EraseRepoContent />, { wrapper })

        const eraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        user.click(eraseButton)

        const p1 = await screen.findByText(
          /Are you sure you want to erase the repo coverage content?/
        )
        expect(p1).toBeInTheDocument()

        const p2 = await screen.findByText(
          /This will erase repo coverage content should erase all coverage data contained in the repo. This action is irreversible and if you proceed, you will permanently erase any historical code coverage in Codecov for this repository./
        )
        expect(p2).toBeInTheDocument()
      })

      it('displays modal buttons', async () => {
        const { user } = setup()
        render(<EraseRepoContent />, { wrapper })

        const eraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        user.click(eraseButton)

        const modalEraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        expect(modalEraseButton).toBeInTheDocument()

        const cancelButton = await screen.findByRole('button', {
          name: /Cancel/,
        })
        expect(cancelButton).toBeInTheDocument()
      })
    })

    describe('when user clicks on Cancel button', () => {
      it('does not call the mutation', async () => {
        const { user, mutate } = setup()
        render(<EraseRepoContent />, { wrapper })

        const eraseButton = await screen.findByRole('button', {
          name: /Erase Content/,
        })
        await user.click(eraseButton)

        const modalCancelButton = await screen.findByRole('button', {
          name: /Cancel/,
        })
        await user.click(modalCancelButton)

        expect(mutate).not.toHaveBeenCalled()
      })
    })
  })

  describe('when user clicks on Erase Content button', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup()
      render(<EraseRepoContent />, { wrapper })

      const eraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(eraseButton)

      const modalEraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(modalEraseButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })
  })

  describe('when mutation is successful', () => {
    it('adds a success notification', async () => {
      const { user, mutate, addNotification } = setup()
      render(<EraseRepoContent />, { wrapper })

      const eraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(eraseButton)

      const modalEraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(modalEraseButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'success',
          text: 'Repo coverage content erased successfully',
        })
      )
    })
  })

  describe('when mutation is not successful', () => {
    it('adds an error notification', async () => {
      const { user, mutate, addNotification } = setup({ failedMutation: true })
      render(<EraseRepoContent />, { wrapper })

      const eraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(eraseButton)

      const modalEraseButton = await screen.findByRole('button', {
        name: /Erase Content/,
      })
      await user.click(modalEraseButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: "We were unable to erase this repo's content",
        })
      )
    })
  })
})
