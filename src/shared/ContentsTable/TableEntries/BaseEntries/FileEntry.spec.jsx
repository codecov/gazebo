import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import FileEntry from './FileEntry'

import { displayTypeParameter } from '../../constants'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
    <Route path="/:provider/:owner/:repo/">{children}</Route>
  </MemoryRouter>
)

describe('FileEntry', () => {
  const runPrefetchMock = jest.fn()

  describe('checking properties on list display', () => {
    it('displays the file path', () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    it('displays the file name', () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('does not display the file name', () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      expect(screen.queryByText('dir/file.js')).not.toBeInTheDocument()
    })
  })

  describe('file is a critical file', () => {
    it('displays critical file label', () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={true}
          displayType={displayTypeParameter.list}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      expect(screen.getByText('Critical File')).toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    it('displays the file path label', () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    it('fires the prefetch function on hover', async () => {
      render(
        <FileEntry
          linkRef="main"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      userEvent.hover(screen.getByText('file.js'))

      await waitFor(() => expect(runPrefetchMock).toHaveBeenCalled())
    })
  })

  describe('passed pageName and commit props', () => {
    it('sets the correct href', () => {
      render(
        <FileEntry
          commitSha="coolCommitSha"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
          runPrefetch={runPrefetchMock}
          pageName="commitFileView"
        />,
        { wrapper }
      )

      const fileEntry = screen.getByRole('link')
      expect(fileEntry).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/coolCommitSha/blob/dir/file.js'
      )
    })
  })
})
