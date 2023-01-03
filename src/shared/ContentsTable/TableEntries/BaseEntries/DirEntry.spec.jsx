import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import DirEntry from './DirEntry'

const wrapper =
  (initialEntries = ['/gh/codecov/test-repo']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/">{children}</Route>
      </MemoryRouter>
    )

describe('DirEntry', () => {
  const runPrefetchMock = jest.fn()

  it('displays the directory name', () => {
    render(
      <DirEntry
        linkRef="branch"
        name="dir"
        path="path/to/directory"
        runPrefetch={runPrefetchMock}
      />,
      { wrapper: wrapper() }
    )

    const dir = screen.getByText('dir')
    expect(dir).toBeInTheDocument()
  })

  describe('path is given', () => {
    it('sets the correct href', () => {
      render(
        <DirEntry
          linkRef="branch"
          name="dir"
          path="path/to/directory"
          runPrefetch={runPrefetchMock}
        />,
        { wrapper: wrapper() }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path/to/directory/dir'
      )
    })
  })

  describe('no path is given', () => {
    it('sets the correct href', () => {
      render(
        <DirEntry linkRef="branch" name="dir" runPrefetch={runPrefetchMock} />,
        { wrapper: wrapper() }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute('href', '/gh/codecov/test-repo/tree/branch/dir')
    })
  })

  it('fires the prefetch function on hover', async () => {
    render(
      <DirEntry
        linkRef="branch"
        name="dir"
        path="path/to/directory"
        runPrefetch={runPrefetchMock}
      />,
      { wrapper: wrapper() }
    )

    userEvent.hover(screen.getByText('dir'))

    await waitFor(() => expect(runPrefetchMock).toHaveBeenCalled())
  })

  describe('pageName prop is passed', () => {
    it('sets the correct href', () => {
      render(
        <DirEntry
          commitSha="coolCommitSha"
          name="dir"
          path="path/to/directory"
          runPrefetch={runPrefetchMock}
          pageName="commitTreeView"
        />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/coolCommitSha/tree/path/to/directory/dir'
      )
    })
  })
})
