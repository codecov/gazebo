import userEvent from '@testing-library/user-event'

import PullsTab from './PullsTab'

import { repoPageRender, screen } from '../repo-test-setup'

vi.mock('./PullsTable', () => ({ default: () => 'PullsTable' }))

describe('Pulls Tab', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('rendering table controls', () => {
    it('renders select by updatestamp label', () => {
      setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/Sort by:/)
      expect(label).toBeInTheDocument()
    })

    it('renders view by state label', () => {
      setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/View:/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by updatestamp', () => {
      setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/All/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by state', () => {
      setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const label = screen.getByText(/Newest/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('rendering table', () => {
    it('renders PullsTable component', async () => {
      setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const table = await screen.findByText('PullsTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('view by state', () => {
    it('renders all options', async () => {
      const { user } = setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('All')
      await user.click(select)

      const openOption = screen.getByText('Open')
      expect(openOption).toBeInTheDocument()

      const mergedOption = screen.getByText('Merged')
      expect(mergedOption).toBeInTheDocument()

      const closedOption = screen.getByText('Closed')
      expect(closedOption).toBeInTheDocument()
    })
  })

  describe('order by updatestamp', () => {
    it('renders all options', async () => {
      const { user } = setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('Newest')
      await user.click(select)

      const oldest = screen.getByText('Oldest')
      expect(oldest).toBeInTheDocument()
    })
  })

  describe('order by oldest', () => {
    it('renders the selected option', async () => {
      const { user } = setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('Newest')
      await user.click(select)

      const state = screen.getByRole('option', { name: 'Oldest' })
      await user.click(state)

      const oldestOption = await screen.findByText('Oldest')
      expect(oldestOption).toBeInTheDocument()

      const newestOption = screen.queryByText('Newest')
      expect(newestOption).not.toBeInTheDocument()
    })
  })

  describe('view by merged', () => {
    it('renders the number of selected options', async () => {
      const { user } = setup()
      repoPageRender({
        initialEntries: ['/gh/codecov/gazebo/pulls'],
        renderPulls: () => <PullsTab />,
      })

      const select = screen.getByText('All')
      await user.click(select)

      const state = screen.getAllByRole('option')[2]

      if (state) {
        await user.click(state)
      }

      const itemSelected = await screen.findByText(/1 selected/)
      expect(itemSelected).toBeInTheDocument()
    })
  })
})
