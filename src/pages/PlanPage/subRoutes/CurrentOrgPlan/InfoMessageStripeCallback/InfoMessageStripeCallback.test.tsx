import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import InfoMessageStripeCallback from './InfoMessageStripeCallback'

const wrapper =
  (initialEntries = '/gh/codecov'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>{children}</MemoryRouter>
  )

describe('InfoMessageStripeCallback', () => {
  describe('when rendering without success or cancel in the url', () => {
    const { container } = render(
      <InfoMessageStripeCallback
        awaitingInitialPaymentMethodVerification={false}
      />,
      {
        wrapper: wrapper('/account/gh/codecov'),
      }
    )

    it('doesnt render anything', () => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when rendering with success in the url', () => {
    it('renders a success message', async () => {
      render(
        <InfoMessageStripeCallback
          awaitingInitialPaymentMethodVerification={false}
        />,
        {
          wrapper: wrapper('/account/gh/codecov?success'),
        }
      )

      await expect(
        screen.getByText(/Plan successfully updated./)
      ).toBeInTheDocument()
    })
  })

  describe('when awaitingInitialPaymentMethodVerification is true', () => {
    it('does not enders a success message even at ?success', async () => {
      const { container } = render(
        <InfoMessageStripeCallback
          awaitingInitialPaymentMethodVerification={true}
        />,
        {
          wrapper: wrapper('/account/gh/codecov?success'),
        }
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
