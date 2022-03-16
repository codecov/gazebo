import { render, screen } from '@testing-library/react'

import SummaryCard from '.'

describe('SummaryCard', () => {
  function setup({ children, title }) {
    render(<SummaryCard title={title}>{children}</SummaryCard>)
  }

  it('renders complete card when title and children are provided', () => {
    const title = 'Dorian Stormwind'
    const text = 'Gone but long forgotten'
    const cardValue = <span>{text}</span>

    setup({ title, children: cardValue })
    const cardTitle = screen.getByText(title)
    expect(cardTitle).toBeInTheDocument()
    const cardChildren = screen.getByText(text)
    expect(cardChildren).toBeInTheDocument()
  })
})
