import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import InfoMessageStripeCallback from './InfoMessageStripeCallback'

describe('InfoMessageStripeCallback', () => {
  let wrapper
  function setup(url) {
    wrapper = render(<InfoMessageStripeCallback />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
      ),
    })
  }

  describe('when rendering without success or cancel in the url', () => {
    beforeEach(() => {
      setup('/account/gh/codecov')
    })

    it('doesnt render anything', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when rendering with success in the url', () => {
    beforeEach(() => {
      setup('/account/gh/codecov?success')
    })

    it('renders a success message', () => {
      expect(
        screen.getByText(/Subscription Update Successful/)
      ).toBeInTheDocument()
    })
  })

  describe('when rendering with cancel in the url', () => {
    beforeEach(() => {
      setup('/account/gh/codecov?cancel')
    })

    it('renders a cancel message', () => {
      expect(screen.getByText(/Subscription Update Failed/)).toBeInTheDocument()
    })
  })
})
