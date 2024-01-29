import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { ComparisonReturnType } from 'shared/utils/comparison'

import ErrorBanner from './ErrorBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/codecov`]}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ErrorBanner Card', () => {
  describe('when rendered with missing base commit', () => {
    it('renders header', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />,
        { wrapper }
      )

      const header = screen.getByText('Missing Base Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />,
        { wrapper }
      )

      const errorMsg = screen.getByText(
        'Unable to compare commit because no base commit was found.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_COMMIT} />,
        { wrapper }
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing head commit', () => {
    it('renders header', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />,
        { wrapper }
      )

      const header = screen.getByText('Missing Head Commit')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />,
        { wrapper }
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the head commit of the commit is not found.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_COMMIT} />,
        { wrapper }
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing base report', () => {
    it('renders header', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />,
        { wrapper }
      )

      const header = screen.getByText('Missing Base Report')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />,
        { wrapper }
      )

      const errorMsg = screen.getByText(
        'Unable to compare commit because the commit did not upload a coverage report.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_BASE_REPORT} />,
        { wrapper }
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing head report', () => {
    it('renders header', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />,
        { wrapper }
      )

      const header = screen.getByText('Missing Head Report')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />,
        { wrapper }
      )

      const errorMsg = screen.getByText(
        'Unable to compare commits because the head of the commit request did not upload a coverage report.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_HEAD_REPORT} />,
        { wrapper }
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing a comparison', () => {
    it('renders header', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />,
        { wrapper }
      )

      const header = screen.getByText('Missing Comparison')
      expect(header).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />,
        { wrapper }
      )

      const errorMsg = screen.getByText(
        'There was an error computing the comparison for the head and base commits.'
      )
      expect(errorMsg).toBeInTheDocument()
    })

    it('renders troubleshoot link', () => {
      render(
        <ErrorBanner errorType={ComparisonReturnType.MISSING_COMPARISON} />,
        { wrapper }
      )

      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with unknown error', () => {
    it('does not render text content', () => {
      // @ts-expect-error testing to ensure that the component can handle unknown error types
      render(<ErrorBanner errorType="unknown error" />, { wrapper })

      const header = screen.queryByText(/Missing/)
      expect(header).not.toBeInTheDocument()
    })
  })
})
