import { render, screen } from '@testing-library/react'

import IndirectChangesTab from './IndirectChangesTab'

jest.mock(
  './IndirectChangesTable/IndirectChangesTable',
  () => () => 'IndirectChangesTable'
)
jest.mock('../ComponentsSelector', () => () => 'Components Selector')

describe('IndirectChangesTab', () => {
  it('renders commits table', async () => {
    render(<IndirectChangesTab />)

    const table = await screen.findByText('IndirectChangesTable')
    expect(table).toBeInTheDocument()
  })
})
