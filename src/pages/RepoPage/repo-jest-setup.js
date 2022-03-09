// https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { render } from '@testing-library/react'
import noop from 'lodash/noop'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider } from './context'

const queryClient = new QueryClient()

function repoPageRender({
  initialEntries,
  renderRoot = noop,
  renderCommits = noop,
  renderPulls = noop,
  renderNew = noop,
  renderCompare = noop,
  renderSettings = noop,
  options = {},
}) {
  const entries = initialEntries ?? ['/gh/codecov/test-repo']
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={entries}>
        <Route path="/:provider/:owner/:repo/new">
          <RepoBreadcrumbProvider>{renderNew()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/pulls">
          <RepoBreadcrumbProvider>{renderPulls()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/commits">
          <RepoBreadcrumbProvider>{renderCommits()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/compare">
          <RepoBreadcrumbProvider>{renderCompare()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/settings">
          <RepoBreadcrumbProvider>{renderSettings()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo" exact>
          <RepoBreadcrumbProvider>{renderRoot()}</RepoBreadcrumbProvider>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
    options
  )
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { repoPageRender, queryClient }
