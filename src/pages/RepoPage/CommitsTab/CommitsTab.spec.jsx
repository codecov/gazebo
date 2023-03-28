import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import useIntersection from 'react-use/lib/useIntersection'

import CommitsTab from './CommitsTab'

import { repoPageRender, screen, waitFor } from '../repo-jest-setup'

jest.mock('react-use/lib/useIntersection')

const queryClient = new QueryClient()
const server = setupServer()

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

const mockBranches = (hasNextPage = false) => ({
  owner: {
    repository: {
      branches: {
        edges: [
          {
            name: 'main',
            head: {
              commitid: '1',
            },
          },
        ],
        pageInfo: {
          hasNextPage,
          endCursor: hasNextPage ? 'some cursor' : undefined,
        },
      },
    },
  },
})

const mockCommits = {
  owner: {
    repository: {
      commits: {
        edges: [null],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'some cursor',
        },
      },
    },
  },
}

const mockOverview = {
  owner: {
    repository: {
      defaultBranch: 'main',
    },
  },
}

const mockBranch = (branchName) => ({
  owner: {
    repository: {
      branch: {
        name: branchName,
        head: {
          commitid: branchName === 'imogen' ? 'commit-123' : 'commit-321',
        },
      },
    },
  },
})

describe('CommitsTab', () => {
  function setup({ hasNextPage, hasBranches, returnBranch = true }) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()
    const searches = jest.fn()
    const branchName = jest.fn()

    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        if (!!req?.variables?.after) {
          fetchNextPage(req?.variables?.after)
        }

        if (!!req?.variables?.filters?.searchValue) {
          searches(req?.variables?.filters?.searchValue)
        }

        if (hasBranches) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { repository: { branches: {} } } })
          )
        }

        return res(ctx.status(200), ctx.data(mockBranches(hasNextPage)))
      }),
      graphql.query('GetCommits', (req, res, ctx) => {
        branchName(req?.variables?.filters?.branchName)

        return res(ctx.status(200), ctx.data(mockCommits))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOverview))
      ),
      graphql.query('GetBranch', (req, res, ctx) => {
        if (returnBranch) {
          return res(ctx.status(200), ctx.data(mockBranch(branchName)))
        }

        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      )
    )

    return { fetchNextPage, searches, user, branchName }
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
    })

    it('renders with table name heading', () => {
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = screen.getByText(/Name/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table coverage heading', () => {
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = screen.getByText(/Coverage/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', () => {
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = screen.getByText(/Change/)
      expect(head).toBeInTheDocument()
    })

    it('renders the checkbox', () => {
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const label = screen.getByText('Hide commits with failed CI')
      expect(label).toBeInTheDocument()
    })

    it('has false as initial checked property value of the checkbox', () => {
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('when user clicks on the checkbox', () => {
    it('changes checked property value to true', async () => {
      const { user } = setup({ hasNextPage: true })
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const initialCheckBox = screen.getByRole('checkbox')
      await user.click(initialCheckBox)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('when select onLoadMore is triggered', () => {
    beforeEach(() => {
      useIntersection.mockReturnValue({
        isIntersecting: true,
      })
    })

    describe('when there is not a next page', () => {
      it('does not call fetchNextPage', async () => {
        const { user, fetchNextPage } = setup({ hasNextPage: false })
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByRole('button')
        await user.click(select)

        await waitFor(() => expect(fetchNextPage).not.toHaveBeenCalled())
      })
    })

    describe('when there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const { fetchNextPage, user } = setup({ hasNextPage: true })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByText('Select branch')
        await user.click(select)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() => expect(fetchNextPage).toBeCalled())
        await waitFor(() => expect(fetchNextPage).toBeCalledWith('some cursor'))
      })
    })
  })

  describe('user selects an item from the list', () => {
    it('updates the button with the selected branch', async () => {
      const { user } = setup({})
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const select = await screen.findByRole('button')
      await user.click(select)

      const branch = await screen.findByText('All commits')
      await user.click(branch)

      const allCommitsBtn = await screen.findByRole('button', {
        name: 'All commits',
      })
      expect(allCommitsBtn).toBeInTheDocument()
    })
  })

  describe('user searches for branch', () => {
    it('fetches request with search term', async () => {
      const { searches, user } = setup({ hasNextPage: false })

      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const select = await screen.findByText('Select branch')
      await user.click(select)

      const search = await screen.findByRole('textbox')
      await user.type(search, 'searching for a branch')

      await waitFor(() => expect(searches).toBeCalled())
      await waitFor(() =>
        expect(searches).toBeCalledWith('searching for a branch')
      )
    })

    it('hides all commits from list', async () => {
      const { searches, user } = setup({ hasNextPage: false })

      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const select = await screen.findByText('Select branch')
      await user.click(select)

      const search = await screen.findByRole('textbox')
      await user.type(search, 'searching for a branch')

      await waitFor(() => expect(searches).toBeCalled())

      const allCommits = screen.queryByText('All commits')
      expect(allCommits).not.toBeInTheDocument()
    })
  })
})
