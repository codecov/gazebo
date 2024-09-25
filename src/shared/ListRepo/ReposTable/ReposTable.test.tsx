import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { ActiveContext } from 'shared/context'

import ReposTable from './ReposTable'

import { repoDisplayOptions } from '../ListRepo'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const mockRepositories = (
  {
    coverageEnabled = true,
    bundleAnalysisEnabled = true,
  }: {
    coverageEnabled?: boolean
    bundleAnalysisEnabled?: boolean
  } = {
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
      coverage: 43,
      active: true,
      lines: 99,
      updatedAt: '2020-08-25T16:36:19.67986800:00',
      repositoryConfig: null,
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
      coverage: 100,
      active: true,
      lines: 101,
      updatedAt: '2020-08-25T16:36:19.67986800:00',
      repositoryConfig: null,
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
      lines: 207,
      updatedAt: '2020-08-25T16:36:19.67986800:00',
      repositoryConfig: null,
      coverageEnabled,
      bundleAnalysisEnabled,
    },
  },
]

const mockRepoConfig = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const mockUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'owner1',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
      customerIntent: 'PERSONAL',
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close)

const wrapper =
  (
    repoDisplay: string,
    url: string = '/gl',
    path: string = '/:provider'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Route path={path}>
          <ActiveContext.Provider value={repoDisplay}>
            {children}
          </ActiveContext.Provider>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

interface SetupArgs {
  edges?: any[]
  isCurrentUserPartOfOrg?: boolean
  privateAccess?: boolean
  tierValue?: string
}

describe('ReposTable', () => {
  function setup({
    edges = [],
    isCurrentUserPartOfOrg = true,
    tierValue = TierNames.PRO,
  }: SetupArgs) {
    const reposForOwnerMock = vi.fn()
    const myReposMock = vi.fn()
    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({
          data: { owner: { isCurrentUserPartOfOrg } },
        })
      }),
      graphql.query('ReposForOwner', async (info) => {
        reposForOwnerMock(info.variables)

        const isPublic = info.variables.filters.isPublic

        let filteredEdges = edges
        if (isPublic) {
          filteredEdges = edges.filter((edge) => edge.node.private === false)
        }

        if (info.variables?.after === '2') {
          return HttpResponse.json({
            data: {
              owner: {
                repositories: {
                  edges: [
                    {
                      node: {
                        private: false,
                        activated: true,
                        author: {
                          username: 'owner2',
                        },
                        name: 'Repo name extra',
                        latestCommitAt: subDays(new Date(), 5).toISOString(),
                        coverage: 50,
                        active: true,
                        lines: 20,
                        updatedAt: '2020-08-25T16:36:19.67986800:00',
                        repositoryConfig: null,
                        coverageEnabled: true,
                        bundleAnalysisEnabled: true,
                      },
                    },
                  ],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: '3',
                  },
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: {
            owner: {
              repositories: {
                edges: filteredEdges,
                pageInfo: {
                  hasNextPage: true,
                  endCursor: '2',
                },
              },
            },
          },
        })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: { owner: { plan: { tierName: tierValue } } },
        })
      }),
      graphql.query('RepoConfig', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: { repositoryConfig: mockRepoConfig } } },
        })
      }),
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockUser })
      })
    )
    return { myReposMock, reposForOwnerMock }
  }

  describe('renders active table headers', () => {
    it('renders table name header', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Name/)
      expect(header).toBeInTheDocument()
    })

    it('renders table coverage header', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Test coverage/)
      expect(header).toBeInTheDocument()
    })

    it('renders table last updated header', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Last updated/)
      expect(header).toBeInTheDocument()
    })

    it('renders table tracked lines header', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Tracked lines/)
      expect(header).toBeInTheDocument()
    })
  })

  describe('rendering table', () => {
    it('renders table repo name', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    describe('coverage enabled', () => {
      it('links to /:organization/:owner/:repo', async () => {
        setup({ edges: mockRepositories() })
        render(<ReposTable searchValue="" owner="" />, {
          wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
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

    describe('only bundle analysis enabled', () => {
      it('links to /:organization/:owner/:repo/bundles', async () => {
        setup({
          edges: mockRepositories({
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          }),
        })
        render(<ReposTable searchValue="" owner="" />, {
          wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
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
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      expect(await screen.findByText(/3 days ago/)).toBeTruthy()
      const lastSeen1 = screen.getByText(/3 days ago/)
      expect(lastSeen1).toBeInTheDocument()

      const lastSeen2 = await screen.findByText(/2 days ago/)
      expect(lastSeen2).toBeInTheDocument()
    })

    it('renders coverage column', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      expect(await screen.findByText(/43\.00/)).toBeTruthy()
      const coverage1 = screen.getByText(/43\.00/)
      expect(coverage1).toBeInTheDocument()

      const coverage2 = await screen.findByText(/100\.00/)
      expect(coverage2).toBeInTheDocument()
    })

    it('renders tracked lines column', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      expect(await screen.findByText('99')).toBeTruthy()
      const lines1 = screen.getByText('99')
      expect(lines1).toBeInTheDocument()

      const lines2 = await screen.findByText('101')
      expect(lines2).toBeInTheDocument()
    })

    it('renders handles null coverage', async () => {
      setup({ edges: mockRepositories() })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      expect(await screen.findByText(/No data/)).toBeTruthy()
      const noData = screen.getByText(/No data/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered with coverage enabled and bundle enabled as false', () => {
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
                coverage: 43,
                active: false,
                repositoryConfig: null,
                lines: 3,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
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
                coverage: 100,
                active: false,
                lines: 0,
                repositoryConfig: null,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
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
                coverage: 0,
                active: false,
                lines: 0,
                repositoryConfig: null,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
              },
            },
          ],
        })
      })

      it('links to /:organization/:owner/:repo/new', async () => {
        render(<ReposTable searchValue="" owner="owner1" />, {
          wrapper: wrapper(repoDisplayOptions.NOT_CONFIGURED.text),
        })

        const repo1 = await screen.findByRole('link', {
          name: /Repo name 1/,
        })
        expect(repo1).toHaveAttribute('href', '/gl/owner1/Repo name 1/new')

        const repo2 = await screen.findByRole('link', {
          name: /Repo name 2/,
        })
        expect(repo2).toHaveAttribute('href', '/gl/owner1/Repo name 2/new')

        const repo3 = await screen.findByRole('link', {
          name: /Repo name 3/,
        })
        expect(repo3).toHaveAttribute('href', '/gl/owner1/Repo name 3/new')
      })

      it('renders configure repo copy', async () => {
        render(<ReposTable searchValue="" owner="owner1" />, {
          wrapper: wrapper(repoDisplayOptions.NOT_CONFIGURED.text),
        })

        const setupRepo = await screen.findAllByRole('link', {
          name: /Configure/,
        })
        expect(setupRepo.length).toBe(3)

        const setupRepo1 = setupRepo[0]
        expect(setupRepo1).toHaveAttribute('href', '/gl/owner1/Repo name 1/new')
      })
    })

    describe('user does not belongs to org', () => {
      beforeEach(() => {
        setup({
          isCurrentUserPartOfOrg: false,
          edges: mockRepositories(),
        })
      })

      it('does not link to configure repo from repo name', async () => {
        render(<ReposTable searchValue="" owner="" />, {
          wrapper: wrapper(repoDisplayOptions.NOT_CONFIGURED.text),
        })

        const repo1 = await screen.findByText('Repo name 1')
        expect(repo1).not.toHaveAttribute('href')

        const repo2 = await screen.findByText('Repo name 2')
        expect(repo2).not.toHaveAttribute('href')

        const repo3 = await screen.findByText('Repo name 3')
        expect(repo3).not.toHaveAttribute('href')
      })

      it('does not show configure repo link', async () => {
        render(<ReposTable searchValue="" owner="" />, {
          wrapper: wrapper(repoDisplayOptions.NOT_CONFIGURED.text),
        })

        const notConfiguredCopy = await screen.findAllByText('Inactive')
        expect(notConfiguredCopy.length).toBe(3)

        const repo1 = screen.queryByText('Configure')
        expect(repo1).not.toBeInTheDocument()
      })
    })
  })

  describe('when user is in team tier', () => {
    beforeEach(() => {
      setup({
        tierValue: TierNames.TEAM,
        edges: mockRepositories(),
      })
    })

    it('only renders public repos', async () => {
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })
      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(1)
    })
  })

  describe('sorting table headers', () => {
    const user = userEvent.setup()
    it('sorts by name', async () => {
      const { reposForOwnerMock } = setup({
        edges: mockRepositories(),
      })
      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Name/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'ASC',
            ordering: 'NAME',
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'DESC',
            ordering: 'NAME',
          })
        )
      })
    })

    it('sorts by coverage', async () => {
      const { reposForOwnerMock } = setup({
        edges: mockRepositories(),
      })

      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Test coverage/)
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'DESC',
            ordering: 'COVERAGE',
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'ASC',
            ordering: 'COVERAGE',
          })
        )
      })
    })

    it('sorts by last commit', async () => {
      const { reposForOwnerMock } = setup({
        edges: mockRepositories(),
      })

      render(<ReposTable searchValue="" owner="owner1" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
      })

      const header = await screen.findByText(/Last updated/)
      expect(header).toBeInTheDocument()
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'DESC',
            ordering: 'COMMIT_DATE',
          })
        )
      })
      await user.click(header)
      await waitFor(() => {
        expect(reposForOwnerMock).toHaveBeenCalledWith(
          expect.objectContaining({
            direction: 'DESC',
            ordering: 'COMMIT_DATE',
          })
        )
      })
    })
  })

  describe('when rendered empty repos', () => {
    beforeEach(() => {
      setup({
        edges: [],
        privateAccess: true,
      })
    })

    it('renders no repos detected', async () => {
      render(<ReposTable searchValue="" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.CONFIGURED.text),
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
    beforeEach(() => {
      setup({
        edges: [],
      })
    })

    it('renders no results found', async () => {
      render(<ReposTable searchValue="something" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.ALL.text),
      })

      const noResultsFound = await screen.findByText(/No results found/)
      expect(noResultsFound).toBeInTheDocument()
    })
  })

  describe('when rendered with multiple pages', () => {
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
              name: 'Repo name first page',
              latestCommitAt: subDays(new Date(), 3).toISOString(),
              coverage: 43,
              active: true,
              lines: 99,
              updatedAt: '2020-08-25T16:36:19.67986800:00',
              repositoryConfig: null,
              coverageEnabled: false,
              bundleAnalysisEnabled: false,
            },
          },
        ],
      })
    })

    it('fetches additional pages', async () => {
      render(<ReposTable searchValue="" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.ALL.text),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(2)
    })
  })

  describe('when rendered with all repos', () => {
    beforeEach(() => {
      setup({
        isCurrentUserPartOfOrg: false,
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
              coverage: 0,
              active: true,
              updatedAt: '2020-08-25T16:36:19.67986800:00',
              repositoryConfig: null,
              lines: 123,
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
              coverage: 100,
              active: true,
              updatedAt: '2020-08-25T16:36:19.67986800:00',
              repositoryConfig: null,
              lines: 123,
              coverageEnabled: false,
              bundleAnalysisEnabled: false,
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
              coverage: null,
              active: false,
              updatedAt: '2020-08-25T16:36:19.67986800:00',
              repositoryConfig: null,
              lines: 123,
              coverageEnabled: false,
              bundleAnalysisEnabled: false,
            },
          },
        ],
      })
    })

    it('renders all repos', async () => {
      render(<ReposTable searchValue="" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.ALL.text),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('renders inactive copy for inactive repos', async () => {
      render(<ReposTable searchValue="" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.ALL.text),
      })

      expect(await screen.findByText(/Inactive/)).toBeTruthy()
      const label = screen.getByText(/Inactive/)
      expect(label).toBeInTheDocument()
    })

    it('renders deactivated for inactive repos', async () => {
      render(<ReposTable searchValue="" owner="" />, {
        wrapper: wrapper(repoDisplayOptions.ALL.text),
      })

      expect(await screen.findByText(/Deactivated/)).toBeTruthy()
      const label = screen.getByText(/Deactivated/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('handles demo repo', () => {
    beforeEach(() => {
      setup({})
      server.use(
        graphql.query('ReposForOwner', async (info) => {
          const demoRepo = [
            {
              node: {
                private: false,
                activated: true,
                author: {
                  username: 'codecov',
                },
                name: 'gazebo',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                coverage: 0,
                active: true,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                repositoryConfig: null,
                lines: 123,
                coverageEnabled: true,
                bundleAnalysisEnabled: true,
              },
            },
          ]

          const myRepos = [
            {
              node: {
                private: false,
                activated: false,
                author: {
                  username: 'owner1',
                },
                name: 'Repo name 1',
                latestCommitAt: subDays(new Date(), 3).toISOString(),
                coverage: 0,
                active: true,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                repositoryConfig: null,
                lines: 123,
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
                coverage: 100,
                active: true,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                repositoryConfig: null,
                lines: 123,
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
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
                coverage: null,
                active: false,
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                repositoryConfig: null,
                lines: 123,
                coverageEnabled: false,
                bundleAnalysisEnabled: false,
              },
            },
          ]

          let reposToReturn = myRepos.filter(
            (repo) =>
              !info.variables.filters.term ||
              repo.node.name.includes(info.variables.filters.term)
          )

          if (info.variables.owner === 'codecov') {
            reposToReturn = demoRepo
          }

          return HttpResponse.json({
            data: {
              owner: {
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

    it('shows demo repo and your repos when on your owner page', async () => {
      render(<ReposTable searchValue="" owner="owner1" mayIncludeDemo />, {
        wrapper: wrapper('', '/github/owner1', '/:provider/:owner'),
      })
      const links = await screen.findAllByText(/Repo name/)
      expect(links.length).toBe(3)
      const demoLink = await screen.findAllByText(/Codecov demo/)
      expect(demoLink.length).toBe(1)
    })

    it('shows demo repo when search term includes it', async () => {
      render(<ReposTable searchValue="dem" owner="owner1" mayIncludeDemo />, {
        wrapper: wrapper('', '/github/owner1', '/:provider/:owner'),
      })
      const repo = screen.queryByText(/Repo name/)
      expect(repo).not.toBeInTheDocument()
      const demoLink = await screen.findAllByText(/Codecov demo/)
      expect(demoLink.length).toBe(1)
    })
  })
})