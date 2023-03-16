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

const mockRepo = {
  owner: {
    repository: {
      defaultBranch: 'main',
    },
  },
}

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
          endCursor: 'some cursor',
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

describe('Commits Tab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  function setup({ hasNextPage }) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()
    const searches = jest.fn()

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockRepo))
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        if (!!req?.variables?.after) {
          fetchNextPage(req?.variables?.after)
        }

        if (!!req?.variables?.filters?.searchValue) {
          searches(req?.variables?.filters?.searchValue)
        }

        return res(ctx.status(200), ctx.data(mockBranches(hasNextPage)))
      }),
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCommits))
      )
    )

    return { fetchNextPage, searches, user }
  }

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

    it('render the checkbox', () => {
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
    describe('when there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const { fetchNextPage, user } = setup({ hasNextPage: true })
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByText('Select')
        await user.click(select)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() => expect(fetchNextPage).toBeCalled())
        await waitFor(() => expect(fetchNextPage).toBeCalledWith('some cursor'))
      })
    })

    describe('when there is not a next page', () => {
      /*  TODO: this is a false positive test. The component is
          actually calling it but because of scoping it was
          always falsy
      */
      const fetchNextPage = jest.fn()

      beforeEach(() => {
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      it('does not call fetchNextPage', async () => {
        const { user } = setup({ hasNextPage: false })
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

        expect(fetchNextPage).not.toBeCalled()
      })
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

      const select = await screen.findByText('Select')
      await user.click(select)

      const search = await screen.findByRole('textbox')
      await user.type(search, 'searching for a branch')

      await waitFor(() => expect(searches).toBeCalled())
      await waitFor(() =>
        expect(searches).toBeCalledWith('searching for a branch')
      )
    })
  })
})
