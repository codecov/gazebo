import { render, screen } from '@testing-library/react'

import AdminMembers from './AdminMembers'

vi.mock('./ActivationInfo', () => ({ default: () => 'ActivationInfo' }))
vi.mock('./MemberList', () => ({ default: () => 'MemberList' }))

describe('AdminMembers', () => {
  describe('rendering the component', () => {
    it('renders header', async () => {
      render(<AdminMembers />)

      const text = await screen.findByText('Account Members')
      expect(text).toBeInTheDocument()
    })

    it('renders ActivationInfo', async () => {
      render(<AdminMembers />)

      const text = await screen.findByText(/ActivationInfo/)
      expect(text).toBeInTheDocument()
    })

    it('renders MemberList', async () => {
      render(<AdminMembers />)

      const text = await screen.findByText(/MemberList/)
      expect(text).toBeInTheDocument()
    })
  })
})
