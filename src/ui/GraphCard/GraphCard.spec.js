import { render, screen } from '@testing-library/react'

import { icicle } from 'assets/svg/graphs'

import GraphCard from './GraphCard'

describe('GraphCard', () => {
  function setup() {
    render(
      <GraphCard
        title="Graph Title"
        description="Graph description and -if exists- a link"
        svg="token to be copied"
        src={icicle}
      />
    )
  }

  describe('public scope', () => {
    beforeEach(() => {
      setup()
    })
    it('renders the title', () => {
      expect(screen.getByText(/Graph Title/)).toBeInTheDocument()
    })
    it('renders the description', () => {
      expect(
        screen.getByText(/Graph description and -if exists- a link/)
      ).toBeInTheDocument()
    })
    it('renders truncated token', () => {
      expect(screen.getByText(/token to be cop.../)).toBeInTheDocument()
      expect(screen.getByText(/clipboard-copy.svg/)).toBeInTheDocument()
    })
    it('renders expected img', () => {
      expect(screen.getByRole('img', { src: 'icicle.svg' })).toBeInTheDocument()
    })
  })
})
