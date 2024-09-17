import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import YamlTab from './YamlTab'

const mocks = vi.hoisted(() => ({
  useEncodeString: vi.fn(),
  useRepoSettings: vi.fn(),
}))

vi.mock('services/repo', () => ({
  useEncodeString: mocks.useEncodeString,
  useRepoSettings: mocks.useRepoSettings,
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

describe('YamlTab', () => {
  function setup() {
    mocks.useRepoSettings.mockReturnValue({
      data: {
        repository: {
          yaml: 'test',
          defaultBranch: 'test default branch',
          bot: { username: 'Rula' },
        },
      },
    })

    mocks.useEncodeString.mockReturnValue({
      data: {
        value: '',
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/yaml']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/yaml">
            <YamlTab />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders yaml section', () => {
    beforeEach(() => {
      setup()
    })

    it('renders Repository Yaml compoenent', () => {
      const title = screen.getByText(/Repository YAML/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const p = screen.getByText(
        'This is the default YAML for the current repository, after validation. This YAML takes precedence over the global YAML, but will be overwritten if a YAML change is included in a commit.'
      )
      expect(p).toBeInTheDocument()
    })

    it('renders Repository CurrentRepoSettings compoenent', () => {
      const title = screen.getByText(/Current repository settings/)
      expect(title).toBeInTheDocument()
    })

    it('renders CurrentRepoSettings compoenent body', () => {
      const p1 = screen.getByText(/Current bot:/)
      const p2 = screen.getByText(/Current default branch:/)
      expect(p1).toBeInTheDocument()
      expect(p2).toBeInTheDocument()
    })

    it('renders ValidateYaml compoenent', () => {
      const title = screen.getByText(/Validate the YAML/)
      expect(title).toBeInTheDocument()
    })
  })
})
