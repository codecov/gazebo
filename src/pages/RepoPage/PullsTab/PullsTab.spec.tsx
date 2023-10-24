import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import PullsTab from './PullsTab'

import { repoPageRender, screen } from '../repo-jest-setup'

jest.mock('./PullsTable', () => () => 'PullsTable')
jest.mock('./PullsTableTeam', () => () => 'PullsTableTeam')

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  tierValue?: 'pro' | 'team'
}

describe('Pulls Tab', () => {
  function setup({ tierValue = 'pro' }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (tierValue === 'team') {
          return res(
            ctx.status(200),
            ctx.data({
              owner: { plan: { tierName: 'team' } },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: 'pro' } },
          })
        )
      })
    )

    return { user }
  }

  describe('rendering table controls', () => {
    beforeEach(() => setup({}))

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

  describe('rendering table', () => {
    describe('on non-team tier', () => {
      it('renders PullsTable component', async () => {
        setup({})
        repoPageRender({
          initialEntries: ['/gh/codecov/gazebo/pulls'],
          renderPulls: () => <PullsTab />,
        })

        const table = await screen.findByText('PullsTable')
        expect(table).toBeInTheDocument()
      })
    })

    describe('on team tier', () => {
      it('renders PullsTableTeam component', async () => {
        setup({ tierValue: 'team' })
        repoPageRender({
          initialEntries: ['/gh/codecov/gazebo/pulls'],
          renderPulls: () => <PullsTab />,
        })

        const table = await screen.findByText('PullsTableTeam')
        expect(table).toBeInTheDocument()
      })
    })
  })

  describe('view by state', () => {
    it('renders all options', async () => {
      const { user } = setup({})
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
      const { user } = setup({})
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
      const { user } = setup({})
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
      const { user } = setup({})
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
