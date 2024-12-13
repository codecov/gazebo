import { render, screen } from '@testing-library/react'

import MergeStep from './MergeStep'

vi.mock('config')

describe('MergeStep', () => {
  it('renders body', async () => {
    render(<MergeStep stepNum={4} />)

    const body = await screen.findByText(/Once merged to your default branch,/)
    expect(body).toBeInTheDocument()
  })
})
