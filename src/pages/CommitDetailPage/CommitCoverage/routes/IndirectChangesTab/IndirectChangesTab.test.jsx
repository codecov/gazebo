import { render, screen } from '@testing-library/react'

import IndirectChangesTab from './IndirectChangesTab'

vi.mock('./IndirectChangesTable/IndirectChangesTable', () => ({
  default: () => 'IndirectChangesTable',
}))
vi.mock('../ComponentsSelector', () => ({
  default: () => 'Components Selector',
}))

describe('IndirectChangesTab', () => {
  it('renders commits table', async () => {
    render(<IndirectChangesTab />)

    const table = await screen.findByText(/IndirectChangesTable/)
    expect(table).toBeInTheDocument()
  })
})
