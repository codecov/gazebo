import { render, screen } from '@testing-library/react'

import FileHeader from './FileHeader'

vi.mock('ui/CopyClipboard', () => ({ CopyClipboard: () => 'Copy Clipboard' }))

describe('FileHeader', () => {
  function setup(props) {}

  describe('when provided with all props', () => {
    it('renders progress percent and change percent', () => {
      render(
        <FileHeader
          header="-16,7, +16,7"
          headName="folder/file.js"
          coverage={[
            { label: 'HEAD', value: 12.34 },
            { label: 'Patch', value: 23.45 },
            { label: 'Change', value: 34.56 },
          ]}
        />
      )

      const headCoverage = screen.getByText(/12.34%/)
      expect(headCoverage).toBeInTheDocument()

      const patchCoverage = screen.getByText(/23.45%/)
      expect(patchCoverage).toBeInTheDocument()

      const changeCoverage = screen.getByText(/34.56%/)
      expect(changeCoverage).toBeInTheDocument()

      const head = screen.getByText('HEAD')
      expect(head).toBeInTheDocument()

      const patch = screen.getByText('Patch')
      expect(patch).toBeInTheDocument()

      const change = screen.getByText('Change')
      expect(change).toBeInTheDocument()
    })

    it('renders copy clipboard icon', () => {
      render(
        <FileHeader
          header="-16,7, +16,7"
          headName="folder/file.js"
          coverage={[
            { label: 'HEAD', value: 12.34 },
            { label: 'Patch', value: 23.45 },
            { label: 'Change', value: 34.56 },
          ]}
        />
      )

      const copy = screen.getByText('Copy Clipboard')
      expect(copy).toBeInTheDocument()
    })
  })

  describe('when there are no coverage numbers', () => {
    beforeEach(() => {
      setup({
        header: '-16,7, +16,7',
        headName: 'folder/file.js',
        coverage: [],
      })
    })

    it('renders progress percent and change percent', () => {
      render(
        <FileHeader
          header="-16,7, +16,7"
          headName="folder/file.js"
          coverage={[]}
        />
      )

      const head = screen.queryByText('HEAD')
      expect(head).not.toBeInTheDocument()

      const patch = screen.queryByText('Patch')
      expect(patch).not.toBeInTheDocument()

      const change = screen.queryByText('Change')
      expect(change).not.toBeInTheDocument()
    })
  })

  describe('with file label', () => {
    it('renders a file status label', () => {
      render(
        <FileHeader
          header="-16,7, +16,7"
          headName="folder/file.js"
          fileLabel="New"
        />
      )

      const fileLabel = screen.getByText(/New/)
      expect(fileLabel).toBeInTheDocument()
    })
  })

  describe('without file label', () => {
    it('does not render a file status label if no fileLabel is passed', () => {
      render(<FileHeader header="-16,7, +16,7" headName="folder/file.js" />)

      const fileLabel = screen.queryByText(/New/)
      expect(fileLabel).not.toBeInTheDocument()
    })
  })

  describe('without a headName', () => {
    it('does not render the CopyClipboard component', async () => {
      render(<FileHeader header="-16,7, +16,7" />)

      const copy = screen.queryByText('Copy Clipboard')
      expect(copy).not.toBeInTheDocument()
    })
  })
})
