import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { ComparisonReturnType } from 'shared/utils/comparison'

import ErrorBanner from './ErrorBanner'

describe('ErrorBanner Card', () => {
  describe('when rendered with missing base commit', () => {
    it('renders header', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const header = screen.getByText('Missing Base Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the base commit of the pull request is not found.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing head commit', () => {
    it('renders header', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const header = screen.getByText('Missing Head Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the head commit of the pull request is not found.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />
          </Route>
        </MemoryRouter>
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing base report', () => {
    it('renders header', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const header = screen.getByText('Missing Base Report')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the base of the pull request did not upload a coverage report.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing head report', () => {
    it('renders header', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const header = screen.getByText('Missing Head Report')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the head of the pull request did not upload a coverage report.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />
          </Route>
        </MemoryRouter>
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing a comparison', () => {
    it('renders header', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />
          </Route>
        </MemoryRouter>
      )

      const header = screen.getByText('Missing Comparison')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />
          </Route>
        </MemoryRouter>
      )

      const errorMsg = screen.getByText(
        'There was an error computing the comparison for the head and base commit.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />
          </Route>
        </MemoryRouter>
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with unknown error', () => {
    it('does not render text content', () => {
      render(
        <MemoryRouter initialEntries={[`/gh/codecov`]}>
          <Route path="/:provider/:owner">
            <ErrorBanner errorType="unknown error" />
          </Route>
        </MemoryRouter>
      )

      const header = screen.queryByText(/Missing/)
      expect(header).not.toBeInTheDocument()
    })
  })
})
