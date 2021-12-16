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
  describe('when data is missing', () => {
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

    it('renders coverage', () => {
      const coverage = screen.getByText(/0.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders patch', () => {
      const elements = screen.getAllByText('-')
      expect(elements.length).toBe(2)
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
