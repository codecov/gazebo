import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import RepoContentsResult from './RepoContentsResult'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest
    .fn()
    .mockReturnValue({ provider: 'p', owner: 'blah', repo: 'bloo' }),
}))

describe('RepoContentsResult', () => {
  it('renders no results if user is searching', async () => {
    const props = {
      isSearching: true,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: false,
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
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const mockedUseParams = useParams as jest.Mock
    mockedUseParams.mockReturnValue({
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

    const link = await screen.findByTestId('settings-page')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/gh/codecov/cool-repo/settings')
  })

  it('renders no coverage for components if user has components selected', async () => {
    const props = {
      isSearching: false,
      isMissingHeadReport: false,
      hasFlagsSelected: false,
      hasComponentsSelected: true,
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
    }

    render(<RepoContentsResult {...props} />)

    const noCoverageForFlags = await screen.findByText(
      /No coverage reported for the selected flag\/component combination in this branch's head commit/
    )
    expect(noCoverageForFlags).toBeInTheDocument()
  })
})
