import { render, screen } from '@testing-library/react'

import { BundleTrendChart } from './BundleTrendChart'

describe('Coverage Area Chart', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2020-04-01'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('Chart with data', () => {
    it('renders victory', () => {
      render(
        <BundleTrendChart
          data={{
            maxY: 70,
            multiplier: 1,
            measurements: [
              { date: new Date('2020-01-15T20:18:39.413Z'), size: 20 },
              { date: new Date('2020-01-17T20:18:39.413Z'), size: 50 },
            ],
          }}
          desc="Chart desc"
          title="Chart title"
        />
      )

      const victory = screen.getByRole('img')
      expect(victory).toBeInTheDocument()
    })

    it('renders a screen reader description', () => {
      render(
        <BundleTrendChart
          data={{
            maxY: 70,
            multiplier: 1,
            measurements: [
              { date: new Date('2020-01-15T20:18:39.413Z'), size: 20 },
              { date: new Date('2020-01-17T20:18:39.413Z'), size: 50 },
            ],
          }}
          desc="Chart desc"
          title="Chart title"
        />
      )

      const chartDescription = screen.getByText('Chart desc')
      expect(chartDescription).toBeInTheDocument()
    })

    it('renders a screen reader title', () => {
      render(
        <BundleTrendChart
          data={{
            maxY: 70,
            multiplier: 1,
            measurements: [
              { date: new Date('2020-01-15T20:18:39.413Z'), size: 20 },
              { date: new Date('2020-01-17T20:18:39.413Z'), size: 50 },
            ],
          }}
          desc="Chart desc"
          title="Chart title"
        />
      )

      const chartTitle = screen.getByText('Chart title')
      expect(chartTitle).toBeInTheDocument()
    })
  })

  describe('Not enough data to render', () => {
    it('renders victory', () => {
      render(
        <BundleTrendChart
          data={{
            maxY: 10,
            multiplier: 1,
            measurements: [
              { date: new Date('2020-01-15T20:18:39.413Z'), size: 20 },
            ],
          }}
          desc="Chart desc"
          title="Chart title"
        />
      )
      const victory = screen.getByRole('img')
      expect(victory).toBeInTheDocument()
    })

    it('renders not enough data', () => {
      render(
        <BundleTrendChart
          data={{
            maxY: 10,
            multiplier: 1,
            measurements: [
              { date: new Date('2020-01-15T20:18:39.413Z'), size: 20 },
            ],
          }}
          desc="Chart desc"
          title="Chart title"
        />
      )

      const noData = screen.getByText('Not enough data to render')
      expect(noData).toBeInTheDocument()
    })
  })
})
