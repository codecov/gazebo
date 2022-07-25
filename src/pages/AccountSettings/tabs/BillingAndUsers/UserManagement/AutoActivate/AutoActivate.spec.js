import { fireEvent, render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'

import { useAutoActivate } from 'services/account'

import AutoActivate from './AutoActivate'

jest.mock('services/account/hooks')

const queryClient = new QueryClient()

const updateAccountMutate = jest.fn()
const updateAccount = {
  mutate: updateAccountMutate,
}
describe('Auto Activate', () => {
  function setup({ planAutoActivate }) {
    useAutoActivate.mockReturnValue(updateAccount)

    render(<AutoActivate planAutoActivate={planAutoActivate} />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    })
  }

  describe('Auto Activate Toggle', () => {
    describe('Set To False', () => {
      beforeEach(() => {
        setup({ planAutoActivate: false })
      })

      it('Displays toggle default state set to false', async () => {
        const toggle = screen.getByText(/Auto-activate members/)
        fireEvent.click(toggle)
        expect(screen.getByText('x.svg')).toBeInTheDocument()
      })

      it('Triggers change', async () => {
        const toggle = screen.getByText(/Auto-activate members/)
        fireEvent.click(toggle)
        await waitFor(() => expect(updateAccountMutate).toHaveBeenCalled())
      })
    })

    describe('Set To True', () => {
      beforeEach(() => {
        setup({ planAutoActivate: true })
      })

      it('Displays toggle default state set to true', async () => {
        const toggle = screen.getByText(/Auto-activate members/)
        fireEvent.click(toggle)
        expect(screen.getByText('check.svg')).toBeInTheDocument()
      })

      it('Triggers change', async () => {
        const toggle = screen.getByText(/Auto-activate members/)
        fireEvent.click(toggle)
        await waitFor(() => expect(updateAccountMutate).toHaveBeenCalled())
      })
    })
  })
})
