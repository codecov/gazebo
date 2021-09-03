import Chart from './Chart'
import { render, screen, fireEvent } from '@testing-library/react'

describe('Analytics coverage chart', () => {
  function setup(props) {
    render(<Chart {...props} />)
  }

  describe('No coverage data exists', () => {
    beforeEach(() => {
      setup({
        data: [],
      })
    })

    it('renders no chart', () => {
      expect(screen.queryAllByRole('presentation').length).toBe(0)
    })
  })

  describe('Chart with data', () => {
    beforeEach(() => {
      setup({
        data: [
          { date: '2020-01-15T20:18:39.413Z', coverage: 20 },
          { date: '2020-01-17T20:18:39.413Z', coverage: 50 },
        ],
      })
    })

    it('renders victory', () => {
      expect(screen.getByRole('img')).toBeInTheDocument(0)
    })

    it('renders a screen reader friendly description', () => {
      expect(
        screen.getByText(
          'Organization wide coverage chart from Jan 15, 2020 to Jan 17, 2020, coverage change is +20%'
        )
      ).toBeInTheDocument()
    })

    xit('shows the correct tooltip', async () => {
      // Can't get the tooltip to show up
      const chart = screen.getByRole('img')
      fireEvent.mouseOver(chart, {
        clientX: 60,
        clientY: 10,
      })
      expect(await screen.findByText(/Coverage:/)).toBeInTheDocument()
    })
  })
})
