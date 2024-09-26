import { render, screen } from '@testing-library/react'

import CoverageAreaChart from './CoverageAreaChart'

describe('Coverage Area Chart', () => {
  describe('No coverage data exists', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-04-01'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('renders no chart', () => {
      render(
        <CoverageAreaChart data={[]} desc="Chart desc" title="Chart title" />
      )
      expect(screen.queryAllByRole('presentation').length).toBe(0)
    })
  })

  describe('Chart with data', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-04-01'))
    })
    afterAll(() => {
      vi.useRealTimers()
    })

    it('renders victory', () => {
      render(
        <CoverageAreaChart
          axisLabelFunc={(t) => t}
          data={[
            { date: new Date('2020-01-15T20:18:39.413Z'), coverage: 20 },
            { date: new Date('2020-01-17T20:18:39.413Z'), coverage: 50 },
          ]}
          desc="Chart desc"
          title="Chart title"
          renderAreaChart={true}
        />
      )

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders a screen reader description', () => {
      render(
        <CoverageAreaChart
          axisLabelFunc={(t) => t}
          data={[
            { date: new Date('2020-01-15T20:18:39.413Z'), coverage: 20 },
            { date: new Date('2020-01-17T20:18:39.413Z'), coverage: 50 },
          ]}
          desc="Chart desc"
          title="Chart title"
          renderAreaChart={true}
        />
      )

      expect(screen.getByText('Chart desc')).toBeInTheDocument()
    })

    it('renders a screen reader title', () => {
      render(
        <CoverageAreaChart
          axisLabelFunc={(t) => t}
          data={[
            { date: new Date('2020-01-15T20:18:39.413Z'), coverage: 20 },
            { date: new Date('2020-01-17T20:18:39.413Z'), coverage: 50 },
          ]}
          desc="Chart desc"
          title="Chart title"
          renderAreaChart={true}
        />
      )

      expect(screen.getByText('Chart title')).toBeInTheDocument()
    })
  })

  describe('Not enough data to render', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-04-01'))
    })
    afterAll(() => {
      vi.useRealTimers()
    })

    it('renders victory', () => {
      render(
        <CoverageAreaChart
          axisLabelFunc={(t) => t}
          data={[{ date: new Date('2020-01-15T20:18:39.413Z'), coverage: 20 }]}
          desc="Chart desc"
          title="Chart title"
          renderAreaChart={true}
        />
      )
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders not enough data', () => {
      render(
        <CoverageAreaChart
          axisLabelFunc={(t) => t}
          data={[{ date: new Date('2020-01-15T20:18:39.413Z'), coverage: 20 }]}
          desc="Chart desc"
          title="Chart title"
          renderAreaChart={true}
        />
      )
      expect(screen.getByText('Not enough data to render')).toBeInTheDocument()
    })
  })
})
