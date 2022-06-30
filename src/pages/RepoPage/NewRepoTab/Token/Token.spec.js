import { render, screen } from '@testing-library/react'

import { useUser } from 'services/user'

import Token from './Token'

const loggedInUser = {
  user: {
    username: 'Zerxus Illerez',
    trackingMetadata: {
      ownerid: 12345,
    },
  },
}

jest.mock('services/user')

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
      expect(
        screen.getByText(
          /Copy the below token and set it in your CI environment variables./
        )
      ).toBeInTheDocument()
      expect(screen.getByText(/mytoken/, { exact: false })).toBeInTheDocument()
    })
  })

  describe('public scope', () => {
    beforeEach(() => {
      setup({
        uploadToken: 'mytoken',
        privateRepo: false,
        isCurrentUserPartOfOrg: true,
      })
    })
    it('with a token', () => {
      expect(
        screen.getByText(/public project/, { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText(/mytoken/)).toBeInTheDocument()
    })
  })
})
