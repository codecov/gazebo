import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import BranchDirEntry from './BranchDirEntry'

const mockRunPrefetch = vi.hoisted(() => vi.fn())

vi.mock('services/pathContents/branch/dir', () => ({
  usePrefetchBranchDirEntry: vi
    .fn()
    .mockReturnValue({ runPrefetch: mockRunPrefetch }),
}))

const wrapper: (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren> =
  (initialEntries = ['/gh/codecov/test-repo/tree/main/src/']) =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
        {children}
      </Route>
    </MemoryRouter>
  )

describe('BranchDirEntry', () => {
  function setup() {
    return { user: userEvent.setup() }
  }

  it('displays the directory name', async () => {
    setup()
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const dir = await screen.findByText('dir')
    expect(dir).toBeInTheDocument()
  })

  it('sets the correct href', async () => {
    setup()
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const a = await screen.findByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir'
    )
  })

  describe('flags filter is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchDirEntry
          branch="branch"
          name="dir"
          urlPath="path/to/directory"
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/tree/main/src?flags%5B0%5D=flag-1',
          ]),
        }
      )
      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('components and flags filters is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchDirEntry
          branch="branch"
          name="dir"
          urlPath="path/to/directory"
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/tree/main/src?flags%5B0%5D=flag-1&components%5B0%5D=component-1',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir?flags%5B0%5D=flag-1&components%5B0%5D=component-1'
      )
    })
  })

  it('fires the prefetch function on hover', async () => {
    const { user } = setup()

    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const dir = await screen.findByText('dir')

    expect(mockRunPrefetch).not.toHaveBeenCalled()

    await user.hover(dir)

    expect(mockRunPrefetch).toHaveBeenCalled()
  })
})
