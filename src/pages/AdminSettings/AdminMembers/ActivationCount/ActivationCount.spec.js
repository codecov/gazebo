import { render, screen } from '@testing-library/react'

import ActivationCount from './ActivationCount'

describe('ActivationCount', () => {
  function setup({ seatsLimit, seatsUsed }) {
    render(<ActivationCount seatsLimit={seatsLimit} seatsUsed={seatsUsed} />)
  }

  describe('it renders component', () => {
    describe('seat limit is not reached', () => {
      beforeEach(() => {
        setup({ seatsLimit: 10, seatsUsed: 5 })
      })
      it('displays seat count', async () => {
        const element = await screen.findByText('5')
        expect(element).toBeInTheDocument()
      })

      it('displays seat limit', async () => {
        const element = await screen.findByText('10')
        expect(element).toBeInTheDocument()
      })
    })

    describe('seat limit is reached', () => {
      beforeEach(() => {
        setup({ seatsLimit: 10, seatsUsed: 10 })
      })

      it('displays info message', async () => {
        const link = await screen.findByText('success@codecov.io')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:success@codecov.io')
      })
    })
  })
})
