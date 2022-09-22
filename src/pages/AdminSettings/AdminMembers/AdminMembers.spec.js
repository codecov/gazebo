import { render, screen } from '@testing-library/react'

import AdminMembers from './AdminMembers'

jest.mock('./ActivationInfo', () => () => 'ActivationInfo')

describe('AdminMembers', () => {
  function setup() {
    render(<AdminMembers />)
  }

  describe('rendering the component', () => {
    beforeEach(() => {
      setup()
    })

    it('renders header', async () => {
      const text = await screen.findByText('Account Members')
      expect(text).toBeInTheDocument()
    })

    it('renders ActivationInfo', async () => {
      const text = await screen.findByText(/ActivationInfo/)
      expect(text).toBeInTheDocument()
    })
  })
})
