import { render, screen } from '@testing-library/react'

import CommitsTab from './CommitsTab'

jest.mock('./CommitsTable', () => () => 'CommitsTable')

describe('CommitsTab', () => {
  it('renders commits table', async () => {
    render(<CommitsTab />)

    const table = await screen.findByText('CommitsTable')
    expect(table).toBeInTheDocument()
  })
})
