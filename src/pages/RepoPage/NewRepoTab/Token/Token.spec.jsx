import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as Segment from 'services/tracking/segment'
import { useUser } from 'services/user'

import Token from './Token'

jest.mock('services/user')
const trackSegmentSpy = jest.spyOn(Segment, 'trackSegmentEvent')

const loggedInUser = {
  user: {
    username: 'Laerryn Coramar-Seelie',
    trackingMetadata: {
      ownerid: 4,
    },
  },
}

describe('Token', () => {
  function setup(props) {
    useUser.mockReturnValue({ data: loggedInUser })
    render(<Token {...props} />)
  }
  describe('private scope', () => {
    beforeEach(() => {
      setup({ uploadToken: 'mytoken', privateRepo: true })
    })
    it('with a token', () => {
      expect(screen.getByText(/mytoken/, { exact: false })).toBeInTheDocument()
    })
  })

  describe('public scope', () => {
    it('user is part of org', () => {
      setup({
        uploadToken: 'mytoken',
        privateRepo: false,
        isCurrentUserPartOfOrg: true,
      })

      expect(screen.getByText(/mytoken/)).toBeInTheDocument()
    })

    it('user is not part of the org', () => {
      setup({
        uploadToken: 'mytoken',
        privateRepo: false,
        isCurrentUserPartOfOrg: false,
      })

      expect(screen.queryByText(/mytoken/)).not.toBeInTheDocument()
    })
  })

  describe('when user clicks on copy token', () => {
    beforeEach(() => {
      setup({
        uploadToken: '0414a776-c670-4fc2-b04d-eeedc0d665c0',
        isCurrentUserPartOfOrg: true,
        privateRepo: false,
      })
      userEvent.click(screen.getByTestId('clipboard'))
    })

    it('calls the trackSegmentEvent', () => {
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
      expect(trackSegmentSpy).toHaveBeenCalledWith({
        event: 'User Onboarding Copied CI Token',
        data: {
          category: 'Onboarding',
          tokenHash: 'c0d665c0',
        },
      })
    })
  })
})
