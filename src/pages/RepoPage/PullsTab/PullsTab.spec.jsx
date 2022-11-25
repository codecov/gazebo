import userEvent from '@testing-library/user-event'

import PullsTab from './PullsTab'

import { repoPageRender, screen } from '../repo-jest-setup'

jest.mock('./PullsTable/PullsTable', () => () => 'PullsTable')

describe('Pulls Pab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  function setup() {
    repoPageRender({
      initialEntries: ['/gh/codecov/gazebo/pulls'],
      renderPulls: () => <PullsTab />,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
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
  })

  describe('view by state', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      const select = screen.getByText('All')
      userEvent.click(select)
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
      userEvent.click(select)
    })

    it('renders all options', () => {
      expect(screen.getByText('Oldest')).toBeInTheDocument()
    })
  })

  describe('order by Oldest', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
      const select = screen.getByText('Newest')
      userEvent.click(select)
      const state = screen.getAllByRole('option')[1]
      userEvent.click(state)
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
      userEvent.click(select)
      const state = screen.getAllByRole('option')[2]
      userEvent.click(state)
    })

    it('renders the number of selected options', () => {
      expect(screen.getByText(/1 selected/)).toBeInTheDocument()
    })
  })
})
