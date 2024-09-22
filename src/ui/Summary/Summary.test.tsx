import { render, screen } from '@testing-library/react'

import Summary from './Summary'

describe('Summary', () => {
  it('does not render anything when fields array is empty', () => {
    const fields: any[] = []
    const { container } = render(<Summary fields={fields} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a summary field for every field provided', () => {
    const fieldOne = {
      name: 'firstField',
      title: 'random title',
      value: 'random value',
    }
    const fieldTwo = {
      name: 'secondField',
      title: <span>Fancy title</span>,
      value: <span>Fancy value</span>,
    }
    const fields = [fieldOne, fieldTwo]
    const { container } = render(<Summary fields={fields} />)

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
