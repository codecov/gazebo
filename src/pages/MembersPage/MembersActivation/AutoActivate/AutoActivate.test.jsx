import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import AutoActivate from './AutoActivate'

const mocks = vi.hoisted(() => ({
  useAutoActivate: vi.fn(),
}))

vi.mock('services/account/useAutoActivate', async () => {
  const actual = await vi.importActual('services/account/useAutoActivate')
  return {
    ...actual,
    useAutoActivate: mocks.useAutoActivate,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const updateAccountMutate = vi.fn()
const updateAccount = {
  mutate: updateAccountMutate,
}
describe('Auto Activate', () => {
  function setup({ planAutoActivate }) {
    const user = userEvent.setup()
    mocks.useAutoActivate.mockReturnValue(updateAccount)

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

        const x = screen.getByTestId('x')
        expect(x).toBeInTheDocument()
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
        const check = screen.getByTestId('check')
        expect(check).toBeInTheDocument()
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
