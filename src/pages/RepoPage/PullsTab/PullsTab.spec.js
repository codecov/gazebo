import { repoPageRender, fireEvent, screen } from '../repo-jest-setup'

import { usePulls } from 'services/pulls/hooks'
import PullsTab from '.'

jest.mock('services/pulls/hooks')

describe('Pulls Pab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  function setup({ hasNextPage }) {
    usePulls.mockReturnValue({
      hasNextPage,
      data: {
        pulls: [
          {
            node: {
              author: { username: 'RulaKhaled' },
              compareWithBase: {
                patchTotals: {
                  coverage: 90,
                },
              },
              head: {
                totals: {
                  coverage: 45,
                },
              },
              pullId: 746,
              state: 'MERGED',
              title: 'Test1',
              updatestamp: '2021-08-30T19:33:49.819672',
            },
          },
          {
            node: {
              author: { username: 'ThiagoCodecov' },
              compareWithBase: {
                patchTotals: {
                  coverage: 87,
                },
              },
              head: {
                totals: {
                  coverage: 100,
                },
              },
              pullId: 745,
              state: 'OPEN',
              title: 'Test2',
              updatestamp: '2021-07-30T19:33:49.819672',
            },
          },
        ],
      },
    })

    repoPageRender({
      initialEntries: ['/gh/codecov/gazebo/pulls'],
      renderPulls: () => <PullsTab />,
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
      const head = screen.getByText(/Coverage on/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', () => {
      const head = screen.getByText(/Change from/)
      expect(head).toBeInTheDocument()
    })

    it('renders select by updatestamp label', () => {
      const label = screen.getByText(/Sort by:/)
      expect(label).toBeInTheDocument()
    })

    it('renders view by state label', () => {
      const label = screen.getByText(/View:/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by updatestamp', () => {
      const label = screen.getByText(/All/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by state', () => {
      const label = screen.getByText(/Newest/)
      expect(label).toBeInTheDocument()
    })

    it('renders load more pagination button', () => {
      const btn = screen.getByText(/Load More/)
      expect(btn).toBeInTheDocument()
    })
  })

  describe('view by state', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      const select = screen.getByText('All')
      fireEvent.click(select)
    })

    it('renders all options', () => {
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Merged')).toBeInTheDocument()
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })
  })

  describe('order by updatestamp', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      const select = screen.getByText('Newest')
      fireEvent.click(select)
    })

    it('renders all options', () => {
      expect(screen.getByText('Oldest')).toBeInTheDocument()
    })
  })

  describe('order by Oldest', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      const select = screen.getByText('Newest')
      fireEvent.click(select)
      const state = screen.getAllByRole('option')[1]
      fireEvent.click(state)
    })

    it('renders the selected option', () => {
      expect(screen.getByText('Oldest')).toBeInTheDocument()
      expect(screen.queryByText('Newest')).not.toBeInTheDocument()
    })
  })

  describe('view by Merged', () => {
    beforeEach(() => {
      setup({ hasNextPage: false })
      const select = screen.getByText('All')
      fireEvent.click(select)
      const state = screen.getAllByRole('option')[2]
      fireEvent.click(state)
    })

    it('renders the number of selected options', () => {
      expect(screen.getByText(/1 selected/)).toBeInTheDocument()
      expect(screen.queryByText('All')).not.toBeInTheDocument()
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
