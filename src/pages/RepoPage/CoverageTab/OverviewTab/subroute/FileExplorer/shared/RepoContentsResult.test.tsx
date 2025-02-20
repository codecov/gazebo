import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import RepoContentsResult from './RepoContentsResult'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: mocks.useParams.mockReturnValue({
      provider: 'p',
      owner: 'blah',
      repo: 'bloo',
    }),
  }
})

describe('RepoContentsResult', () => {
  it('renders no results if user is searching', async () => {
    const props = {
      isSearching: true,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const notFoundText = await screen.findByText(/No results found/)
    expect(notFoundText).toBeInTheDocument()
  })

  it('renders no coverage message if user there is no head report', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: true,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const noCoverageOnHead = await screen.findByText(
      /No coverage report uploaded for this branch head commit/
    )
    expect(noCoverageOnHead).toBeInTheDocument()
  })

  it('renders no coverage for flags if user has flags selected', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: true,
      hasComponentsSelected: false,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const noCoverageForFlags = await screen.findByText(
      /No coverage report uploaded for the selected flags in this branch's head commit/
    )
    expect(noCoverageForFlags).toBeInTheDocument()
  })

  it('renders no coverage for default if there is no coverage on the branch', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    mocks.useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'cool-repo',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={['/gh/codecov/cool-repo/tree/main/a/b/c']}
        >
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
            <RepoContentsResult {...props} />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const noCoverageForFlags = await screen.findByText(
      /Once merged to your default branch, Codecov will show your report results on this dashboard./
    )
    expect(noCoverageForFlags).toBeInTheDocument()

    const link = await screen.findByTestId('config-page')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/gh/codecov/cool-repo/config/general')
  })

  it('renders no coverage for components if user has components selected', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: true,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const noCoverageForFlags = await screen.findByText(
      /No coverage report uploaded for the selected components in this branch's head commit/
    )
    expect(noCoverageForFlags).toBeInTheDocument()
  })

  it('renders no coverage for flags and components if user has flags and components selected', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: true,
      hasComponentsSelected: true,
      isMissingCoverage: false,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const noCoverageForFlags = await screen.findByText(
      /No coverage reported for the selected flag\/component combination in this branch's head commit/
    )
    expect(noCoverageForFlags).toBeInTheDocument()
  })

  it('renders no coverage message if there is no coverage data', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
      isMissingCoverage: true,
      isUnknownPath: false,
    }

    render(<RepoContentsResult {...props} />)

    const noCoverage = await screen.findByText(/No coverage data available./)
    expect(noCoverage).toBeInTheDocument()
  })

  it('renders unknown path message if path does not exist', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
      isMissingCoverage: false,
      isUnknownPath: true,
    }

    render(<RepoContentsResult {...props} />)

    const unknownPath = await screen.findByText(
      /Unknown filepath. Please ensure that files\/directories exist and are not empty./
    )
    expect(unknownPath).toBeInTheDocument()
  })
})
