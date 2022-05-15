import { render, screen } from '@testing-library/react'

import CodeRendererCoverageHeader from './CodeRendererCoverageHeader'

//TODO: This needs the whole test
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
})
