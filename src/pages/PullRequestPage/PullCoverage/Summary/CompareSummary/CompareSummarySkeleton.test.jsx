import { render, screen } from '@testing-library/react'

import CompareSummarySkeleton from './CompareSummarySkeleton'

describe('CompareSummarySkeleton', () => {
  it('has head item', () => {
    render(<CompareSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })

  it('has patch item', () => {
    render(<CompareSummarySkeleton />)

    const head = screen.getByText('Patch')
    expect(head).toBeInTheDocument()
  })

  it('has change item', () => {
    render(<CompareSummarySkeleton />)

    const head = screen.getByText('Change')
    expect(head).toBeInTheDocument()
  })
})
