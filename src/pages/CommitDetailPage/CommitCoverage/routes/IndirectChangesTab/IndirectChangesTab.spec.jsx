import { render, screen } from '@testing-library/react'

import IndirectChangesTab from './IndirectChangesTab'

jest.mock(
  './IndirectChangesTable/IndirectChangesTable',
  () => () => 'IndirectChangesTable'
)
jest.mock('../ComponentsSelector', () => () => 'Components Selector')
jest.mock(
  '../../../Header/ToggleHeader/ToggleHeader',
  () => () => 'Toggle header'
)

describe('IndirectChangesTab', () => {
  it('renders commits table', async () => {
    render(<IndirectChangesTab />)

    const table = await screen.findByText(/IndirectChangesTable/)
    expect(table).toBeInTheDocument()
  })

  it('renders toggle header', async () => {
    render(<IndirectChangesTab />)

    const header = await screen.findByText(/Toggle header/)
    expect(header).toBeInTheDocument()
  })
})
