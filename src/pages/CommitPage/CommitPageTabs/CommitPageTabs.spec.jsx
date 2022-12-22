import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitPageTabs from './CommitPageTabs'

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/commit/sha256']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route
          path={[
            '/:provider/:owner/:repo/commit/:commit',
            '/:provider/:owner/:repo/commit/:commitSha/tree',
            '/:provider/:owner/:repo/commit/:commitSha/tree/:path+',
            '/:provider/:owner/:repo/:commit/:commitSha/blob/:path+',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    )

describe('CommitPageTabs', () => {
  describe('on base route', () => {
    it('highlights impacted files tab', () => {
      render(<CommitPageTabs commitSHA="sha256" />, { wrapper: wrapper() })

      const impactedFiles = screen.getByText('Impacted Files')
      expect(impactedFiles).toBeInTheDocument()
      expect(impactedFiles).toHaveClass('text-ds-gray-octonary')
    })

    it('does not highlight files tab', () => {
      render(<CommitPageTabs commitSHA="sha256" />, { wrapper: wrapper() })

      const files = screen.getByText('Files')
      expect(files).toBeInTheDocument()
      expect(files).not.toHaveClass('text-ds-gray-octonary')
    })
  })

  describe('on files route', () => {
    describe('on tree route', () => {
      it('highlights files tab', () => {
        render(<CommitPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const files = screen.getByText('Files')
        expect(files).toBeInTheDocument()
        expect(files).toHaveClass('text-ds-gray-octonary')
      })

      it('does not highlight impacted files tab', () => {
        render(<CommitPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const impactedFiles = screen.getByText('Impacted Files')
        expect(impactedFiles).toBeInTheDocument()
        expect(impactedFiles).not.toHaveClass('text-ds-gray-octonary')
      })
    })
    describe('on a blob route', () => {
      it('highlights files tab', () => {
        render(<CommitPageTabs commitSHA="sha256" />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/blob/index.js',
          ]),
        })

        const files = screen.getByText('Files')
        expect(files).toBeInTheDocument()
        expect(files).toHaveClass('text-ds-gray-octonary')
      })

      it('does not highlight impacted files tab', () => {
        render(<CommitPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const impactedFiles = screen.getByText('Impacted Files')
        expect(impactedFiles).toBeInTheDocument()
        expect(impactedFiles).not.toHaveClass('text-ds-gray-octonary')
      })
    })
  })
})
