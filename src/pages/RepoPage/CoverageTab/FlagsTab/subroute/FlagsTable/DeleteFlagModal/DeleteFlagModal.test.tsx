import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import DeleteFlagModal from './DeleteFlagModal'

vi.mock('ui/Avatar', () => ({ default: () => 'Avatar' }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const ownerUsername = 'vox-machina'
const repoName = 'vestiges'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/gh/${ownerUsername}/${repoName}/flags`]}>
      <Route path="/:provider/:owner/:repo/flags">{children}</Route>
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

describe('DeleteFlagModal', () => {
  function setup() {
    server.use(
      graphql.mutation('deleteFlag', () => {
        return HttpResponse.json({ data: { deleteFlag: null } })
      })
    )

    return { user: userEvent.setup() }
  }

  describe('when the modal is shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the modal message', async () => {
      render(
        <DeleteFlagModal flagName="flag-123" closeModal={vi.fn()} isOpen />,
        {
          wrapper,
        }
      )
      const messagePartOne = await screen.findByText(/This will remove the/)
      expect(messagePartOne).toBeInTheDocument()
      const messagePartTwo = await screen.findByText(
        /flag from the reports in app. You will also need to remove this flag in your CI and codecov.yaml to stop uploads./
      )
      expect(messagePartTwo).toBeInTheDocument()

      const flagName = await screen.findByText(/flag-123/)
      expect(flagName).toBeInTheDocument()
    })

    it('renders delete and cancel buttons', async () => {
      render(
        <DeleteFlagModal flagName="flag-123" closeModal={vi.fn()} isOpen />,
        {
          wrapper,
        }
      )
      const deleteButton = await screen.findByRole('button', {
        name: /Delete flag/,
      })
      expect(deleteButton).toBeInTheDocument()
      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders appropriate title', async () => {
      render(
        <DeleteFlagModal flagName="flag-123" closeModal={vi.fn()} isOpen />,
        {
          wrapper,
        }
      )
      const title = await screen.findByText(/Delete Flag/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when clicking delete button', () => {
    it('selects a default organization', async () => {
      const { user } = setup()
      const closeModal = vi.fn()
      render(
        <DeleteFlagModal flagName="flag-123" closeModal={closeModal} isOpen />,
        {
          wrapper,
        }
      )

      const deleteButton = await screen.findByRole('button', {
        name: /Delete flag/,
      })
      await user.click(deleteButton)
      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking cancel button', () => {
    it('closes the modal', async () => {
      const { user } = setup()
      const closeModal = vi.fn()
      render(
        <DeleteFlagModal flagName="flag-123" closeModal={closeModal} isOpen />,
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
