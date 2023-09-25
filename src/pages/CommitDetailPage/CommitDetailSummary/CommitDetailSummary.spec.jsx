import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailSummary from './CommitDetailSummary'

const commit = (state = 'complete') => ({
  totals: { coverage: 90 },
  state,
  commitid: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
  pullId: null,
  branchName: 'main',
  createdAt: '2022-03-10T19:14:13',
  author: { username: 'cool-user' },
  uploads: {
    edges: [
      {
        node: {
          id: null,
          state: 'PROCESSED',
          provider: null,
          createdAt: '2022-03-10T19:14:33.148945+00:00',
          updatedAt: '2022-03-10T19:14:33.347403+00:00',
          flags: [],
          jobCode: null,
          downloadUrl: 'secret-file.txt',
          ciUrl: null,
          uploadType: 'UPLOADED',
          buildCode: null,
          errors: null,
          name: null,
        },
      },
      {
        node: {
          id: null,
          state: 'PROCESSED',
          provider: null,
          createdAt: '2022-03-14T12:49:29.568415+00:00',
          updatedAt: '2022-03-14T12:49:30.157909+00:00',
          flags: [],
          jobCode: null,
          downloadUrl: 'secret-file.txt',
          ciUrl: null,
          uploadType: 'UPLOADED',
          buildCode: null,
          errors: null,
          name: null,
        },
      },
    ],
  },
  message: 'Test commit message',
  ciPassed: true,
  parent: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: { coverage: 100 },
  },
  compareWithParent: {
    __typename: 'Comparison',
    state: 'processed',
    patchTotals: { coverage: 75 },
    indirectChangedFilesCount: 1,
    directChangedFilesCount: 1,
    impactedFiles: [
      {
        patchCoverage: { coverage: 75 },
        headName: 'flag1/mafs.js',
        baseCoverage: { coverage: 100 },
        headCoverage: { coverage: 90 },
      },
    ],
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commit/sha256']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('CommitDetailSummary', () => {
  function setup(hasErrored = false) {
    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        if (hasErrored) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'Repository',
                  commit: commit('ERROR'),
                },
              },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: { __typename: 'Repository', commit: commit() },
            },
          })
        )
      })
    )
  }

  describe('when rendered with valid fields', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders a card for every valid field', () => {
      it('has a head card', async () => {
        render(<CommitDetailSummary />, { wrapper })

        const headCardTitle = await screen.findByText('HEAD')
        expect(headCardTitle).toBeInTheDocument()

        const headCardValue = await screen.findByText(`90.00%`)
        expect(headCardValue).toBeInTheDocument()
      })

      it('has a patch card', async () => {
        render(<CommitDetailSummary />, { wrapper })

        const patchCardTitle = await screen.findByText('Patch')
        expect(patchCardTitle).toBeInTheDocument()

        const patchCardValue = await screen.findByText(`75.00%`)
        expect(patchCardValue).toBeInTheDocument()
      })

      it('has a change card', async () => {
        render(<CommitDetailSummary />, { wrapper })

        const changeCardTitle = await screen.findByText('Change')
        expect(changeCardTitle).toBeInTheDocument()

        const changeCardValue = await screen.findByText(`-10.00%`)
        expect(changeCardValue).toBeInTheDocument()
      })

      it('has a source card', async () => {
        render(<CommitDetailSummary />, { wrapper })

        const sourceCardTitle = await screen.findByText('Source')
        expect(sourceCardTitle).toBeInTheDocument()

        const commitText = await screen.findByText(/This commit/i)
        expect(commitText).toBeInTheDocument()

        const commitId = await screen.findAllByText(
          commit().commitid.slice(0, 7)
        )
        expect(commitId[0]).toBeInTheDocument()

        const parentCommitId = await screen.findByText(
          commit().parent.commitid.slice(0, 7)
        )
        expect(parentCommitId).toBeInTheDocument()
      })
    })
  })

  describe('when rendered with state error', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders error message', async () => {
      render(<CommitDetailSummary />, { wrapper })

      const errorMsg = await screen.findByText(
        /There is an error processing the coverage reports/
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('suggests support links', async () => {
      render(<CommitDetailSummary />, { wrapper })

      const pathFix = await screen.findByRole('link', {
        name: 'files paths external-link.svg',
      })
      expect(pathFix).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/fixing-paths'
      )

      const errorRef = await screen.findByRole('link', {
        name: 'reference external-link.svg',
      })
      expect(errorRef).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference'
      )
    })
  })
})
