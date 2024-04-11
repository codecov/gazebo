import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { useIntersection } from 'react-use'

import config from 'config'

import { useBranches } from 'services/branches'

import Badges from './Badges'

jest.mock('config')
jest.mock('services/branches')
jest.mock('react-use/lib/useIntersection')
const mockedUseBranches = useBranches as jest.Mock
const mockedUseIntersection = useIntersection as jest.Mock

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings/badge']}>
    <Route path="/:provider/:owner/:repo/settings/badge">{children}</Route>
  </MemoryRouter>
)

beforeEach(() => jest.clearAllMocks())

describe('Badges', () => {
  function setup({
    noBranches = false,
    isFetching = false,
    hasNextPage = false,
    fetchNextPage = () => {},
  }) {
    config.BASE_URL = 'https://stage-web.codecov.dev'
    mockedUseBranches.mockReturnValue({
      data: {
        branches: noBranches
          ? undefined
          : [
              {
                name: 'branch-1',
                head: null,
              },
              {
                name: 'branch-2',
                head: null,
              },
              {
                name: 'branch-3',
                head: null,
              },
            ],
      },
      isFetching,
      hasNextPage,
      fetchNextPage,
    })

    return userEvent.setup()
  }

  describe('renders', () => {
    it('renders title', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const p = screen.getByText(
        /A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders with expected base url', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const baseUrl = screen.getByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders tokens', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
      expect(screen.getByText('RST')).toBeInTheDocument()
    })
  })

  describe('branch selector', () => {
    it('renders proper url with Default branch selected', async () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const baseUrl = screen.getByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders proper url with non-default branch selected', async () => {
      const user = setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      const branch = await screen.findByText('branch-2')
      user.click(branch)

      await waitForElementToBeRemoved(branch)

      const baseUrl = await screen.findByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/branch/branch-2/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders loading state', async () => {
      const user = setup({ noBranches: true, isFetching: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      const loading = await screen.findByText('Loading more items...')
      expect(loading).toBeInTheDocument()
    })

    it('renders Default branch as option even if no branches present', async () => {
      const user = setup({ noBranches: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      await waitFor(() => expect(mockedUseBranches).toHaveBeenCalled())
      expect(await screen.findByText('Search')).toBeInTheDocument()

      const loading = screen.queryAllByText('Default branch')
      expect(loading).toHaveLength(2)
    })

    it('tries to load more', async () => {
      mockedUseIntersection.mockReturnValue({ isIntersecting: true })
      const fetchNextPage = jest.fn()
      const user = setup({ hasNextPage: true, fetchNextPage, isFetching: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      expect(await screen.findByText('Search')).toBeInTheDocument()

      await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
    })

    it('handles searching', async () => {
      const fetchNextPage = jest.fn()
      const user = setup({ hasNextPage: true, fetchNextPage, isFetching: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      expect(await screen.findByText('Search')).toBeInTheDocument()

      const searchField = await screen.findByPlaceholderText('Search')
      await user.type(searchField, 'branch-3')

      await waitFor(() =>
        expect(mockedUseBranches).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: { searchValue: 'branch-3' },
          })
        )
      )
    })
  })
})
