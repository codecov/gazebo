import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import { ComparisonReturnType, ReportUploadType } from 'shared/utils/comparison'

import ComparisonErrorBanner from './ComparisonErrorBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/test-commit']}>
    <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
  </MemoryRouter>
)

describe('ComparisonErrorBanner', () => {
  describe('when errorType is undefined', () => {
    it('does not render banner text', async () => {
      render(<ComparisonErrorBanner reportType={ReportUploadType.COVERAGE} />, {
        wrapper,
      })
      const alert = await screen.findByTestId('comparison-error-banner')
      expect(alert).toBeInTheDocument()
      const title = screen.queryByText('Missing')
      expect(title).not.toBeInTheDocument()
    })
  })

  it('renders missing base commit error', async () => {
    render(
      <ComparisonErrorBanner
        reportType={ReportUploadType.COVERAGE}
        errorType={ComparisonReturnType.MISSING_BASE_COMMIT}
      />,
      { wrapper }
    )

    const title = await screen.findByText('Missing Base Commit')
    expect(title).toBeInTheDocument()
    const description = await screen.findByText(
      'Unable to compare commits because no base commit was found.'
    )
    expect(description).toBeInTheDocument()
  })

  it('renders missing head commit error', async () => {
    render(
      <ComparisonErrorBanner
        reportType={ReportUploadType.COVERAGE}
        errorType={ComparisonReturnType.MISSING_HEAD_COMMIT}
      />,
      { wrapper }
    )

    const title = await screen.findByText('Missing Head Commit')
    expect(title).toBeInTheDocument()
    const description = await screen.findByText(
      'Unable to compare commits because the head commit was not found.'
    )
    expect(description).toBeInTheDocument()
  })

  it('renders missing comparison error', async () => {
    render(
      <ComparisonErrorBanner
        reportType={ReportUploadType.COVERAGE}
        errorType={ComparisonReturnType.MISSING_COMPARISON}
      />,
      { wrapper }
    )

    const title = await screen.findByText('Missing Comparison')
    expect(title).toBeInTheDocument()
    const description = await screen.findByText(
      'There was an error computing the comparison for the head and base commits.'
    )
    expect(description).toBeInTheDocument()
  })

  describe('missing head report error', () => {
    it('renders coverage report error', async () => {
      render(
        <ComparisonErrorBanner
          reportType={ReportUploadType.COVERAGE}
          errorType={ComparisonReturnType.MISSING_HEAD_REPORT}
        />,
        { wrapper }
      )

      const title = await screen.findByText('Missing Head Report')
      expect(title).toBeInTheDocument()
      const description = await screen.findByText(
        'Unable to compare commits because the head commit did not upload a coverage report.'
      )
      expect(description).toBeInTheDocument()
    })

    it('renders bundle analysis report error', async () => {
      render(
        <ComparisonErrorBanner
          reportType={ReportUploadType.BUNDLE_ANALYSIS}
          errorType={ComparisonReturnType.MISSING_HEAD_REPORT}
        />,
        { wrapper }
      )

      const title = await screen.findByText('Missing Head Report')
      expect(title).toBeInTheDocument()
      const description = await screen.findByText(
        'Unable to compare commits because the head commit did not upload a bundle analysis report.'
      )
      expect(description).toBeInTheDocument()
    })
  })

  describe('missing base report error', () => {
    it('renders coverage report error', async () => {
      render(
        <ComparisonErrorBanner
          reportType={ReportUploadType.COVERAGE}
          errorType={ComparisonReturnType.MISSING_BASE_REPORT}
        />,
        { wrapper }
      )

      const title = await screen.findByText('Missing Base Report')
      expect(title).toBeInTheDocument()
      const description = await screen.findByText(
        'Unable to compare commits because the base commit did not upload a coverage report.'
      )
      expect(description).toBeInTheDocument()
    })

    it('renders bundle analysis report error', async () => {
      render(
        <ComparisonErrorBanner
          reportType={ReportUploadType.BUNDLE_ANALYSIS}
          errorType={ComparisonReturnType.MISSING_BASE_REPORT}
        />,
        { wrapper }
      )

      const title = await screen.findByText('Missing Base Report')
      expect(title).toBeInTheDocument()
      const description = await screen.findByText(
        'Unable to compare commits because the base commit did not upload a bundle analysis report.'
      )
      expect(description).toBeInTheDocument()
    })
  })
})
