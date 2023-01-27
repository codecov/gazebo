import { render, screen } from '@testing-library/react'

import CommitSummarySkeleton from './CommitSummarySkeleton'

describe('CommitSummarySkeleton', () => {
  it('has a head field', () => {
    render(<CommitSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })

  it('has a patch field', () => {
    render(<CommitSummarySkeleton />)

    const patch = screen.getByText('Patch')
    expect(patch).toBeInTheDocument()
  })

  it('has a change field', () => {
    render(<CommitSummarySkeleton />)

    const change = screen.getByText('Change')
    expect(change).toBeInTheDocument()
  })

  it('has a source field', () => {
    render(<CommitSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })
})
