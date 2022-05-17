import { render, screen } from '@testing-library/react'

import CodeRendererCoverageHeader from './CodeRendererCoverageHeader'

jest.mock('ui/CopyClipboard', () => () => 'Copy Clipboard')

//TODO: This needs the whole test
describe('CodeRendererCoverageHeader', () => {
  function setup(props) {
    render(<CodeRendererCoverageHeader {...props} />)
  }

  describe('when provided with all props', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
        headCoverage: 12.34,
        patchCoverage: 23.45,
        changeCoverage: 34.56,
      })
    })

    it('renders progress percent and change percent', () => {
      const headCoverage = screen.getByText(/12.34%/)
      expect(headCoverage).toBeInTheDocument()
      const patchCoverage = screen.getByText(/23.45%/)
      expect(patchCoverage).toBeInTheDocument()
      const changeCoverage = screen.getByText(/34.56%/)
      expect(changeCoverage).toBeInTheDocument()

      expect(screen.getByText('HEAD')).toBeInTheDocument()
      expect(screen.getByText('Patch')).toBeInTheDocument()
      expect(screen.getByText('Change')).toBeInTheDocument()
    })

    it('renders copy clipboard icon', () => {
      expect(screen.getByText('Copy Clipboard')).toBeInTheDocument()
    })
  })

  describe('when there arent any coverage numbers', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
        headCoverage: null,
        patchCoverage: null,
        changeCoverage: null,
      })
    })

    it('renders progress percent and change percent', () => {
      expect(screen.queryByText('HEAD')).not.toBeInTheDocument()
      expect(screen.queryByText('Patch')).not.toBeInTheDocument()
      expect(screen.queryByText('Change')).not.toBeInTheDocument()
    })
  })

  // TODO: Add test with renamed/new file
})
