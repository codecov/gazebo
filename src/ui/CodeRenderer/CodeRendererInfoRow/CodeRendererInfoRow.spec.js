import { render, screen } from '@testing-library/react'

import CodeRendererCoverageHeader from './CodeRendererInfoRow'

// This is copypasted, needs some work
xdescribe('CodeRendererCoverageHeader', () => {
  function setup(props) {
    render(<CodeRendererCoverageHeader {...props} />)
  }

  describe('when rendered with without treepaths', () => {
    beforeEach(() => {
      setup({ treePaths: [], fileCoverage: 39.28, change: 34.21 })
    })

    it('renders progress percent and change percent', () => {
      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()
      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()
    })
  })

  describe('when rendered with treepaths', () => {
    beforeEach(() => {
      setup({
        treePaths: [{ pageName: 'owner', text: 'owner' }],
        fileCoverage: 39.28,
        change: 34.21,
      })
    })

    it('renders progress, change and filepath', () => {
      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()
      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()
      const treePath = screen.getByText(/owner/)
      expect(treePath).toBeInTheDocument()
    })
  })
})
