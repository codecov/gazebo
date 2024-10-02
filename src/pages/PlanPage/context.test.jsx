import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route } from 'react-router-dom'

import {
  PlanProvider,
  useCrumbs,
  usePlanUpdatedNotification,
  useSetCrumbs,
  useSetPlanUpdatedNotification,
} from './context'

const wrapper =
  (initialEntries = '/plan/gh/codecov', path = '/plan/:provider/:owner') =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path={path}>{children}</Route>
    </MemoryRouter>
  )

const TestComponent = () => {
  const crumbs = useCrumbs()
  const setCrumbs = useSetCrumbs()
  const planUpdatedNotification = usePlanUpdatedNotification()
  const setPlanUpdatedNotification = useSetPlanUpdatedNotification()

  return (
    <div>
      <ul>
        {crumbs.map(({ text, children }, i) => (
          <li key={i}>{text || children}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          setCrumbs([{ pageName: 'new crumb', text: 'New Crumb' }])
        }
      >
        set crumb
      </button>
      <button onClick={() => setCrumbs()}>clear crumbs</button>
      <Link to="/plan/gh/codecov">base path</Link>
      <Link to=".">refresh</Link>
      {planUpdatedNotification?.alertOption ? (
        <div>Alert option is {planUpdatedNotification.alertOption}</div>
      ) : null}
      <button
        onClick={() => setPlanUpdatedNotification({ alertOption: 'success' })}
      >
        set plan updated notification
      </button>
    </div>
  )
}

describe('Plan breadcrumb context', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('when calling setCrumbs', () => {
    it('adds new crumb to context', async () => {
      const { user } = setup()

      render(
        <PlanProvider>
          <TestComponent />
        </PlanProvider>,
        {
          wrapper: wrapper(
            '/plan/gh/codecov/upgrade',
            '/plan/:provider/:owner/upgrade'
          ),
        }
      )

      const button = screen.getByRole('button', { name: 'set crumb' })
      await user.click(button)

      const newCrumb = screen.getByText('New Crumb')
      expect(newCrumb).toBeInTheDocument()
    })

    describe('when navigating back to base path', () => {
      it('clears out extra breadcrumbs', async () => {
        const { user } = setup()

        render(
          <PlanProvider>
            <TestComponent />
          </PlanProvider>,
          {
            wrapper: wrapper('/plan/gh/codecov', '/plan/:provider/:owner'),
          }
        )

        const button = screen.getByRole('button', { name: 'set crumb' })
        await user.click(button)

        const link = screen.getByRole('link', { name: 'base path' })
        await user.click(link)

        const temp = screen.queryByText('New Crumb')
        expect(temp).not.toBeInTheDocument()
      })
    })

    describe('no args are passed', () => {
      it('clears crumbs other then base', async () => {
        const { user } = setup()

        render(
          <PlanProvider>
            <TestComponent />
          </PlanProvider>,
          {
            wrapper: wrapper(
              '/plan/gh/codecov/upgrade',
              '/plan/:provider/:owner/upgrade'
            ),
          }
        )

        const setCrumbs = screen.getByRole('button', { name: 'set crumb' })
        await user.click(setCrumbs)

        const newCrumb = await screen.findByText('New Crumb')
        expect(newCrumb).toBeInTheDocument()

        const clearCrumbs = screen.getByRole('button', { name: 'clear crumbs' })
        await user.click(clearCrumbs)

        const temp = screen.queryByText('New Crumb')
        expect(temp).not.toBeInTheDocument()
      })
    })
  })

  describe('when calling set plan updated notification', () => {
    it('adds new notification to context', async () => {
      const { user } = setup()

      render(
        <PlanProvider>
          <TestComponent />
        </PlanProvider>,
        {
          wrapper: wrapper(
            '/plan/gh/codecov/upgrade',
            '/plan/:provider/:owner/upgrade'
          ),
        }
      )

      const button = screen.getByRole('button', {
        name: 'set plan updated notification',
      })
      await user.click(button)

      const newNotificationTitle = screen.getByText('Alert option is success')
      expect(newNotificationTitle).toBeInTheDocument()
    })
    it('clears out notification on page refresh', async () => {
      const { user } = setup()

      render(
        <PlanProvider>
          <TestComponent />
        </PlanProvider>,
        {
          wrapper: wrapper('/plan/gh/codecov', '/plan/:provider/:owner'),
        }
      )

      const button = screen.getByRole('button', {
        name: 'set plan updated notification',
      })
      await user.click(button)

      const link = screen.getByRole('link', { name: 'refresh' })
      await user.click(link)

      const newNotificationDescription = screen.queryByText(
        'Alert option is success'
      )
      expect(newNotificationDescription).not.toBeInTheDocument()
    })
  })
})
