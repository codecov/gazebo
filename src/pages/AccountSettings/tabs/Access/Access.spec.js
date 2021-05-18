import Access from './Access'
import { subDays } from 'date-fns'
import { render, screen } from 'custom-testing-library'
import {
  useSessions,
  useDeleteSession,
  useGenerateToken,
} from 'services/access'
import userEvent from '@testing-library/user-event'

jest.mock('services/access')

window.confirm = jest.fn(() => true)

describe('AccessTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup(props) {
    useSessions.mockReturnValue({
      data: {
        sessions: [
          {
            sessionid: 32,
            ip: '172.21.0.1',
            lastseen: subDays(new Date(), 3),
            useragent: 'Chrome/5.0 (Windows; Intel 10)',
            owner: 2,
            type: 'login',
            name: null,
          },
        ],
        tokens: [],
      },
    })
    useDeleteSession.mockReturnValue({})
    useGenerateToken.mockReturnValue({})
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
    describe('on revoke', () => {
      it('tiggers confirmation Modal', () => {
        userEvent.click(screen.getAllByText(/Revoke/)[0])
        expect(window.confirm).toBeCalled()
      })
    })
    describe('on open modal', () => {
      it('opens create token modal', () => {
        userEvent.click(screen.getByText(/Generate Token/))
        expect(
          screen.getByText('Generate new API access token')
        ).toBeInTheDocument()
        userEvent.click(screen.getByText(/Cancel/))
        expect(screen.getByText('Generate Token')).toBeInTheDocument()
      })
    })
  })
})
