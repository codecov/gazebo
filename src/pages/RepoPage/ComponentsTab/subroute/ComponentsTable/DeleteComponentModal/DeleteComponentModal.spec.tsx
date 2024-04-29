import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import DeleteComponentModal from './DeleteComponentModal'

jest.mock('ui/Avatar', () => () => 'Avatar')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const ownerUsername = 'vox-machina'
const repoName = 'vestiges'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[`/gh/${ownerUsername}/${repoName}/components`]}
    >
      <Route path="/:provider/:owner/:repo/components">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('DeleteComponentModal', () => {
  function setup() {
    server.use(
      graphql.mutation('deleteComponentMeasurements', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      )
    )

    return { user: userEvent.setup() }
  }

  describe('when the modal is shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the modal message', async () => {
      render(
        <DeleteComponentModal
          componentId="component-123"
          closeModal={jest.fn()}
          isOpen
        />,
        {
          wrapper,
        }
      )
      const messagePartOne = await screen.findByText(/This will remove the/)
      expect(messagePartOne).toBeInTheDocument()
      const messagePartTwo = await screen.findByText(
        /It will take some time to reflect this deletion./
      )
      expect(messagePartTwo).toBeInTheDocument()

      const componentId = await screen.findAllByText(/component-123/)
      expect(componentId).toHaveLength(3)
    })

    it('renders delete and cancel buttons', async () => {
      render(
        <DeleteComponentModal
          componentId="component-123"
          closeModal={jest.fn()}
          isOpen
        />,
        {
          wrapper,
        }
      )
      const deleteButton = await screen.findByRole('button', {
        name: /Remove/,
      })
      expect(deleteButton).toBeInTheDocument()
      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders appropriate title', async () => {
      render(
        <DeleteComponentModal
          componentId="component-123"
          closeModal={jest.fn()}
          isOpen
        />,
        {
          wrapper,
        }
      )
      const title = await screen.findByTestId(/remove-component-123/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when clicking delete button', () => {
    it('selects a default organization', async () => {
      const { user } = setup()
      const closeModal = jest.fn()
      render(
        <DeleteComponentModal
          componentId="component-123"
          closeModal={closeModal}
          isOpen
        />,
        {
          wrapper,
        }
      )

      const deleteButton = await screen.findByRole('button', {
        name: /Remove/,
      })
      await user.click(deleteButton)
      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking cancel button', () => {
    it('closes the modal', async () => {
      const { user } = setup()
      const closeModal = jest.fn()
      render(
        <DeleteComponentModal
          componentId="component-123"
          closeModal={closeModal}
          isOpen
        />,
        {
          wrapper,
        }
      )
      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/,
      })
      await user.click(cancelButton)
      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })
})
