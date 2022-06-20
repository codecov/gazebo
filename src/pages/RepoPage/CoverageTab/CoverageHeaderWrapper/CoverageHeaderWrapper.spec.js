import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CoverageHeaderWrapper from './CoverageHeaderWrapper'

describe('BreadcrumbSearch', () => {
  function setup({ entries, path }) {
    render(
      <MemoryRouter initialEntries={entries}>
        <Route path={path}>
          <CoverageHeaderWrapper>
            <p>Hello World</p>
          </CoverageHeaderWrapper>
        </Route>
      </MemoryRouter>
    )
  }

  describe('path is provided in route', () => {
    beforeEach(() => {
      setup({
        entries: ['/gh/owner/coolrepo/tree/main/src/tests'],
        path: '/:provider/:owner/:repo/tree/:branch/:path+',
      })
    })

    it('renders the child', () => {
      const wrappingDiv = screen.getByText('Hello World')
      expect(wrappingDiv).toBeInTheDocument()
    })
  })
})
