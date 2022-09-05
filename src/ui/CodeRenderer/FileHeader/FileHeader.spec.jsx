import { render, screen } from '@testing-library/react'

import FileHeader from './FileHeader'

jest.mock('ui/CopyClipboard', () => () => 'Copy Clipboard')

describe('FileHeader', () => {
  function setup(props) {
    render(<FileHeader {...props} />)
  }

  describe('when provided with all props', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
        coverage: [
          { label: 'HEAD', value: 12.34 },
          { label: 'Patch', value: 23.45 },
          { label: 'Change', value: 34.56 },
        ],
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
        coverage: [],
      })
    })

    it('renders progress percent and change percent', () => {
      expect(screen.queryByText('HEAD')).not.toBeInTheDocument()
      expect(screen.queryByText('Patch')).not.toBeInTheDocument()
      expect(screen.queryByText('Change')).not.toBeInTheDocument()
    })
  })

  describe('with file label', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
        fileLabel: 'New',
      })
    })

    it('renders a file status label', () => {
      expect(screen.getByText(/New/)).toBeInTheDocument()
    })
  })

  describe('without file label', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
      })
    })

    it('does not render a file status label if no fileLabel is passed', () => {
      expect(screen.queryByText(/New/)).not.toBeInTheDocument()
    })
  })
})
