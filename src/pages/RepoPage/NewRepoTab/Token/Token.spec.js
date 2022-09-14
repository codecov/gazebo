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
        screen.getByText(/Not required if your repo is using GitHub Actions/)
      ).toBeInTheDocument()
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

      expect(
        screen.getByText(/Not required if your repo is using GitHub Actions/, {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(/mytoken/)).toBeInTheDocument()
    })

    it('user is not part of the org', () => {
      setup({
        uploadToken: 'mytoken',
        privateRepo: false,
        isCurrentUserPartOfOrg: false,
      })

      expect(
        screen.getByText(/Not required if your repo is using GitHub Actions/, {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(screen.queryByText(/mytoken/)).not.toBeInTheDocument()
    })
  })
})
