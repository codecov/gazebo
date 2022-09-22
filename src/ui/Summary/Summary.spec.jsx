import { render, screen } from '@testing-library/react'

import Summary from '.'

describe('Summary', () => {
  let container

  function setup({ fields }) {
    ;({ container } = render(<Summary fields={fields} />))
  }

  it('doesnt render anything when fields array is empty', () => {
    const fields = []
    setup({ fields })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a summary field for every field provided', () => {
    const fieldOne = {
      name: 'firstfield',
      title: 'random title',
      value: 'random value',
    }
    const fieldTwo = {
      name: 'secondfield',
      title: <span>Fancy title</span>,
      value: <span>Fancy value</span>,
    }
    const fields = [fieldOne, fieldTwo]
    setup({ fields })

    expect(container).not.toBeEmptyDOMElement()

    const fieldOneTitle = screen.getByText('random title')
    expect(fieldOneTitle).toBeInTheDocument()
    const fieldOneValue = screen.getByText('random value')
    expect(fieldOneValue).toBeInTheDocument()

    const fieldTwoTitle = screen.getByText('Fancy title')
    expect(fieldTwoTitle).toBeInTheDocument()
    const fieldTwoValue = screen.getByText('Fancy value')
    expect(fieldTwoValue).toBeInTheDocument()
  })
})
