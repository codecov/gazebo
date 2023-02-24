import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailPageTabs from './CommitDetailPageTabs'

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/commit/sha256']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route
          path={[
            '/:provider/:owner/:repo/commit/:commit',
            '/:provider/:owner/:repo/commit/:commit/tree',
            '/:provider/:owner/:repo/commit/:commit/tree/:path+',
            '/:provider/:owner/:repo/:commit/:commit/blob/:path+',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    )

describe('CommitDetailPageTabs', () => {
  describe('on base route', () => {
    it('highlights files changed tab', () => {
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const filesChanged = screen.getByText('Files changed')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight files tab', () => {
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const files = screen.getByText('Files')
      expect(files).toBeInTheDocument()
      expect(files).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('on files route', () => {
    describe('on tree route', () => {
      it('highlights files tab', () => {
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const files = screen.getByText('Files')
        expect(files).toBeInTheDocument()
        expect(files).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', () => {
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = screen.getByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })
    describe('on a blob route', () => {
      it('highlights files tab', () => {
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/blob/index.js',
          ]),
        })

        const files = screen.getByText('Files')
        expect(files).toBeInTheDocument()
        expect(files).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', () => {
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = screen.getByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })
})
