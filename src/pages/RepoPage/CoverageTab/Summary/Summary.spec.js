import { graphql, setupServer } from 'msw'

import {
  queryClient,
  repoPageRender,
  screen,
} from 'pages/RepoPage/repo-jest-setup'

import Summary from './Summary'

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('Summary', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                defaultBranch: 'test',
                coverage: 66.66,
                branches: {
                  edges: [
                    {
                      node: {
                        name: 'main',
                        head: {
                          commitid: '123456',
                        },
                      },
                    },
                  ],
                },
              },
            },
          })
        )
      }),
      graphql.query('GetRepoCoverage', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                branch: {
                  head: {
                    totals: {
                      percentCovered: 33.33,
                    },
                  },
                },
              },
            },
          })
        )
      })
    )
    repoPageRender({
      renderRoot: () => <Summary />,
      initialEntries: ['/gh/criticalrole/mightynein'],
    })
  }

  describe('when there is no coverage data to be shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the coderenderer', () => {
      expect(screen.getByText(/Fearne/)).toBeInTheDocument()
    })
  })
})
