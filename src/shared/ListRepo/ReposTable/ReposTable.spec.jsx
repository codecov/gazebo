import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { orderingOptions } from 'services/repos'
import { ActiveContext } from 'shared/context'

import ReposTable from './ReposTable'

import { repoDisplayOptions } from '../ListRepo'

const queryClient = new QueryClient()
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close)

describe('ReposTable', () => {
  let props, repoDisplay

  function setup({
    propObj = {},
    edges = [],
    isCurrentUserPartOfOrg = true,
    repoDisplayPassed = '',
  }) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ me: { user: { userName: 'codecov-user' } } })
        )
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { isCurrentUserPartOfOrg } })
        )
      }),
      graphql.query('ReposForOwner', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repositories: {
                edges,
                pageInfo: {
                  hasNextPage: true,
                  endCursor: '2',
                },
              },
            },
          })
        )
      }),
      graphql.query('MyRepos', (req, res, ctx) => {
        if (req?.variables?.after === '2') {
          return res(
            ctx.status(200),
            ctx.data({
              me: {
                viewableRepositories: {
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
                      },
                    },
                  ],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: '3',
                  },
                },
              },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            me: {
              viewableRepositories: {
                edges,
                pageInfo: {
                  hasNextPage: true,
                  endCursor: '2',
                },
              },
            },
          })
        )
      })
    )

    props = {
      searchValue: '',
      sortItem: orderingOptions[0],
      ...propObj,
    }

    repoDisplay = repoDisplayPassed
  }

  describe('when rendered with active true', () => {
    beforeEach(() => {
      setup({
        repoDisplayPassed: repoDisplayOptions.ALL.text,
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
              active: true,
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
            },
          },
        ],
      })
    })

    it('renders table repo name', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('links to /:organization/:owner/:repo', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const repo1 = await screen.findByRole('link', {
        name: 'globe-alt.svg owner1 / Repo name 1',
      })
      const repo2 = await screen.findByRole('link', {
        name: 'lock-closed.svg owner1 / Repo name 2',
      })
      const repo3 = await screen.findByRole('link', {
        name: 'lock-closed.svg owner1 / Repo name 3',
      })

      expect(repo1).toHaveAttribute('href', '/gh/owner1/Repo name 1')
      expect(repo2).toHaveAttribute('href', '/gh/owner1/Repo name 2')
      expect(repo3).toHaveAttribute('href', '/gh/owner1/Repo name 3')
    })

    it('renders second column', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const lastSeen1 = await screen.findByText(/3 days ago/)
      expect(lastSeen1).toBeInTheDocument()

      const lastSeen2 = await screen.findByText(/2 days ago/)
      expect(lastSeen2).toBeInTheDocument()
    })

    it('renders third column', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const bars = await screen.findAllByTestId('org-progress-bar')
      expect(bars.length).toBe(2)
    })

    it('renders handles null coverage', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const noData = await screen.findByText(/No data available/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered with active false', () => {
    describe('user belongs to org', () => {
      beforeEach(() => {
        setup({
          repoDisplayPassed: repoDisplayOptions.ALL.text,
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
              },
            },
          ],
        })
      })

      it('links to /:organization/:owner/:repo/new', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActiveContext.Provider value={repoDisplay}>
                  <ReposTable {...props} />
                </ActiveContext.Provider>
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const repo1 = await screen.findByRole('link', {
          name: 'globe-alt.svg owner1 / Repo name 1',
        })
        expect(repo1).toHaveAttribute('href', '/gh/owner1/Repo name 1/new')

        const repo2 = await screen.findByRole('link', {
          name: 'lock-closed.svg owner1 / Repo name 2',
        })
        expect(repo2).toHaveAttribute('href', '/gh/owner1/Repo name 2/new')

        const repo3 = await screen.findByRole('link', {
          name: 'lock-closed.svg owner1 / Repo name 3',
        })
        expect(repo3).toHaveAttribute('href', '/gh/owner1/Repo name 3/new')
      })
    })

    describe('user does not belongs to org', () => {
      beforeEach(() => {
        setup({
          repoDisplayPassed: repoDisplayOptions.INACTIVE.text,
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
                coverage: 43,
                active: false,
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
              },
            },
          ],
        })
      })

      it('does not link to setup repo from repo name', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActiveContext.Provider value={repoDisplay}>
                  <ReposTable {...props} />
                </ActiveContext.Provider>
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const repo1 = await screen.findByText('Repo name 1')
        expect(repo1).not.toHaveAttribute('href')

        const repo2 = await screen.findByText('Repo name 2')
        expect(repo2).not.toHaveAttribute('href')

        const repo3 = await screen.findByText('Repo name 3')
        expect(repo3).not.toHaveAttribute('href')
      })

      it('does not show setup repo link', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActiveContext.Provider value={repoDisplay}>
                  <ReposTable {...props} />
                </ActiveContext.Provider>
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const notEnabled = await screen.findAllByText('Not yet enabled')
        expect(notEnabled.length).toBe(3)

        const repo1 = screen.queryByText('setup repo')
        expect(repo1).not.toBeInTheDocument()
      })
    })
  })

  describe('when rendered empty repos', () => {
    beforeEach(() => {
      setup({ edges: [], repoDisplayPassed: repoDisplayOptions.ALL.text })
    })

    it('renders no repos detected', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/No repos setup yet/)
      expect(buttons.length).toBe(1)
    })

    it('renders the select the repo link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const link = await screen.findByRole('link', {
        name: 'Select the repo',
      })
      expect(link).toBeInTheDocument()
    })

    it('renders the select the repo to have the right link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const link = await screen.findByRole('link', { name: 'Select the repo' })
      expect(link).toHaveAttribute('href', '/gh/active')
    })

    it('renders the quick start guide link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const link = await screen.findByRole('link', {
        name: 'quick start guide. external-link.svg',
      })
      expect(link).toBeInTheDocument()
    })

    it('renders the view repos for setup button', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const btn = await screen.findByRole('link', {
        name: 'View repos for setup',
      })
      expect(btn).toBeInTheDocument()
    })
  })

  describe('when rendered empty search', () => {
    beforeEach(() => {
      setup({
        repoDisplayPassed: repoDisplayOptions.ALL.text,
        edges: [],
        propObj: { searchValue: 'something' },
      })
    })
    it('renders no results found', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/no results found/)
      expect(buttons.length).toBe(1)
    })
  })

  describe('render next page button', () => {
    beforeEach(() => {
      setup({
        repoDisplayPassed: repoDisplayOptions.ALL.text,
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
            },
          },
        ],
      })
    })

    it('renders button', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const button = await screen.findByText(/Load More/)
      expect(button).toBeInTheDocument()
    })

    it('loads next page of data', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActiveContext.Provider value={repoDisplay}>
                <ReposTable {...props} />
              </ActiveContext.Provider>
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const loadMore = await screen.findByText(/Load More/)
      userEvent.click(loadMore)

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const newlyLoadedRepo = await screen.findByText('Repo name extra')
      expect(newlyLoadedRepo).toBeInTheDocument()
    })
  })
})
