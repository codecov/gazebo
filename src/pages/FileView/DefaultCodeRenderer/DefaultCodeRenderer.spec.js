import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitBasedCoverageForFileViewer } from 'services/file'
import { useOwner } from 'services/user'

import DefaultCodeRenderer from './DefaultCodeRenderer'

jest.mock(
  'ui/FileViewer/ToggleHeader/ToggleHeader',
  () => () => 'The Fileviewer Toggle Header'
)
jest.mock(
  'ui/CodeRenderer/CodeRendererProgressHeader',
  () => () => 'The Progress Header for Coderenderer'
)
jest.mock('services/file')
jest.mock('services/user')

const queryClient = new QueryClient()

describe('DefaultCodeRenderer', () => {
  function setup({ content, owner, coverage }) {
    useOwner.mockReturnValue({
      data: owner,
    })

    useCommitBasedCoverageForFileViewer.mockReturnValue({
      isLoading: false,
      totals: 53.43,
      coverage,
      flagNames: ['flagOne', 'flagTwo'],
      content,
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/gh/criticalrole/mightynein/blob/19236709182orym9234879/folder/subfolder/file.js',
        ]}
      >
        <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
          <QueryClientProvider client={queryClient}>
            <DefaultCodeRenderer />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when there is content to be shown', () => {
    beforeEach(() => {
      const content =
        'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};'
      const owner = {
        username: 'criticalrole',
        isCurrentUserPartOfOrg: true,
      }
      const coverage = {
        1: 'H',
        2: 'H',
        5: 'H',
        6: 'H',
        9: 'H',
        10: 'H',
        13: 'M',
        14: 'P',
        15: 'M',
        16: 'M',
        17: 'M',
        21: 'H',
      }
      setup({ content, owner, coverage })
    })

    it('renders the Fileviewer Header, Coderenderer Header, and Coderenderer', () => {
      expect(
        screen.getByText(/The Fileviewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
      ).not.toBeInTheDocument()
      const allTestIds = screen.getAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no coverage data to be shown', () => {
    beforeEach(() => {
      const content =
        'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};'
      const owner = {
        username: 'criticalrole',
        isCurrentUserPartOfOrg: true,
      }
      const coverage = null
      setup({ content, owner, coverage })
    })

    it('renders the Fileviewer Header, Coderenderer Header, and Coderenderer', () => {
      expect(
        screen.getByText(/The Fileviewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
      ).not.toBeInTheDocument()
      const allTestIds = screen.getAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no owner data to be shown', () => {
    beforeEach(() => {
      setup({
        owner: null,
        coverage: {
          1: 'H',
          2: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          21: 'H',
        },
      })
    })

    it('renders the 404 message', () => {
      expect(screen.getByText(/Not found/)).toBeInTheDocument()
      expect(screen.getByText(/404/)).toBeInTheDocument()
    })
  })

  describe('when there is an owner but no content to be shown', () => {
    beforeEach(() => {
      const owner = {
        username: 'criticalrole',
        isCurrentUserPartOfOrg: true,
      }
      setup({ content: null, owner, coverage: null })
    })

    it('renders the Fileviewer Header, Coderenderer Header, and error message', () => {
      expect(
        screen.getByText(/The Fileviewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(screen.queryByText(/The Coderenderer/)).not.toBeInTheDocument()
      expect(
        screen.getByText(
          /There was a problem getting the source code from your provider./
        )
      ).toBeInTheDocument()
    })
  })
})
