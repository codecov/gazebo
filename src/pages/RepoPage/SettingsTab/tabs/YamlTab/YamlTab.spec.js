import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEncodeString, useRepoSettings } from 'services/repo'

import YamlTab from './YamlTab'

jest.mock('services/repo')
const queryClient = new QueryClient()

describe('YamlTab', () => {
  function setup() {
    useRepoSettings.mockReturnValue({
      data: {
        repository: {
          yaml: 'test',
          defaultBranch: 'test default branch',
          bot: { username: 'Rula' },
        },
      },
    })

    useEncodeString.mockReturnValue({
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
      const title = screen.getByText(/Repository yaml/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const p = screen.getByText(
        'This is the default yaml for the current repository, after validation. This yaml takes precedence over the global yaml, but will be overwritten if a yaml change is included in a commit.'
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
      const title = screen.getByText(/Validate the yaml/)
      expect(title).toBeInTheDocument()
    })
  })
})
