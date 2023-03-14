import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useDeleteSession,
  useGenerateUserToken,
  useRevokeUserToken,
  useSessions,
} from 'services/access'

import Access from './Access'

jest.mock('services/access')

window.confirm = jest.fn(() => true)

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)
describe('AccessTab', () => {
  function setup() {
    useSessions.mockReturnValue({
      data: {
        sessions: [
          {
            sessionid: 32,
            ip: '172.21.0.1',
            lastseen: subDays(new Date(), 3).toISOString(),
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
    useRevokeUserToken.mockReturnValue({})
    useGenerateUserToken.mockReturnValue({})
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders elements', () => {
      it('renders title', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        const title = screen.getByText(/API Tokens/)
        expect(title).toBeInTheDocument()
      })
      it('renders button', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        const button = screen.getByText(/Generate Token/)
        expect(button).toBeInTheDocument()
      })
      it('renders sessions title', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        const sessionsTitle = screen.getByText(/Login Sessions/)
        expect(sessionsTitle).toBeInTheDocument()
      })
      it('renders tokens summary', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        expect(screen.getByTestId('tokens-summary')).toBeInTheDocument()
      })
      it('renders tokens docs link', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        expect(screen.getByTestId('tokens-docs-link')).toBeInTheDocument()
      })
      it('renders no tokens message', () => {
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        const sessionsTitle = screen.getByText(/No tokens created yet/)
        expect(sessionsTitle).toBeInTheDocument()
      })
    })
    describe('on revoke', () => {
      it('triggers confirmation Modal', async () => {
        const user = userEvent.setup()
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        await user.click(screen.getAllByText(/Revoke/)[0])
        expect(window.confirm).toBeCalled()
      })
    })
    describe('on open modal', () => {
      it('opens create token modal', async () => {
        const user = userEvent.setup()
        render(<Access provider="gh" owner="codecov" />, { wrapper })

        await user.click(screen.getByText(/Generate Token/))
        expect(
          screen.getByText('Generate new API access token')
        ).toBeInTheDocument()

        await user.click(screen.getByText(/Cancel/))
        expect(screen.getByText('Generate Token')).toBeInTheDocument()
      })
    })
  })
})
