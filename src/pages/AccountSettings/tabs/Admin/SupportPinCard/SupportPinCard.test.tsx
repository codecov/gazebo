import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAddNotification } from 'services/toastNotification/context'
import { useRegenerateSupportPin, useUser } from 'services/user'

import SupportPinCard from './SupportPinCard'

vi.mock('services/toastNotification/context')
vi.mock('services/user', async () => {
  const actual = await vi.importActual('services/user')
  return {
    ...actual,
    useUser: vi.fn(),
    useRegenerateSupportPin: vi.fn(),
  }
})

const mockedUseUser = vi.mocked(useUser)
const mockedUseRegenerateSupportPin = vi.mocked(useRegenerateSupportPin)
const mockedUseAddNotification = vi.mocked(useAddNotification)

describe('SupportPinCard', () => {
  function setup({ supportPin = '111111' } = {}) {
    const user = userEvent.setup()
    const addNotification = vi.fn()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)

    mockedUseAddNotification.mockReturnValue(addNotification)
    mockedUseUser.mockReturnValue({ data: { supportPin } } as ReturnType<
      typeof useUser
    >)
    mockedUseRegenerateSupportPin.mockImplementation(((
      props: { onSuccess?: (data: unknown) => void } = {}
    ) => ({
      mutateAsync: async () => {
        const res = await mutateAsync()
        props.onSuccess?.(undefined)
        return res
      },
      isLoading: false,
    })) as unknown as typeof useRegenerateSupportPin)

    return { addNotification, mutateAsync, user }
  }

  it('renders the current support pin', () => {
    setup({ supportPin: '111111' })
    render(<SupportPinCard />)

    const pin = screen.getByTestId('support-pin-value')
    expect(pin).toHaveTextContent('111111')
  })

  it('opens the confirmation modal when clicking regenerate', async () => {
    const { user } = setup()
    render(<SupportPinCard />)

    const button = screen.getByRole('button', { name: /regenerate/i })
    await user.click(button)

    const modalHeading = await screen.findByText(
      /are you sure you want to regenerate your support pin/i
    )
    expect(modalHeading).toBeInTheDocument()
  })

  it('regenerates the pin and shows a success notification', async () => {
    const { addNotification, mutateAsync, user } = setup()
    render(<SupportPinCard />)

    const button = screen.getByRole('button', { name: /regenerate/i })
    await user.click(button)

    const confirm = await screen.findByRole('button', {
      name: /generate new pin/i,
    })
    await user.click(confirm)

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled())
    await waitFor(() =>
      expect(addNotification).toHaveBeenCalledWith({
        type: 'success',
        text: 'Support PIN successfully regenerated',
      })
    )
  })
})
