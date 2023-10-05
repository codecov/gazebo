import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { ComparisonReturnType } from 'shared/utils/comparison'

import ErrorBanner from './ErrorBanner'

describe('ErrorBanner Card', () => {
  function setup({ errorType }) {
    render(
      <MemoryRouter initialEntries={[`/gh/codecov`]}>
        <Route path="/:provider/:owner">
          <ErrorBanner errorType={errorType} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with missing base commit', () => {
    beforeEach(() => {
      setup({ errorType: ComparisonReturnType.MISSING_BASE_COMMIT })
    })

    it('displays according error message', () => {
      expect(screen.getByText('Missing Base Commit')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Unable to compare commits because the base commit of the pull request is not found.'
        )
      ).toBeInTheDocument()
      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing head commit', () => {
    beforeEach(() => {
      setup({ errorType: ComparisonReturnType.MISSING_HEAD_COMMIT })
    })

    it('displays according error message', () => {
      expect(screen.getByText('Missing Head Commit')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Unable to compare commits because the head commit of the pull request is not found.'
        )
      ).toBeInTheDocument()
      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'
      )
    })
  })

  describe('when rendered with missing base report', () => {
    beforeEach(() => {
      setup({ errorType: ComparisonReturnType.MISSING_BASE_REPORT })
    })

    it('displays according error message', () => {
      expect(screen.getByText('Missing Base Report')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Unable to compare commits because the base of the pull request did not upload a coverage report.'
        )
      ).toBeInTheDocument()
      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing head report', () => {
    beforeEach(() => {
      setup({ errorType: ComparisonReturnType.MISSING_HEAD_REPORT })
    })

    it('displays according error message', () => {
      expect(screen.getByText('Missing Head Report')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Unable to compare commits because the head of the pull request did not upload a coverage report.'
        )
      ).toBeInTheDocument()
      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with missing a comparison', () => {
    beforeEach(() => {
      setup({ errorType: ComparisonReturnType.MISSING_COMPARISON })
    })

    it('displays according error message', () => {
      expect(screen.getByText('Missing Comparison')).toBeInTheDocument()
      expect(
        screen.getByText(
          'There was an error computing the comparison for the head and base commit.'
        )
      ).toBeInTheDocument()
      const troubleshootLink = screen.getByRole('link', { name: /learn more/i })
      expect(troubleshootLink).toBeInTheDocument()
      expect(troubleshootLink.href).toBe(
        'https://docs.codecov.com/docs/error-reference#missing-base-report'
      )
    })
  })

  describe('when rendered with unknown error type', () => {
    beforeEach(() => {
      setup({ errorType: 'hyuck hyuck!' })
    })

    it('doesn not display any error message', () => {
      expect(screen.queryByText('Missing')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /learn more/i })
      ).not.toBeInTheDocument()
    })
  })
})
