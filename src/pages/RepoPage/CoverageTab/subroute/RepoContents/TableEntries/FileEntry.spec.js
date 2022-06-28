import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import FileEntry from './FileEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

describe('FileEntry', () => {
  function setup({ isCriticalFile = false, isSearching = false }) {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'test-repo',
      branch: 'main',
      path: '',
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
        <Route path="/:provider/:owner/:repo/">
          <FileEntry
            branch="main"
            filePath="dir/file.js"
            name="file.js"
            path="dir"
            isCriticalFile={isCriticalFile}
            isSearching={isSearching}
          />
        </Route>
      </MemoryRouter>
    )
  }

  describe('checking properties', () => {
    beforeEach(() => {
      setup({ isCriticalFile: false, isSearching: false })
    })

    it('displays the file name', () => {
      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('sets the correct href', () => {
      expect(screen.getByText('file.js')).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/blobs/main/dir/file.js'
      )
    })
  })

  describe('file is a critical file', () => {
    beforeEach(() => {
      setup({ isCriticalFile: true })
    })

    it('displays critical file label', () => {
      expect(screen.getByText('Critical File')).toBeInTheDocument()
    })
  })

  describe('is searching', () => {
    beforeEach(() => {
      setup({ isSearching: true })
    })

    it('displays the file path label', () => {
      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })
})
