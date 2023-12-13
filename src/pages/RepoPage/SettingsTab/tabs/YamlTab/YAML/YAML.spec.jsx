import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import PropTypes from 'prop-types'
import { MemoryRouter, Route } from 'react-router-dom'

import YAML from './YAML'

jest.mock('react-ace', () => (props) => <MockReactAce {...props} />)
jest.mock('ace-builds/src-noconflict/theme-github', () => {})
jest.mock('ace-builds/src-noconflict/mode-yaml', () => {})
jest.mock('services/repo')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function MockReactAce({ value }) {
  return <input readOnly value={!value ? '' : value} />
}
MockReactAce.propTypes = {
  value: PropTypes.any,
}

describe('YAML', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/yaml']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/yaml">
            <YAML yaml="test: test" />
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
      const title = screen.getByText(/Repository YAML/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        'This is the default YAML for the current repository, after validation. This YAML takes precedence over the global YAML, but will be overwritten if a YAML change is included in a commit.'
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
