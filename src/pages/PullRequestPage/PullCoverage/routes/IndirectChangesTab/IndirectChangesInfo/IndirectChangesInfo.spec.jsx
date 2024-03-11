import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import IndirectChangesInfo from './IndirectChangesInfo'

jest.mock('../../ComponentsSelector', () => () => 'ComponentsSelector')

const server = setupServer()
const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/provider/owner/repo/pull/pullId/indirectChangesInfo']}
    >
      <Route path="/:provider/:owner/:repo/pull/:pullId/indirectChangesInfo">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('Indirect changes Info', () => {
  it('renders the expected copy', () => {
    render(<IndirectChangesInfo />, { wrapper })

    expect(
      screen.getByText(
        /These are files that didn't have author revisions, but contain unexpected coverage changes/
      )
    ).toBeInTheDocument()
  })

  it('renders the expected link', () => {
    render(<IndirectChangesInfo />, { wrapper })

    expect(
      screen.getByRole('link', {
        href: 'https://docs.codecov.com/docs/unexpected-coverage-changes',
      })
    ).toBeInTheDocument()
  })

  it('renders the expected components selector', () => {
    render(<IndirectChangesInfo />, { wrapper })

    expect(screen.getByText('ComponentsSelector')).toBeInTheDocument()
  })
})
