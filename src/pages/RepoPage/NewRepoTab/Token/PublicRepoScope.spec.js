import { render, screen } from '@testing-library/react'

import { useUser } from 'services/user'

import PublicRepoScope from './PublicRepoScope'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'Loquacious Seelie',
    trackingMetadata: {
      ownerid: 98765,
    },
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
        screen.getByText(/public project/, { exact: false })
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
})
