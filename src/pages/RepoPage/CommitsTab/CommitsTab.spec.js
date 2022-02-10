import userEvent from '@testing-library/user-event'
import { repoPageRender, screen } from '../repo-jest-setup'

import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'
import CommitsTab from './CommitsTab'

jest.mock('services/commits')
jest.mock('services/repo')

describe('Commits Tab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  function setup({ hasNextPage = true }) {
    useRepo.mockReturnValue({ repository: { defaultBranch: 'main' } })
    useCommits.mockReturnValue({
      hasNextPage,
      data: {
        commits: [
          {
            author: { username: 'RulaKhaled' },
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
            author: { username: 'Terry' },
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
      setup({})
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

    it('has false as initial value to the checkbox', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.value).toEqual('false')
    })

    it('renders load more pagination button', () => {
      const btn = screen.getByText(/Load More/)
      expect(btn).toBeInTheDocument()
    })
  })

  describe('when click on the checkbox', () => {
    beforeEach(() => {
      setup({})
      userEvent.click(screen.getByRole('checkbox'))
    })

    it('changes the value to true', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.value).toEqual('true')
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
})
