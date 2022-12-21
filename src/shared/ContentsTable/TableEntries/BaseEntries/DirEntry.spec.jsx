import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import DirEntry from './DirEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

describe('DirEntry', () => {
  const runPrefetchMock = jest.fn()

  function setup() {
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
          <DirEntry
            linkRef="branch"
            name="dir"
            path="path/to/directory"
            runPrefetch={runPrefetchMock}
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
