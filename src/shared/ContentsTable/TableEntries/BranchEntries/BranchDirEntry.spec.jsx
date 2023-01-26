import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import BranchDirEntry from './BranchDirEntry'
import { usePrefetchBranchDirEntry } from './hooks/usePrefetchBranchDirEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

jest.mock('./hooks/usePrefetchBranchDirEntry')

describe('BranchDirEntry', () => {
  const runPrefetchMock = jest.fn()

  function setup() {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'test-repo',
      branch: 'main',
      path: '',
    })

    usePrefetchBranchDirEntry.mockReturnValue({
      runPrefetch: runPrefetchMock,
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
        <Route path="/:provider/:owner/:repo/">
          <BranchDirEntry
            branch="branch"
            name="dir"
            urlPath="path/to/directory"
          />
        </Route>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', () => {
    expect(screen.getByText('dir')).toBeInTheDocument()
  })

  it('sets the correct href', () => {
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/tree/branch/path/to/directory/dir'
    )
  })

  it('fires the prefetch function on hover', async () => {
    userEvent.hover(screen.getByText('dir'))

    await waitFor(() => expect(runPrefetchMock).toHaveBeenCalled())
  })
})
