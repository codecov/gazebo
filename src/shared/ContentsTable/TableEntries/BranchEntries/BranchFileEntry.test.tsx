import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchBranchFileEntry } from 'services/pathContents/branch/file'

import BranchFileEntry from './BranchFileEntry'

import { displayTypeParameter } from '../../constants'

const mockRunPrefetch = vi.hoisted(() => vi.fn())

vi.mock('services/pathContents/branch/file', () => ({
  usePrefetchBranchFileEntry: vi
    .fn()
    .mockReturnValue({ runPrefetch: mockRunPrefetch }),
}))

const wrapper: (
  initialEntried?: string[]
) => React.FC<React.PropsWithChildren> =
  (initialEntries = ['/gh/codecov/test-repo/']) =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/:provider/:owner/:repo/">{children}</Route>
    </MemoryRouter>
  )

describe('BranchFileEntry', () => {
  function setup() {
    return { user: userEvent.setup() }
  }

  describe('checking properties on list display', () => {
    it('displays the file path', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    it('displays the file name', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('file.js')
      expect(file).toBeInTheDocument()
    })

    it('does not display the file name', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      const file = screen.queryByText('dir/file.js')
      expect(file).not.toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    it('displays the file path label', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('flags filters is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('flags and components filter is passed', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924'
      )
    })
  })

  describe('prefetches data', () => {
    it('fires the prefetch function on hover', async () => {
      const { user } = setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('file.js')

      expect(mockRunPrefetch).not.toHaveBeenCalled()

      await user.hover(file)

      expect(mockRunPrefetch).toHaveBeenCalled()
    })

    describe('filters arg is passed', () => {
      describe('there are more then zero flag', () => {
        it('calls the request with the flags arg with the provided flag', async () => {
          const { user } = setup()

          render(
            <BranchFileEntry
              branch="main"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              displayType={displayTypeParameter.tree}
            />,
            {
              wrapper: wrapper([
                '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924',
              ]),
            }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() =>
            expect(usePrefetchBranchFileEntry).toHaveBeenCalled()
          )
          await waitFor(() =>
            expect(usePrefetchBranchFileEntry).toHaveBeenCalledWith(
              expect.objectContaining({ flags: ['flag-1'] })
            )
          )
        })
      })

      describe('there are zero flags', () => {
        it('calls the request with the flags arg with an empty array', async () => {
          const { user } = setup()

          render(
            <BranchFileEntry
              branch="main"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              displayType={displayTypeParameter.tree}
            />,
            { wrapper: wrapper() }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() =>
            expect(usePrefetchBranchFileEntry).toHaveBeenCalled()
          )
          await waitFor(() =>
            expect(usePrefetchBranchFileEntry).toHaveBeenCalledWith(
              expect.objectContaining({ flags: [] })
            )
          )
        })
      })
    })
  })
})
