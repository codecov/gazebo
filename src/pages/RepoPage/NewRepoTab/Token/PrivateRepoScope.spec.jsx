import { render, screen } from '@testing-library/react'

import PrivateRepoScope from './PrivateRepoScope'

describe('PrivateRepoScope', () => {
  function setup(props) {
    render(<PrivateRepoScope {...props} />)
  }
  describe('renders', () => {
    beforeEach(() => {
      setup({ token: 'mytoken' })
    })
    it('with a token', () => {
      expect(screen.getByText(/mytoken/, { exact: false })).toBeInTheDocument()
    })
  })
})
