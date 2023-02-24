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

const wrapper =
  (repoDisplay) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <ActiveContext.Provider value={repoDisplay}>
              {children}
            </ActiveContext.Provider>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

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
        repoDisplayPassed: repoDisplayOptions.ACTIVE.text,
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
              lines: 99,
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
            },
          },
        ],
      })
    })

    describe('renders active table headers', () => {
      it('renders table name header', async () => {
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

        const header = await screen.findByText(/Name/)
        expect(header).toBeInTheDocument()
      })

      it('renders table coverage header', async () => {
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

        const header = await screen.findByText(/Test coverage/)
        expect(header).toBeInTheDocument()
      })

      it('renders table last updated header', async () => {
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

        const header = await screen.findByText(/Last updated/)
        expect(header).toBeInTheDocument()
      })

      it('renders table tracked lines header', async () => {
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

        const header = await screen.findByText(/Tracked lines/)
        expect(header).toBeInTheDocument()
      })
    })

    it('renders table repo name', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('links to /:organization/:owner/:repo', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

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

    it('renders last updated column', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const lastSeen1 = await screen.findByText(/3 days ago/)
      expect(lastSeen1).toBeInTheDocument()

      const lastSeen2 = await screen.findByText(/2 days ago/)
      expect(lastSeen2).toBeInTheDocument()
    })

    it('renders coverage column', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const coverage1 = await screen.findByText(/43\.00/)
      expect(coverage1).toBeInTheDocument()

      const coverage2 = await screen.findByText(/100\.00/)
      expect(coverage2).toBeInTheDocument()
    })

    it('renders tracked lines column', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const lines1 = await screen.findByText('99')
      expect(lines1).toBeInTheDocument()

      const lines2 = await screen.findByText('101')
      expect(lines2).toBeInTheDocument()
    })

    it('renders handles null coverage', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const noData = await screen.findByText(/No data/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered with active false', () => {
    describe('user belongs to org', () => {
      beforeEach(() => {
        setup({
          repoDisplayPassed: repoDisplayOptions.INACTIVE.text,
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
        const linkProps = { ...props, owner: 'owner1' }
        render(<ReposTable {...linkProps} />, {
          wrapper: wrapper(repoDisplay),
        })

        const repo1 = await screen.findByRole('link', {
          name: 'globe-alt.svg Repo name 1',
        })
        expect(repo1).toHaveAttribute('href', '/gh/owner1/Repo name 1/new')

        const repo2 = await screen.findByRole('link', {
          name: 'lock-closed.svg Repo name 2',
        })
        expect(repo2).toHaveAttribute('href', '/gh/owner1/Repo name 2/new')

        const repo3 = await screen.findByRole('link', {
          name: 'lock-closed.svg Repo name 3',
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
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

        const repo1 = await screen.findByText('Repo name 1')
        expect(repo1).not.toHaveAttribute('href')

        const repo2 = await screen.findByText('Repo name 2')
        expect(repo2).not.toHaveAttribute('href')

        const repo3 = await screen.findByText('Repo name 3')
        expect(repo3).not.toHaveAttribute('href')
      })

      it('does not show setup repo link', async () => {
        render(<ReposTable {...props} />, {
          wrapper: wrapper(repoDisplay),
        })

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
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const buttons = await screen.findAllByText(/No repos setup yet/)
      expect(buttons.length).toBe(1)
    })

    it('renders select the repo text', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const p = await screen.findByText('Select the repo')
      expect(p).toBeInTheDocument()
    })

    it('renders the select the repo to have the right link', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const p = await screen.findByText('Select the repo')
      expect(p).toBeInTheDocument()
    })

    it('renders the quick start guide link', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const link = await screen.findByRole('link', {
        name: 'quick start guide. external-link.svg',
      })
      expect(link).toBeInTheDocument()
    })

    it('renders the view repos for setup button', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const btn = await screen.findByRole('button', {
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
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

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
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const button = await screen.findByText(/Load More/)
      expect(button).toBeInTheDocument()
    })

    it('loads next page of data', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      const loadMore = await screen.findByText(/Load More/)
      userEvent.click(loadMore)

      const newlyLoadedRepo = await screen.findByText('Repo name extra')
      expect(newlyLoadedRepo).toBeInTheDocument()
    })
  })

  describe('when rendered with all repos', () => {
    beforeEach(() => {
      setup({
        repoDisplayPassed: repoDisplayOptions.ALL.text,
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
              activated: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 5).toISOString(),
              coverage: null,
              active: false,
            },
          },
        ],
      })
    })

    it('renders all repos', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const buttons = await screen.findAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('renders not yet set up for inactive repos', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const label = await screen.findByText(/Not yet enabled/)
      expect(label).toBeInTheDocument()
    })

    it('renders deactivated for inactive repos', async () => {
      render(<ReposTable {...props} />, {
        wrapper: wrapper(repoDisplay),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const label = await screen.findByText(/Deactivated/)
      expect(label).toBeInTheDocument()
    })
  })
})
