import { render, screen } from '@testing-library/react'
import CoverageReportCard from './CoverageReportCard'

describe('CoverageReportCard', () => {
  const mockData = {
    commit: {
      totals: {
        coverage: 38.30846,
        diff: {
          coverage: null,
        },
      },
      commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
      pullId: 10,
      createdAt: '2020-08-25T16:35:32',
      ciPassed: true,
      parent: {
        commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
        totals: {
          coverage: 38.30846,
        },
      },
    },
  }

  function setup() {
    render(<CoverageReportCard data={mockData} />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      expect(screen.getByText(/Coverage report/)).toBeInTheDocument()
    })
    it('renders the PATH', () => {
      expect(screen.getByText(/Patch/)).toBeInTheDocument()
    })
    it('renders the Change', () => {
      expect(screen.getByText('Change')).toBeInTheDocument()
    })
    it('renders the Head', () => {
      expect(screen.getByText('HEAD')).toBeInTheDocument()
    })
    it('renders the description', () => {
      expect(
        screen.getByText(/The average coverage of changes for this commit is/)
      ).toBeInTheDocument()
    })
    it('renders CI Failed Status', () => {
      expect(screen.getByText('CI Failed')).toBeInTheDocument()
    })
  })
})
