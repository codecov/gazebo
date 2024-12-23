import { render, screen } from '@testing-library/react'

import ActivationInfo from './ActivationInfo'

vi.mock('./ActivationCount/ActivationCount', () => ({
  default: () => 'ActivationCount',
}))
vi.mock('./AutoActivateMembers/AutoActivateMembers', () => ({
  default: () => 'AutoActivateMembers',
}))

describe('ActivationInfo', () => {
  describe('rendering the component', () => {
    it('renders ActivationCount', async () => {
      render(<ActivationInfo />)

      const page = await screen.findByText(/ActivationCount/)
      expect(page).toBeInTheDocument()
    })

    it('renders AutoActivateMembers', async () => {
      render(<ActivationInfo />)

      const page = await screen.findByText(/AutoActivateMembers/)
      expect(page).toBeInTheDocument()
    })
  })
})
