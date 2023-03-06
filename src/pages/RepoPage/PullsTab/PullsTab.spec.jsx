import userEvent from '@testing-library/user-event'

import PullsTab from './PullsTab'

import { repoPageRender, screen } from '../repo-jest-setup'

jest.mock('./PullsTable/PullsTable', () => () => 'PullsTable')

describe('Pulls Pab', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('when rendered', () => {
    it('renders select by updatestamp label', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/Sort by:/)
      expect(label).toBeInTheDocument()
    })

    it('renders view by state label', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/View:/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by updatestamp', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/All/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by state', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/Newest/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('view by state', () => {
    it('renders all options', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('All')
      userEvent.click(select)

      const openOption = screen.getByText('Open')
      expect(openOption).toBeInTheDocument()

      const mergedOption = screen.getByText('Merged')
      expect(mergedOption).toBeInTheDocument()

      const closedOption = screen.getByText('Closed')
      expect(closedOption).toBeInTheDocument()
    })
  })

  describe('order by updatestamp', () => {
    it('renders all options', () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('Newest')
      userEvent.click(select)

      const oldest = screen.getByText('Oldest')
      expect(oldest).toBeInTheDocument()
    })
  })

  describe('order by Oldest', () => {
    it('renders the selected option', async () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('Newest')
      userEvent.click(select)

      const state = screen.getByRole('option', { name: 'Oldest' })
      userEvent.click(state)

      const oldestOption = await screen.findByText('Oldest')
      expect(oldestOption).toBeInTheDocument()

      const newestOption = screen.queryByText('Newest')
      expect(newestOption).not.toBeInTheDocument()
    })
  })

  describe('view by Merged', () => {
    it('renders the number of selected options', async () => {
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('All')
      userEvent.click(select)

      const state = screen.getAllByRole('option')[2]
      userEvent.click(state)

      const itemSelected = await screen.findByText(/1 selected/)
      expect(itemSelected).toBeInTheDocument()
    })
  })
})
