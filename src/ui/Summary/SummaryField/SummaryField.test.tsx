import { render, screen } from '@testing-library/react'

import SummaryField from '.'

describe('SummaryField', () => {
  it('renders complete card when title and children are provided', () => {
    render(
      <SummaryField title="Cool Title">
        <span>Cool content</span>
      </SummaryField>
    )

    const cardTitle = screen.getByText('Cool Title')
    expect(cardTitle).toBeInTheDocument()

    const cardChildren = screen.getByText('Cool content')
    expect(cardChildren).toBeInTheDocument()
  })
})
