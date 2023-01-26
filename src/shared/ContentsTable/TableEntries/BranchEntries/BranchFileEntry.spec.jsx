import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import BranchFileEntry from './BranchFileEntry'
import { usePrefetchBranchFileEntry } from './hooks/usePrefetchBranchFileEntry'

import { displayTypeParameter } from '../../constants'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

jest.mock('./hooks/usePrefetchBranchFileEntry')

describe('BranchFileEntry', () => {
  const runPrefetchMock = jest.fn()

  function setup({
    isCriticalFile = false,
    displayType = displayTypeParameter.tree,
  }) {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'test-repo',
      branch: 'main',
      path: '',
    })

    usePrefetchBranchFileEntry.mockReturnValue({
      runPrefetch: runPrefetchMock,
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
        <Route path="/:provider/:owner/:repo/">
          <BranchFileEntry
            branch="main"
            path="dir/file.js"
            name="file.js"
            urlPath="dir"
            isCriticalFile={isCriticalFile}
            displayType={displayType}
          />
        </Route>
      </MemoryRouter>
    )
  }

  describe('checking properties on list display', () => {
    beforeEach(() => {
      setup({ isCriticalFile: false, displayType: displayTypeParameter.list })
    })

    it('displays the file path', () => {
      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    beforeEach(() => {
      setup({ isCriticalFile: false, displayType: displayTypeParameter.tree })
    })

    it('displays the file name', () => {
      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('does not display the file name', () => {
      expect(screen.queryByText('dir/file.js')).not.toBeInTheDocument()
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

  describe('is displaying a list', () => {
    beforeEach(() => {
      setup({ displayType: 'LIST' })
    })

    it('displays the file path label', () => {
      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    beforeEach(() => {
      setup({ isCriticalFile: false, displayType: displayTypeParameter.tree })
    })

    it('fires the prefetch function on hover', async () => {
      userEvent.hover(screen.getByText('file.js'))

      await waitFor(() => expect(runPrefetchMock).toHaveBeenCalled())
    })
  })
})
