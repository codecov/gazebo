import { render, screen } from '@testing-library/react'

import FilesChanged from './FilesChanged'

jest.mock('./FilesChangedTable', () => () => 'FilesChangedTable')

describe('FilesChanged', () => {
  it('renders commits table', async () => {
    render(<FilesChanged />)

    const table = await screen.findByText('FilesChangedTable')
    expect(table).toBeInTheDocument()
  })
})
