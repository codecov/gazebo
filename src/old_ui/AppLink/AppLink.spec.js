import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppLink from '.'

describe('AppLink', () => {
  function setup(props = {}) {
    render(<AppLink {...props}>Im a link</AppLink>, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ to: 'location' })
    })

    it('renders a AppLink', () => {
      expect(screen.getByRole('link')).not.toBeNull()
    })
  })

  describe('renders a a tag if useRouter is false', () => {
    beforeEach(() => {
      setup({ useRouter: false, to: 'location' })
    })

    it('calls the handler', () => {
      expect(screen.getByRole('link')).toHaveAttribute('href', 'location')
    })
  })
})
