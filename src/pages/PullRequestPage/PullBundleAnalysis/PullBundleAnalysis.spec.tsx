import { render, screen } from '@testing-library/react'

import PullBundleAnalysis from './PullBundleAnalysis'

jest.mock('./PullBundleAnalysisTable', () => () => (
  <div>PullBundleAnalysisTable</div>
))

describe('PullBundleAnalysis', () => {
  it('displays the PullBundleAnalysisTable', async () => {
    render(<PullBundleAnalysis />)

    const table = await screen.findByText('PullBundleAnalysisTable')
    expect(table).toBeInTheDocument()
  })
})
