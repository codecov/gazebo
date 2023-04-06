import { render, screen } from '@testing-library/react'

import FilesChangedTab from './FilesChangedTab'

jest.mock(
  './FilesChangeTable/FilesChangedTable',
  () => () => 'FilesChangedTable'
)

describe('FilesChangedTab', () => {
  it('renders commits table', async () => {
    render(<FilesChangedTab />)

    const table = await screen.findByText('FilesChangedTable')
    expect(table).toBeInTheDocument()
  })
})
