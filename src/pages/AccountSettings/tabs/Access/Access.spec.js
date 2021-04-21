import Access from './Access'
import { render, screen } from '@testing-library/react'
import { useSessions } from 'services/access'

jest.mock('services/access')

describe('AccessTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup(props) {
    useSessions.mockReturnValue({
      data: {
        sessions: [],
      },
    })
    const _props = { ...defaultProps, ...props }
    render(<Access {..._props} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders elements', () => {
      it('renders title', () => {
        const title = screen.getByText(/API Tokens/)
        expect(title).toBeInTheDocument()
      })
      it('renders button', () => {
        const button = screen.getByText(/Generate Token/)
        expect(button).toBeInTheDocument()
      })
      it('renders sessions title', () => {
        const sessionsTitle = screen.getByText(/Login Sessions/)
        expect(sessionsTitle).toBeInTheDocument()
      })
      it('renders tokens summary', () => {
        expect(screen.getByTestId('tokens-summary')).toBeInTheDocument()
      })
      it('renders tokens docs link', () => {
        expect(screen.getByTestId('tokens-docs-link')).toBeInTheDocument()
      })
      it('renders no tokens message', () => {
        const sessionsTitle = screen.getByText(/No tokens created yet/)
        expect(sessionsTitle).toBeInTheDocument()
      })
    })
  })
})
