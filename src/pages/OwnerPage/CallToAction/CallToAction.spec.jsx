import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import * as Segment from 'services/tracking/segment'

import CallToAction from './CallToAction'

const trackSegmentSpy = jest.spyOn(Segment, 'trackSegmentEvent')
jest.mock('services/account')
jest.mock('config')

describe('CallToAction', () => {
  let container
  function setup(accountDetails) {
    useAccountDetails.mockReturnValue({
      data: accountDetails,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh/codecov']}>
          <Route path="/:provider/:owner">
            <CallToAction owner="widogast" provider="gh" />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when user is under free trial', () => {
    it('renders "request free trial" text if there are is less than 5 activated users', () => {
      setup({
        activatedUserCount: 2,
        plan: {
          value: 'users-free',
        },
      })
      expect(screen.getByRole('link', { name: /request/i })).toHaveAttribute(
        'href',
        'https://about.codecov.io/trial'
      )
    })

    it('renders upgrade plan today when user has used all seats', () => {
      setup({
        activatedUserCount: 5,
        plan: {
          value: 'users-free',
        },
      })
      expect(screen.getByRole('link', { name: /upgrade/i })).toHaveAttribute(
        'href',
        '/plan/gh/widogast/upgrade'
      )
    })

    it('does not render any trial if user count is outside 0-5 range', () => {
      setup({
        accountDetails: {
          activatedUserCount: 9,
          plan: {
            value: 'users-free',
          },
        },
      })
      expect(screen.queryByText(/Need more than 5 users?/)).toBeNull()
      expect(screen.queryByText(/Request/)).toBeNull()
      expect(screen.queryByText(/free trial/)).toBeNull()

      expect(screen.queryByText(/Looks like you're up to 5 users./)).toBeNull()
      expect(screen.queryByText(/Upgrade/)).toBeNull()
      expect(screen.queryByText(/plan today/)).toBeNull()
    })

    it('sends a tracking event when clicked and users are less than 5', () => {
      setup({
        activatedUserCount: 2,
        plan: {
          value: 'users-free',
        },
      })

      const button = screen.getByRole('link', { name: /request/i })
      userEvent.click(button)
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
    })

    it('sends a tracking event when clicked and users are equal to 5', () => {
      setup({
        activatedUserCount: 5,
        plan: {
          value: 'users-free',
        },
      })

      const button = screen.getByRole('link', { name: /upgrade/i })
      userEvent.click(button)
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('when user is not under free trial', () => {
    it('does not render any trial', () => {
      setup({
        accountDetails: {
          activatedUserCount: 5,
          plan: {
            value: 'not-users-free',
          },
        },
      })
      expect(screen.queryByText(/Need more than 5 users?/)).toBeNull()
      expect(screen.queryByText(/Request/)).toBeNull()
      expect(screen.queryByText(/free trial/)).toBeNull()

      expect(screen.queryByText(/Looks like you're up to 5 users./)).toBeNull()
      expect(screen.queryByText(/Upgrade/)).toBeNull()
      expect(screen.queryByText(/plan today/)).toBeNull()
    })
  })

  describe('when there is an error fetching account details', () => {
    beforeEach(() => {
      setup(null)
    })

    it('does not render the call to action', () => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when built on enterprise', () => {
    beforeAll(() => {
      config.IS_SELF_HOSTED = true
    })
    afterAll(() => {
      jest.clearAllMocks()
    })
    describe('when user is under free trial', () => {
      it('does not render a free trial CTA', () => {
        setup({
          activatedUserCount: 2,
          plan: {
            value: 'users-free',
          },
        })
        expect(
          screen.queryByRole('link', { name: /request/i })
        ).not.toBeInTheDocument()
      })

      it('does not prompt user to upgrade', () => {
        setup({
          activatedUserCount: 5,
          plan: {
            value: 'users-free',
          },
        })
        expect(
          screen.queryByRole('link', { name: /upgrade/i })
        ).not.toBeInTheDocument()
      })
    })
  })
})
