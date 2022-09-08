import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails } from 'services'

import MembersActivation from './MembersActivation'

jest.mock('./AutoActivate/AutoActivate', () => () => 'Auto Activate')
jest.mock('./Activation/Activation', () => () => 'Activation')
jest.mock('services')

const queryClient = new QueryClient()

describe('Members Activation', () => {
  function setup(mockAccountDetails) {
    useAccountDetails.mockReturnValue(mockAccountDetails)
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/members/gh/critical-role']}>
          <Route path="/:provider/:owner/:repo">
            <MembersActivation />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('MemberActivation', () => {
    describe('when plan is autoactivated', () => {
      beforeEach(() => {
        setup({
          data: {
            planAutoActivate: true,
          },
        })
      })

      it('Displays the Activation component', () => {
        expect(screen.getByText(/Activation/)).toBeInTheDocument()
      })

      it('Displays the Auto Activate component', () => {
        expect(screen.getByText(/Auto Activate/)).toBeInTheDocument()
      })
    })

    describe('when plan autoactivation is undefined', () => {
      beforeEach(() => {
        setup({
          data: {
            planAutoActivate: undefined,
          },
        })
      })

      it('Displays the Activation component', () => {
        expect(screen.getByText(/Activation/)).toBeInTheDocument()
      })

      it('Displays the Auto Activate component', () => {
        expect(screen.queryByText(/Auto Activate/)).not.toBeInTheDocument()
      })
    })
  })
})
