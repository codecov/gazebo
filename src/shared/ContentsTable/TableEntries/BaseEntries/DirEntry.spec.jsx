import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import DirEntry from './DirEntry'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
    <Route path="/:provider/:owner/:repo/">{children}</Route>
  </MemoryRouter>
)

describe('DirEntry', () => {
  it('displays the directory name', () => {
    const runPrefetchMock = jest.fn()
    render(
      <DirEntry
        linkRef="branch"
        name="dir"
        urlPath="path/to/directory"
        runPrefetch={runPrefetchMock}
      />,
      { wrapper }
    )

    const dir = screen.getByText('dir')
    expect(dir).toBeInTheDocument()
  })

  describe('path is given', () => {
    it('sets the correct href', () => {
      const runPrefetchMock = jest.fn()
      render(
        <DirEntry
          linkRef="branch"
          name="dir"
          urlPath="path/to/directory"
          runPrefetch={runPrefetchMock}
        />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir'
      )
    })
  })

  describe('no path is given', () => {
    it('sets the correct href', () => {
      const runPrefetchMock = jest.fn()
      render(
        <DirEntry linkRef="branch" name="dir" runPrefetch={runPrefetchMock} />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute('href', '/gh/codecov/test-repo/tree/branch/dir')
    })
  })

  describe('query params value is passed', () => {
    it('sets the correct href', () => {
      const runPrefetchMock = jest.fn()
      render(
        <DirEntry
          linkRef="branch"
          name="dir"
          runPrefetch={runPrefetchMock}
          queryParams={{ flags: ['flag-1'] }}
        />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/dir?flags%5B0%5D=flag-1'
      )
    })
  })

  it('fires the prefetch function on hover', async () => {
    const user = userEvent.setup()
    const runPrefetchMock = jest.fn()
    render(
      <DirEntry
        linkRef="branch"
        name="dir"
        urlPath="path/to/directory"
        runPrefetch={runPrefetchMock}
      />,
      { wrapper }
    )

    await user.hover(screen.getByText('dir'))

    await waitFor(() => expect(runPrefetchMock).toHaveBeenCalled())
  })

  describe('pageName prop is passed', () => {
    it('sets the correct href', () => {
      const runPrefetchMock = jest.fn()
      render(
        <DirEntry
          commitSha="coolCommitSha"
          name="dir"
          urlPath="path/to/directory"
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
