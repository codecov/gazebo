import { render, screen } from '@testing-library/react'

import CommitCoverageSummarySkeleton from './CommitCoverageSummarySkeleton'

describe('CommitCoverageSummarySkeleton', () => {
  it('has a head field', () => {
    render(<CommitCoverageSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })

  it('has a patch field', () => {
    render(<CommitCoverageSummarySkeleton />)

    const patch = screen.getByText('Patch')
    expect(patch).toBeInTheDocument()
  })

  it('has a change field', () => {
    render(<CommitCoverageSummarySkeleton />)

    const change = screen.getByText('Change')
    expect(change).toBeInTheDocument()
  })

  it('has a source field', () => {
    render(<CommitCoverageSummarySkeleton />)

    const head = screen.getByText('HEAD')
    expect(head).toBeInTheDocument()
  })
})
