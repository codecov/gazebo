import { render, screen } from '@testing-library/react'

import CommitBundleAnalysis from './CommitBundleAnalysis'

jest.mock('./CommitBundleAnalysisTable', () => () => (
  <div>CommitBundleAnalysisTable</div>
))

describe('CommitBundleAnalysis', () => {
  it('displays the CommitBundleAnalysisTable', async () => {
    render(<CommitBundleAnalysis />)

    const table = await screen.findByText('CommitBundleAnalysisTable')
    expect(table).toBeInTheDocument()
  })
})
