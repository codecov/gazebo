import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CancelPlanPage from './CancelPlanPage'

jest.mock('./subRoutes/SpecialOffer', () => () => 'SpecialOffer')
jest.mock('./subRoutes/DowngradePlan', () => () => 'DowngradePlan')

let testLocation
const wrapper =
  (initialEntries = '') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider/:owner">{children}</Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )

describe('CancelPlanPage', () => {
  describe('testing routes', () => {
    describe('on root cancel path', () => {
      it('renders cancel plan', async () => {
        render(<CancelPlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/cancel'),
        })

        const specialOffer = await screen.findByText('SpecialOffer')
        expect(specialOffer).toBeInTheDocument()
      })
    })

    describe('on downgrade path', () => {
      it('renders downgrade plan', async () => {
        render(<CancelPlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/cancel/downgrade'),
        })

        const downgrade = await screen.findByText('DowngradePlan')
        expect(downgrade).toBeInTheDocument()
      })
    })

    describe('on random path', () => {
      it('redirects to root cancel plan', async () => {
        render(<CancelPlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/cancel/blah'),
        })

        expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel')

        const specialOffer = await screen.findByText('SpecialOffer')
        expect(specialOffer).toBeInTheDocument()
      })
    })
  })
})
