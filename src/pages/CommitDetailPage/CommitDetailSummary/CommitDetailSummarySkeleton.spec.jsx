import { render, screen } from '@testing-library/react'

import CommitDetailSummarySkeleton from './CommitDetailSummarySkeleton'

describe('CommitDetailSummarySkeleton', () => {
  it('has a head field', () => {
    render(<CommitDetailSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })

  it('has a patch field', () => {
    render(<CommitDetailSummarySkeleton />)

    const patch = screen.getByText('Patch')
    expect(patch).toBeInTheDocument()
  })

  it('has a change field', () => {
    render(<CommitDetailSummarySkeleton />)

    const change = screen.getByText('Change')
    expect(change).toBeInTheDocument()
  })

  it('has a source field', () => {
    render(<CommitDetailSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })
})
