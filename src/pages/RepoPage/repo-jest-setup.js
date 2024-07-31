// https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import noop from 'lodash/noop'
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
  renderTree = noop,
  renderBlob = noop,
  options = {},
}) {
  let testLocation
  const entries = initialEntries ?? ['/gh/codecov/test-repo']
  const renderOutput = render(
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
        <Route path="/:provider/:owner/:repo/config">
          <RepoBreadcrumbProvider>{renderSettings()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo" exact>
          <RepoBreadcrumbProvider>{renderRoot()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/tree">
          <RepoBreadcrumbProvider>{renderTree()}</RepoBreadcrumbProvider>
        </Route>
        <Route path="/:provider/:owner/:repo/blob">
          <RepoBreadcrumbProvider>{renderBlob()}</RepoBreadcrumbProvider>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>,
    options
  )

  return {
    testLocation,
    render: renderOutput,
  }
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { repoPageRender, queryClient }
