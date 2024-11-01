import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import YamlModal from './YamlModal'

vi.mock('./YAMLViewer', () => ({ default: () => 'YAMLViewer' }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commit/sha256']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const mockCommitNoYamlErrors = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        yamlErrors: { edges: [] },
        botErrors: { edges: [] },
      },
    },
  },
}

const mockCommitYamlErrors = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        yamlErrors: {
          edges: [{ node: { errorCode: 'invalid_yaml' } }],
        },
        botErrors: {
          edges: [{ node: { errorCode: 'repo_bot_invalid' } }],
        },
      },
    },
  },
}

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

describe('YamlModal', () => {
  const showModal = vi.fn()
  function setup({ hasYamlErrors } = { hasYamlErrors: false }) {
    server.use(
      graphql.query('CommitErrors', (info) => {
        if (hasYamlErrors) {
          return HttpResponse.json({ data: mockCommitYamlErrors })
        }

        return HttpResponse.json({ data: mockCommitNoYamlErrors })
      })
    )
  }

  describe('rendering modal', () => {
    beforeEach(() => setup())

    it('displays title', async () => {
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      const title = await screen.findByText('Yaml')
      expect(title).toBeInTheDocument()
    })

    it('displays yaml viewer', async () => {
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      const viewer = await screen.findByText('YAMLViewer')
      expect(viewer).toBeInTheDocument()
    })

    it('displays footer', async () => {
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      const footer = await screen.findByText(/learn more/)
      expect(footer).toBeInTheDocument()
    })
  })

  describe('when there are yaml commit errors', () => {
    beforeEach(() => setup({ hasYamlErrors: true }))
    it('displays commit error banner', async () => {
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      const bannerHeader = await screen.findByText('YAML is invalid')
      expect(bannerHeader).toBeInTheDocument()
    })
  })

  describe('when there are no yaml commit errors', () => {
    beforeEach(() => setup({ hasYamlErrors: false }))
    it('displays commit error banner', async () => {
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerHeader = screen.queryByText('YAML is invalid')
      expect(bannerHeader).not.toBeInTheDocument()
    })
  })

  describe('user closes the modal', () => {
    beforeEach(() => setup())

    it('calls the setter function', async () => {
      const user = userEvent.setup()
      render(<YamlModal showYAMLModal={true} setShowYAMLModal={showModal} />, {
        wrapper,
      })

      const closeIcon = await screen.findByTestId('modal-close-icon')
      await user.click(closeIcon)

      expect(showModal).toHaveBeenCalled()
      expect(showModal).toHaveBeenCalledWith(false)
    })
  })
})
