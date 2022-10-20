import userEvent from '@testing-library/user-event'
import useIntersection from 'react-use/lib/useIntersection'

import { useBranches } from 'services/branches'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'

import CommitsTab from './CommitsTab'

import { repoPageRender, screen } from '../repo-jest-setup'

jest.mock('services/branches')
jest.mock('services/commits')
jest.mock('services/repo')
jest.mock('react-use/lib/useIntersection')

describe('Commits Tab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })
  const fetchNextPage = jest.fn()

  function setup({ hasNextPage }) {
    useRepo.mockReturnValue({ repository: { defaultBranch: 'main' } })
    useBranches.mockReturnValue({
      data: { branches: [{ name: 'main', head: { commitid: '1' } }] },
      fetchNextPage,
      hasNextPage: true,
    })
    useCommits.mockReturnValue({
      hasNextPage,
      data: {
        commits: [
          {
            author: { username: 'RulaKhaled', avatarUrl: 'random' },
            compareWithParent: {
              patchTotals: {
                coverage: 90,
              },
            },
            totals: {
              coverage: 45,
            },
            commitid: 'id',
            message: 'Test1',
            createdAt: '2021-08-30T19:33:49.819672',
          },
          {
            author: { username: 'Terry', avatarUrl: 'random' },
            compareWithParent: {
              patchTotals: {
                coverage: 55,
              },
            },
            totals: {
              coverage: 59,
            },
            commitid: 'id',
            message: 'Test2',
            createdAt: '2021-08-30T19:33:49.819672',
          },
        ],
      },
    })

    repoPageRender({
      renderCommits: () => <CommitsTab />,
      initialEntries: ['/gh/codecov/gazebo/commits'],
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
    })

    it('renders with table name heading', () => {
      const head = screen.getByText(/Name/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table coverage heading', () => {
      const head = screen.getByText(/Coverage/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', () => {
      const head = screen.getByText(/Change/)
      expect(head).toBeInTheDocument()
    })

    it('render the checkbox', () => {
      const label = screen.getByText('Hide commits with failed CI')
      expect(label).toBeInTheDocument()
    })

    it('has false as initial checked property value of the checkbox', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('renders load more pagination button', () => {
      const btn = screen.getByText(/Load More/)
      expect(btn).toBeInTheDocument()
    })
  })

  describe('when click on the checkbox', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      userEvent.click(screen.getByRole('checkbox'))
    })

    it('changes checked property value to true', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('when renders with no next page', () => {
    beforeEach(() => {
      setup({ hasNextPage: false })
    })

    it('does not display load more pagination button', () => {
      const btn = screen.queryByText(/Load More/)
      expect(btn).not.toBeInTheDocument()
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('when there is a next page', () => {
      beforeEach(() => {
        setup({ hasNextPage: false })
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      it('calls fetchNextPage', async () => {
        const select = await screen.findByText('Select')
        userEvent.click(select)

        expect(fetchNextPage).toBeCalled()
      })
    })

    describe('when there is not a next page', () => {
      const fetchNextPage = jest.fn()
      beforeEach(() => {
        setup({ hasNextPage: false })
        useBranches.mockReturnValue({
          data: { branches: [{ name: 'main', head: { commitid: '1' } }] },
          fetchNextPage,
          hasNextPage: false,
        })
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      it('does not call fetchNextPage', async () => {
        const select = await screen.findByRole('button')
        userEvent.click(select)

        expect(fetchNextPage).not.toBeCalled()
      })
    })
  })
})
