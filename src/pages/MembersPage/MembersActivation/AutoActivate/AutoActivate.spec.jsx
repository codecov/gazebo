import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useAutoActivate } from 'services/account'

import AutoActivate from './AutoActivate'

jest.mock('services/account')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const updateAccountMutate = jest.fn()
const updateAccount = {
  mutate: updateAccountMutate,
}
describe('Auto Activate', () => {
  function setup({ planAutoActivate }) {
    const user = userEvent.setup()
    useAutoActivate.mockReturnValue(updateAccount)

    render(<AutoActivate planAutoActivate={planAutoActivate} />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    })

    return { user }
  }

  describe('Auto Activate Toggle', () => {
    describe('Set To False', () => {
      it('Displays toggle default state set to false', async () => {
        const { user } = setup({ planAutoActivate: false })
        const toggle = screen.getByText(/Auto-activate members/)
        await user.click(toggle)
        expect(screen.getByText('x.svg')).toBeInTheDocument()
      })

      it('Triggers change', async () => {
        const { user } = setup({ planAutoActivate: false })
        const toggle = screen.getByText(/Auto-activate members/)
        await user.click(toggle)
        await waitFor(() => expect(updateAccountMutate).toHaveBeenCalled())
      })
    })

    describe('Set To True', () => {
      it('Displays toggle default state set to true', async () => {
        const { user } = setup({ planAutoActivate: true })
        const toggle = screen.getByText(/Auto-activate members/)
        await user.click(toggle)
        expect(screen.getByText('check.svg')).toBeInTheDocument()
      })

      it('Triggers change', async () => {
        const { user } = setup({ planAutoActivate: true })
        const toggle = screen.getByText(/Auto-activate members/)
        await user.click(toggle)
        await waitFor(() => expect(updateAccountMutate).toHaveBeenCalled())
      })
    })
  })
})
