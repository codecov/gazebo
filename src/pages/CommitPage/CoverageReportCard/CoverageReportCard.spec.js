import { render, screen } from '@testing-library/react'
import CoverageReportCard from './CoverageReportCard'
import { MemoryRouter } from 'react-router-dom'

jest.mock('services/commit')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    provider: 'gh',
    owner: 'codecov',
    commit: 'f00162848a3cebc0728d915763c2fd9e92132408',
  }),
}))

describe('CoverageReportCard', () => {
  const mockData = {
    totals: {
      coverage: 38.30846,
    },
    state: 'success',
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    createdAt: '2020-08-25T16:35:32',
    ciPassed: true,
    parent: {
      commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
      totals: {
        coverage: 33.30846,
      },
    },
    pullId: 123,
  }

  function setup(data) {
    render(<CoverageReportCard provider="gh" data={data} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('successful commit renders', () => {
    beforeEach(() => {
      setup(mockData)
    })

    it('renders the title', () => {
      expect(screen.getByText(/Coverage report/)).toBeInTheDocument()
      expect(
        screen.queryByRole('heading', {
          name: 'exclamation.svg Coverage report',
        })
      ).not.toBeInTheDocument()
    })
    it('renders PACTH placeholder while polling', () => {
      expect(screen.getByText(/Patch/)).toBeInTheDocument()
      expect(screen.queryAllByText('-')).toHaveLength(1)
    })
    it('renders the Change', () => {
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("5.00%")
    })
    it('renders the Head', () => {
      expect(screen.getByText('HEAD')).toBeInTheDocument()
    })
    it('renders the description', () => {
      expect(
        screen.getByText(/The average coverage of changes for this commit is/)
      ).toBeInTheDocument()
    })
    it('renders CI Passed', () => {
      expect(screen.getByText('CI Passed')).toBeInTheDocument()
    })
    it('renders the pull lable', () => {
      expect(screen.getByText(/pull-request-open.svg/)).toBeInTheDocument()
    })
  })

  describe('renders with incomplete info', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders the title', () => {
      expect(screen.getByText(/Coverage report/)).toBeInTheDocument()
    })
  })

  describe('renders with patch', () => {
    beforeEach(() => {
      setup({
        ...mockData,
        state: 'pending',
        compareWithParent: { patchTotals: { coverage: 0.111 } },
      })
    })

    it('renders PACTH after polling', () => {
      expect(screen.getByText(/Patch/)).toBeInTheDocument()
      expect(screen.queryAllByText(/11.10/)).toHaveLength(2)
    })

    it('does not render the pull lable', () => {
      expect(
        screen.queryByRole('img', { name: 'pull-request-open' })
      ).not.toBeInTheDocument()
    })
  })

  describe('with error', () => {
    beforeEach(() => {
      setup({
        ...mockData,
        state: 'error',
      })
    })

    it('Suggests support links', () => {
      expect(
        screen.getByRole('link', { name: 'files paths external-link.svg' })
      ).toHaveAttribute('href', 'https://docs.codecov.com/docs/fixing-paths')
      expect(
        screen.getByRole('link', { name: 'reference external-link.svg' })
      ).toHaveAttribute('href', 'https://docs.codecov.com/docs/error-reference')
    })

    it('The commit coverage card title has an error indicator', () => {
      expect(
        screen.getByRole('heading', { name: 'exclamation.svg Coverage report' })
      ).toBeInTheDocument()
    })
  })
})
