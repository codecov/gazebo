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
      diff: {
        coverage: null,
      },
    },
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    createdAt: '2020-08-25T16:35:32',
    ciPassed: true,
    parent: {
      commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
      totals: {
        coverage: 38.30846,
      },
    },
  }

  function setup(data) {
    render(<CoverageReportCard provider="gh" data={data} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('renders', () => {
    beforeEach(() => {
      setup(mockData)
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
      expect(screen.getByText('CI Passed')).toBeInTheDocument()
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
})
