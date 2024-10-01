import { render, screen } from '@testing-library/react'

import { icicle } from 'assets/svg/graphs'

import GraphCard from './GraphCard'

describe('GraphCard', () => {
  describe('public scope', () => {
    it('renders the title', () => {
      render(
        <GraphCard
          title="Graph Title"
          description="Graph description and -if exists- a link"
          link="link to be copied"
          src={icicle}
        />
      )

      const title = screen.getByText(/Graph Title/)
      expect(title).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(
        <GraphCard
          title="Graph Title"
          description="Graph description and -if exists- a link"
          link="link to be copied"
          src={icicle}
        />
      )

      const description = screen.getByText(
        /Graph description and -if exists- a link/
      )
      expect(description).toBeInTheDocument()
    })

    it('renders truncated token', () => {
      render(
        <GraphCard
          title="Graph Title"
          description="Graph description and -if exists- a link"
          link="link to be copied"
          src={icicle}
        />
      )

      const copyLink = screen.getByText(/link to be cop.../)
      expect(copyLink).toBeInTheDocument()
    })

    it('renders expected img', () => {
      render(
        <GraphCard
          title="Graph Title"
          description="Graph description and -if exists- a link"
          link="link to be copied"
          src={icicle}
        />
      )

      const svg = screen.getByRole('img', { name: 'graph-chart' })
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('src', '/src/assets/svg/graphs/icicle.svg')
    })
  })
})
