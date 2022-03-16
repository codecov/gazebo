import { render, screen } from '@testing-library/react'

import Summary from '.'

describe('Summary', () => {
  let container

  function setup({ cards }) {
    ;({ container } = render(<Summary cards={cards} />))
  }

  it('doesnt render anything when cards array is empty', () => {
    const cards = []
    setup({ cards })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a summary card for every card provided', () => {
    const cardOne = {
      name: 'firstCard',
      title: 'random title',
      value: 'random value',
    }
    const cardTwo = {
      name: 'secondCard',
      title: <span>Fancy title</span>,
      value: <span>Fancy value</span>,
    }
    const cards = [cardOne, cardTwo]
    setup({ cards })

    expect(container).not.toBeEmptyDOMElement()

    const cardOneTitle = screen.getByText('random title')
    expect(cardOneTitle).toBeInTheDocument()
    const cardOneValue = screen.getByText('random value')
    expect(cardOneValue).toBeInTheDocument()

    const cardTwoTitle = screen.getByText('Fancy title')
    expect(cardTwoTitle).toBeInTheDocument()
    const cardTwoValue = screen.getByText('Fancy value')
    expect(cardTwoValue).toBeInTheDocument()
  })
})
