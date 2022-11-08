import { render, screen } from '@testing-library/react'

import ActivationInfo from './ActivationInfo'

jest.mock('./ActivationCount', () => () => 'ActivationCount')
jest.mock('./AutoActivateMembers', () => () => 'AutoActivateMembers')

describe('ActivationInfo', () => {
  function setup() {
    render(<ActivationInfo />)
  }

  describe('rendering the component', () => {
    beforeEach(() => {
      setup()
    })

    it('renders ActivationCount', async () => {
      const page = await screen.findByText(/ActivationCount/)
      expect(page).toBeInTheDocument()
    })

    it('renders AutoActivateMembers', async () => {
      const page = await screen.findByText(/AutoActivateMembers/)
      expect(page).toBeInTheDocument()
    })
  })
})
