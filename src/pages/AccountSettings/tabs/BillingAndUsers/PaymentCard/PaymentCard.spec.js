import { render } from '@testing-library/react'

import PaymentCard from './PaymentCard'

const accountDetails = {
  plan: null,
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

describe('PaymentCard', () => {
  function setup(accountDetails) {
    render(<PaymentCard accountDetails={accountDetails} />)
  }

  describe('when rendering', () => {
    beforeEach(() => {
      setup(accountDetails)
    })

    it('doestn crash', () => {
      setup(accountDetails)
    })
  })
})
