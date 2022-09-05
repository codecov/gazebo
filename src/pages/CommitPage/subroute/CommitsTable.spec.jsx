import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitsTable from './CommitsTable'

jest.mock('services/repos/hooks')

describe('CommitsTable', () => {
  let props
  function setup(data = [], state = 'processed') {
    props = {
      data,
      state,
    }
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <CommitsTable {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when data is available', () => {
    beforeEach(() => {
      setup([
        {
          headName: 'src/index2.py',
          baseCoverage: {
            coverage: 62.5,
          },
          headCoverage: {
            coverage: 50.0,
          },
          patchCoverage: {
            coverage: 37.5,
          },
        },
      ])
    })

    it('renders name', () => {
      const buttons = screen.getAllByText('src/index2.py')
      expect(buttons.length).toBe(1)
    })

    it('renders coverage', () => {
      const coverage = screen.getByText(/50.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch', () => {
      const patch = screen.getByText(/37.50%/)
      expect(patch).toBeInTheDocument()
    })

    it('render change', () => {
      const noData = screen.getByText(/-12.50%/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when all data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: {},
          headCoverage: {},
          patchCoverage: {},
        },
      ])
    })

    it('does not render coverage', () => {
      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders no available data copy', () => {
      const copy = screen.getByText('No data available')
      expect(copy).toBeInTheDocument()
    })
  })

  describe('when some data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: {},
          headCoverage: {
            coverage: 67,
          },
          patchCoverage: {
            coverage: 98,
          },
        },
      ])
    })

    it('renders head coverage', () => {
      const coverage = screen.queryByText(/67.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch coverage', () => {
      const coverage = screen.queryByText(/98.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders dash for change', () => {
      const dash = screen.getByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when no changes', () => {
    beforeEach(() => {
      setup()
    })

    it('renders coverage', () => {
      const coverage = screen.getByText(
        'No Files covered by tests were changed'
      )
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when impacted files are in pending state', () => {
    beforeEach(() => {
      setup([], 'pending')
    })

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })
})
