import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { OrderingDirection, TeamOrdering } from 'services/repos/orderingOptions'
import { transformStringToLocalStorageKey } from 'shared/utils/transformStringToLocalStorageKey'

import ReposTableTeam, { getSortingOption } from './ReposTableTeam'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gl']}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  edges: object[]
  isCurrentUserPartOfOrg?: boolean
}

describe('ReposTableTeam', () => {
  function setup({ edges = [], isCurrentUserPartOfOrg = true }: SetupArgs) {
    const mockApiVars = vi.fn()
    const fetchNextPage = vi.fn()
    const user = userEvent.setup()

    server.use(
      graphql.query('GetReposTeam', (info) => {
        mockApiVars(info.variables)

        if (info.variables.after) {
          fetchNextPage(info.variables.after)
        }

        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserPartOfOrg,
              repositories: {
                edges,
                pageInfo: {
                  hasNextPage: true,
                  endCursor: '2',
                },
              },
            },
          },
        })
      })
    )

    return { mockApiVars, fetchNextPage, user }
  }

  describe('rendering table', () => {
    interface EdgeArgs {
      coverageEnabled?: boolean
      bundleAnalysisEnabled?: boolean
    }

    const edges = (
      { coverageEnabled = true, bundleAnalysisEnabled = true }: EdgeArgs = {
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
      }
    ) => [
      {
        node: {
          private: false,
          activated: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 1',
          latestCommitAt: subDays(new Date(), 3).toISOString(),
          active: true,
          coverageAnalytics: {
            lines: 99,
          },
          coverageEnabled,
          bundleAnalysisEnabled,
        },
      },
      {
        node: {
          private: true,
          activated: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 2',
          latestCommitAt: subDays(new Date(), 2).toISOString(),
          active: true,
          coverageAnalytics: {
            lines: 101,
          },
          coverageEnabled,
          bundleAnalysisEnabled,
        },
      },
      {
        node: {
          private: true,
          activated: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 3',
          latestCommitAt: null,
          active: true,
          coverageAnalytics: {
            lines: 207,
          },
          coverageEnabled,
          bundleAnalysisEnabled,
        },
      },
    ]

    describe('renders active table headers', () => {
      it('renders table name header', async () => {
        setup({ edges: edges() })
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const header = await screen.findByText(/Name/)
        expect(header).toBeInTheDocument()
      })

      it('renders table last updated header', async () => {
        setup({ edges: edges() })
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const header = await screen.findByText('Last updated')
        expect(header).toBeInTheDocument()
      })

      it('renders table tracked lines header', async () => {
        setup({ edges: edges() })
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const header = await screen.findByText('Tracked lines')
        expect(header).toBeInTheDocument()
      })
    })

    it('renders table repo name', async () => {
      setup({ edges: edges() })
      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    describe('rendered with coverageEnabled as true', () => {
      it('links to /:organization/:owner/:repo', async () => {
        setup({ edges: edges() })
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const repo1 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 1/,
        })
        const repo2 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 2/,
        })
        const repo3 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 3/,
        })

        expect(repo1).toHaveAttribute('href', '/gl/owner1/Repo name 1')
        expect(repo2).toHaveAttribute('href', '/gl/owner1/Repo name 2')
        expect(repo3).toHaveAttribute('href', '/gl/owner1/Repo name 3')
      })
    })

    describe('rendered with only bundleAnalysisEnabled as true', () => {
      it('links to /:organization/:owner/:repo', async () => {
        setup({
          edges: edges({ coverageEnabled: false, bundleAnalysisEnabled: true }),
        })
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const repo1 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 1/,
        })
        const repo2 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 2/,
        })
        const repo3 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 3/,
        })

        expect(repo1).toHaveAttribute('href', '/gl/owner1/Repo name 1/bundles')
        expect(repo2).toHaveAttribute('href', '/gl/owner1/Repo name 2/bundles')
        expect(repo3).toHaveAttribute('href', '/gl/owner1/Repo name 3/bundles')
      })
    })

    it('renders last updated column', async () => {
      setup({ edges: edges() })
      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      expect(await screen.findByText(/3 days ago/)).toBeTruthy()
      const lastSeen1 = screen.getByText(/3 days ago/)
      expect(lastSeen1).toBeInTheDocument()

      const lastSeen2 = await screen.findByText(/2 days ago/)
      expect(lastSeen2).toBeInTheDocument()
    })

    it('renders tracked lines column', async () => {
      setup({ edges: edges() })
      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      expect(await screen.findByText('99')).toBeTruthy()
      const lines1 = screen.getByText('99')
      expect(lines1).toBeInTheDocument()

      const lines2 = await screen.findByText('101')
      expect(lines2).toBeInTheDocument()
    })
  })

  describe('when rendered with coverageEnabled as false', () => {
    describe('user belongs to org', () => {
      beforeEach(() => {
        setup({
          edges: [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 1',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 99,
                },
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 2',
                latestCommitAt: subDays(new Date(), 2).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 101,
                },
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 3',
                latestCommitAt: subDays(new Date(), 5).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 207,
                },
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
              },
            },
          ],
        })
      })

      it('links to /:organization/:owner/:repo/new', async () => {
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const repo1 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 1/,
        })
        expect(repo1).toHaveAttribute('href', '/gl/owner1/Repo name 1/new')

        const repo2 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 2/,
        })
        expect(repo2).toHaveAttribute('href', '/gl/owner1/Repo name 2/new')

        const repo3 = await screen.findByRole('link', {
          name: /owner1 \/ Repo name 3/,
        })
        expect(repo3).toHaveAttribute('href', '/gl/owner1/Repo name 3/new')
      })

      it('renders set up repo copy', async () => {
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const setupRepo = await screen.findAllByRole('link', {
          name: /Configure/,
        })
        expect(setupRepo.length).toBe(3)
      })
    })

    describe('user does not belongs to org', () => {
      beforeEach(() => {
        setup({
          isCurrentUserPartOfOrg: false,
          edges: [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 1',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 2',
                latestCommitAt: subDays(new Date(), 2).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 3',
                latestCommitAt: subDays(new Date(), 5).toISOString(),
                active: false,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
          ],
        })
      })

      it('does not link to configure repo from repo name', async () => {
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const repo1 = await screen.findByText('Repo name 1')
        expect(repo1).not.toHaveAttribute('href')

        const repo2 = await screen.findByText('Repo name 2')
        expect(repo2).not.toHaveAttribute('href')

        const repo3 = await screen.findByText('Repo name 3')
        expect(repo3).not.toHaveAttribute('href')
      })

      it('does not show configure repo link', async () => {
        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const notConfiguredCopy = await screen.findAllByText('Inactive')
        expect(notConfiguredCopy.length).toBe(3)

        const repo1 = screen.queryByText('Configure')
        expect(repo1).not.toBeInTheDocument()
      })
    })
  })

  describe('when rendered empty repos', () => {
    it('renders no repos detected', async () => {
      setup({ edges: [] })
      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      expect(
        await screen.findByText(/There are no repos detected/)
      ).toBeTruthy()
      const noReposDetected = screen.getByText(/There are no repos detected/)
      expect(noReposDetected).toBeInTheDocument()

      const searchNotFoundText = screen.queryByText('No results found')
      expect(searchNotFoundText).not.toBeInTheDocument()
    })
  })

  describe('when rendered empty search', () => {
    it('renders no results found', async () => {
      setup({ edges: [] })
      render(<ReposTableTeam searchValue="something" />, {
        wrapper: wrapper(),
      })

      const noResultsFound = await screen.findByText(/No results found/)
      expect(noResultsFound).toBeInTheDocument()
    })
  })

  describe('render next page button', () => {
    it('renders button', async () => {
      setup({
        edges: [
          {
            node: {
              private: false,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: false,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      const button = await screen.findByText(/Load More/)
      expect(button).toBeInTheDocument()
    })

    it('loads next page of data', async () => {
      const { user, fetchNextPage } = setup({
        edges: [
          {
            node: {
              private: false,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: false,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      const loadMore = await screen.findByText(/Load More/)
      await user.click(loadMore)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      expect(fetchNextPage).toHaveBeenCalledWith('2')
    })
  })

  describe('when rendered with all repos', () => {
    it('renders all repos', async () => {
      setup({
        edges: [
          {
            node: {
              private: false,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 2',
              latestCommitAt: subDays(new Date(), 2).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 5).toISOString(),
              active: false,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('renders inactive copy for inactive repos', async () => {
      setup({
        edges: [
          {
            node: {
              private: false,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 2',
              latestCommitAt: subDays(new Date(), 2).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 5).toISOString(),
              active: false,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
        isCurrentUserPartOfOrg: false,
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      expect(await screen.findByText(/Inactive/)).toBeTruthy()
      const label = screen.getByText(/Inactive/)
      expect(label).toBeInTheDocument()
    })

    it('renders deactivated for inactive repos', async () => {
      setup({
        edges: [
          {
            node: {
              private: false,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 2',
              latestCommitAt: subDays(new Date(), 2).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 5).toISOString(),
              active: false,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      expect(await screen.findByText(/Deactivated/)).toBeTruthy()
      const label = screen.getByText(/Deactivated/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('Test ordering', () => {
    it('renders repos in descending order', async () => {
      setup({
        edges: [
          {
            node: {
              private: false,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 2',
              latestCommitAt: subDays(new Date(), 2).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
          {
            node: {
              private: true,
              activated: true,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 5).toISOString(),
              active: true,
              coverageAnalytics: {
                lines: 0,
              },
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          },
        ],
      })

      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)

      expect(buttons[0]).toHaveTextContent('Repo name 2')
      expect(buttons[1]).toHaveTextContent('Repo name 1')
      expect(buttons[2]).toHaveTextContent('Repo name 3')
    })

    describe('when click on name', () => {
      it('renders repos in ascending order', async () => {
        const { user } = setup({
          edges: [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 1',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 2',
                latestCommitAt: subDays(new Date(), 2).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 3',
                latestCommitAt: subDays(new Date(), 5).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
          ],
        })

        render(<ReposTableTeam searchValue="" />, {
          wrapper: wrapper(),
        })

        const name = await screen.findByText('Name')
        await user.click(name)

        const buttons = await screen.findAllByText(/Repo name/)
        expect(buttons.length).toBe(3)

        expect(buttons[0]).toHaveTextContent('Repo name 1')
        expect(buttons[1]).toHaveTextContent('Repo name 2')
        expect(buttons[2]).toHaveTextContent('Repo name 3')

        await user.click(name)
        const buttonsInDescendingOrder = await screen.findAllByText(/Repo name/)

        expect(buttonsInDescendingOrder[0]).toHaveTextContent('Repo name 3')
        expect(buttonsInDescendingOrder[1]).toHaveTextContent('Repo name 2')
        expect(buttonsInDescendingOrder[2]).toHaveTextContent('Repo name 1')
      })
    })
  })

  describe('handles recently visited repo', () => {
    beforeEach(() => {
      localStorage.clear()
      localStorage.setItem(
        `${transformStringToLocalStorageKey('owner1')}_recently_visited`,
        'gazebo'
      )

      server.use(
        graphql.query('GetReposTeam', (info) => {
          const recentlyVisitedRepo = [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'gazebo',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                coverageAnalytics: {
                  percentCovered: 0,
                  lines: 123,
                },
                active: true,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                repositoryConfig: null,
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
          ]

          const myRepos = [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 1',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 2',
                latestCommitAt: subDays(new Date(), 2).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
            {
              node: {
                private: true,
                activated: true,
                author: {
                  username: 'owner1',
                },
                name: 'gazebo',
                latestCommitAt: subDays(new Date(), 5).toISOString(),
                active: true,
                coverageAnalytics: {
                  lines: 0,
                },
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
          ]

          let reposToReturn = myRepos.filter(
            (repo) =>
              !info.variables.filters.term ||
              repo.node.name.includes(info.variables.filters.term)
          )

          if (info.variables.filters.repoNames) {
            reposToReturn = recentlyVisitedRepo
          }

          return HttpResponse.json({
            data: {
              owner: {
                isCurrentUserPartOfOrg: true,
                repositories: {
                  edges: reposToReturn,
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: '3',
                  },
                },
              },
            },
          })
        })
      )
    })

    it('shows recently visited repo', async () => {
      render(<ReposTableTeam searchValue="" />, {
        wrapper: wrapper(),
      })

      await waitFor(async () => {
        const isFetching = !!queryClient.isFetching()
        const recentlyVisitedRepo = screen.queryByText(/Recently visited/)
        expect([isFetching, Boolean(recentlyVisitedRepo)]).toEqual([
          false,
          true,
        ])
      })
    })
  })
})

describe('getSortingOption', () => {
  it('returns the correct sorting options for name column', () => {
    const nameAsc = getSortingOption([{ id: 'name', desc: false }])

    expect(nameAsc).toEqual({
      ordering: TeamOrdering.NAME,
      direction: OrderingDirection.ASC,
    })

    const nameDesc = getSortingOption([{ id: 'name', desc: true }])

    expect(nameDesc).toEqual({
      ordering: TeamOrdering.NAME,
      direction: OrderingDirection.DESC,
    })
  })

  it('returns the correct sorting options for last updated column', () => {
    const lastUpdatedAsc = getSortingOption([
      { id: 'latestCommitAt', desc: false },
    ])

    expect(lastUpdatedAsc).toEqual({
      ordering: TeamOrdering.COMMIT_DATE,
      direction: OrderingDirection.ASC,
    })

    const lastUpdatedDesc = getSortingOption([
      { id: 'latestCommitAt', desc: true },
    ])

    expect(lastUpdatedDesc).toEqual({
      ordering: TeamOrdering.COMMIT_DATE,
      direction: OrderingDirection.DESC,
    })
  })

  it('returns undefined otherwise', () => {
    const noSorting = getSortingOption([])

    expect(noSorting).toBe(undefined)
  })
})
