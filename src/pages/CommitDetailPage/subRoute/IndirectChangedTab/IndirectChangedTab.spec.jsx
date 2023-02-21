import { render, screen } from '@testing-library/react'

import IndirectChangedTab from './IndirectChangedTab'

jest.mock('./IndirectChangedTable', () => () => 'IndirectChangedTable')

describe('IndirectChangedTab', () => {
  it('renders commits table', async () => {
    render(<IndirectChangedTab />)

    const table = await screen.findByText('IndirectChangedTable')
    expect(table).toBeInTheDocument()
  })
})
