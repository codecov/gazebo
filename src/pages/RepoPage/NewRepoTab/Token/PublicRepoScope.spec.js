import { render, screen } from '@testing-library/react'

import PublicRepoScope from './PublicRepoScope'

describe('PublicRepoScope', () => {
  function setup(props) {
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
  })
})
