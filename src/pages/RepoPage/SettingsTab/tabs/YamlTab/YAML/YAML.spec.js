import { render, screen, waitFor } from '@testing-library/react'
import PropTypes from 'prop-types'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'

import YAML from './YAML'

jest.mock('react-ace', () => (props) => <MockReactAce {...props} />)
jest.mock('ace-builds/src-noconflict/theme-github', () => {})
jest.mock('ace-builds/src-noconflict/mode-yaml', () => {})
jest.mock('services/repo')

const queryClient = new QueryClient()

function MockReactAce({ value }) {
  return <input readOnly value={!value ? '' : value} />
}
MockReactAce.propTypes = {
  value: PropTypes.any,
}

describe('YAML', () => {
  function setup() {
    useRepoSettings.mockReturnValue({
      data: { repository: { yaml: 'test: test' } },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/yaml']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/yaml">
            <YAML />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders YAMLcomponenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Repository yaml/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        'This is the default yaml for the current repository, after validation. This yaml takes precedence over the global yaml, but will be overwritten if a yaml change is included in a commit.'
      )
      expect(p).toBeInTheDocument()
    })
    it('renders yaml editor', async () => {
      const editor = screen.getByRole('textbox')
      expect(editor).toBeInTheDocument()
      await waitFor(() => expect(editor).toHaveValue('test: test'))
    })
  })
})
