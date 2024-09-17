import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import Checkbox from './Checkbox'

describe('Checkbox', () => {
  it('renders', async () => {
    render(<Checkbox />)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('becomes checked when clicked', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')

    await user.click(checkbox)

    await waitFor(() =>
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    )
  })

  it('can be disabled', async () => {
    render(<Checkbox disabled />)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('disabled')
  })

  it('can have controlled state', async () => {
    render(<Checkbox checked={true} />)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('data-state', 'checked')
  })
})
