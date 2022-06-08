import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import BreadcrumbSearch from './BreadcrumbSearch'

describe('BreadcrumbSearch', () => {
  function setup({ entries, path }) {
    render(
      <MemoryRouter initialEntries={entries}>
        <Route path={path}>
          <BreadcrumbSearch searchValue="" setSearchValue={() => null} />
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

    it('renders the breadcrumb', () => {
      const repo = screen.getByRole('link', { name: 'coolrepo' })
      expect(repo).toBeInTheDocument()
      expect(repo).toHaveAttribute('href', '/gh/owner/coolrepo/tree/main/')

      const src = screen.getByRole('link', { name: 'src' })
      expect(src).toBeInTheDocument()
      expect(src).toHaveAttribute('href', '/gh/owner/coolrepo/tree/main/src')

      const tests = screen.getByText('tests')
      expect(tests).toBeInTheDocument()
    })

    it('renders the search', () => {
      const searchMsg = screen.getByRole('textbox', {
        name: 'Search for files',
      })
      expect(searchMsg).toBeInTheDocument()
    })
  })
})
