import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as Segment from 'services/tracking/segment'
import { useUser } from 'services/user'

import PublicRepoScope from './PublicRepoScope'

const trackSegmentSpy = jest.spyOn(Segment, 'trackSegmentEvent')

jest.mock('services/user')

const loggedInUser = {
  username: 'Loquacious Seelie',
  trackingMetadata: {
    ownerid: 98765,
  },
}

describe('PublicRepoScope', () => {
  function setup(props) {
    useUser.mockReturnValue({ data: loggedInUser })
    render(<PublicRepoScope {...props} />)
  }
  describe('part of org', () => {
    beforeEach(() => {
      setup({
        token: 'mytoken',
        isCurrentUserPartOfOrg: true,
      })
    })
    it('with a token', () => {
      expect(
        screen.getByText(/project/, { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText(/mytoken/)).toBeInTheDocument()
    })
    it('renders Github Actions link', () => {
      const ghActionsLink = screen.getByRole('link', {
        name: /Github Actions/i,
      })
      expect(ghActionsLink).toBeInTheDocument()
      expect(ghActionsLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/codecov-action#usage'
      )
    })
  })
  describe('not part of org', () => {
    beforeEach(() => {
      setup({
        token: 'mytoken',
        isCurrentUserPartOfOrg: false,
      })
    })
    it('with a token', () => {
      expect(
        screen.getByText(
          /Otherwise, you'll need a token to from the authorized member or admin./,
          { exact: false }
        )
      ).toBeInTheDocument()
    })
    it('renders Github Actions link', () => {
      const ghActionsLink = screen.getByRole('link', {
        name: /Github Actions/i,
      })
      expect(ghActionsLink).toBeInTheDocument()
      expect(ghActionsLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/codecov-action#usage'
      )
    })
  })
  describe('when the user clicks on the uploader link', () => {
    beforeEach(() => {
      setup({
        token: '0414a776-c670-4fc2-b04d-eeedc0d665c0',
        isCurrentUserPartOfOrg: true,
      })
      userEvent.click(screen.getByTestId('clipboard'))
    })

    it('calls the trackSegmentEvent', () => {
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
      expect(trackSegmentSpy).toHaveBeenCalledWith({
        event: 'User Onboarding Copied CI Token',
        data: {
          category: 'Onboarding',
          userId: 98765,
          tokenHash: 'c0d665c0',
        },
      })
    })
  })
})
