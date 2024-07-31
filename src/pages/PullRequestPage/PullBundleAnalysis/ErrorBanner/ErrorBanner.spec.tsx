import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ErrorBanner from './ErrorBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/test-commit']}>
    <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
  </MemoryRouter>
)

describe('ErrorBanner', () => {
  describe('there is a missing base commit error', () => {
    it('renders Missing Base Commit header', () => {
      render(<ErrorBanner errorType="MissingBaseCommit" />, { wrapper })

      const header = screen.getByText('Missing Base Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders Missing Base Commit description', () => {
      render(<ErrorBanner errorType="MissingBaseCommit" />, { wrapper })

      const description = screen.getByText(
        /Unable to compare commit because no base commit was found./
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('there is a missing head commit error', () => {
    it('renders Missing Head Commit header', () => {
      render(<ErrorBanner errorType="MissingHeadCommit" />, { wrapper })

      const header = screen.getByText('Missing Head Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders Missing Head Commit description', () => {
      render(<ErrorBanner errorType="MissingHeadCommit" />, { wrapper })

      const description = screen.getByText(
        /Unable to compare commits because the head commit is not found./
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('there is a missing head report error', () => {
    it('renders Missing Head Report header', () => {
      render(<ErrorBanner errorType="MissingHeadReport" />, { wrapper })

      const header = screen.getByText('Missing Head Report')
      expect(header).toBeInTheDocument()
    })

    it('renders Missing Head Report description', () => {
      render(<ErrorBanner errorType="MissingHeadReport" />, { wrapper })

      const description = screen.getByText(
        /Unable to compare commits because the head commit did not upload a bundle analysis report./
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('there is a missing comparison error', () => {
    it('renders Missing Comparison header', () => {
      render(<ErrorBanner errorType="MissingComparison" />, { wrapper })

      const header = screen.getByText('Missing Comparison')
      expect(header).toBeInTheDocument()
    })

    it('renders Missing Comparison description', () => {
      render(<ErrorBanner errorType="MissingComparison" />, { wrapper })

      const description = screen.getByText(
        /There was an error computing the comparison for the head and base commit./
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('there is a missing base report error', () => {
    it('renders Missing base report header', () => {
      render(<ErrorBanner errorType="MissingBaseReport" />, { wrapper })

      const header = screen.getByText('Missing Base Report')
      expect(header).toBeInTheDocument()
    })

    it('renders Missing base report description', () => {
      render(<ErrorBanner errorType="MissingBaseReport" />, { wrapper })

      const description = screen.getByText(
        /Unable to compare commit because the commit did not upload a bundle analysis report./
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('there is an unknown error', () => {
    it('returns null', () => {
      render(<ErrorBanner errorType="FirstPullRequest" />, { wrapper })

      const header = screen.queryByText(/Missing/)
      expect(header).not.toBeInTheDocument()
    })
  })
})
