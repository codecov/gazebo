import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Chart from './Chart'
import { useCoverage } from './useCoverage'

jest.mock('./useCoverage')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('Analytics coverage chart', () => {
  describe('No coverage data exists', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))
      useCoverage.mockReturnValue({
        data: { coverage: [], coverageAxisLabel: () => 'hi' },
        isPreviousData: false,
        isSuccess: false,
      })
    })
    afterAll(() => {
      jest.useRealTimers()
      jest.resetAllMocks()
    })

    it('renders no chart', () => {
      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: [],
          }}
        />,
        {
          wrapper,
        }
      )

      expect(screen.queryAllByRole('presentation').length).toBe(0)
    })
  })

  describe('One data point', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))
      useCoverage.mockReturnValue({
        data: {
          coverage: [{ date: new Date('2022/12/20'), coverage: 20 }],
          coverageAxisLabel: () => 'hi',
        },
        isPreviousData: false,
        isSuccess: true,
      })
    })
    afterAll(() => {
      jest.useRealTimers()
      jest.resetAllMocks()
    })

    it('Not enough data to render', () => {
      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: [],
          }}
        />,
        {
          wrapper,
        }
      )

      expect(screen.getByText(/Not enough data to render/)).toBeInTheDocument()
    })
  })

  describe('Chart with data', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))
      useCoverage.mockReturnValue({
        data: {
          coverage: [
            { date: new Date('2022/12/20'), coverage: 20 },
            { date: new Date('2022/12/21'), coverage: 20 },
          ],
          coverageAxisLabel: () => 'hi',
        },
        isPreviousData: false,
        isSuccess: true,
      })
    })
    afterAll(() => {
      jest.useRealTimers()
      jest.resetAllMocks()
    })

    it('renders victory', () => {
      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: [],
          }}
        />,
        {
          wrapper,
        }
      )

      expect(screen.getByRole('img')).toBeInTheDocument(0)
    })

    it('renders a screen reader friendly description', () => {
      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: ['api', 'frontend'],
          }}
        />,
        {
          wrapper,
        }
      )

      expect(
        screen.getByText(
          'api, frontend coverage chart from Dec 20, 2022 to Dec 21, 2022, coverage change is -20%'
        )
      ).toBeInTheDocument()
    })
  })
})
