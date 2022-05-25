import { render, screen } from '@testing-library/react'

import Label from '.'

describe('Label', () => {
  function setup(props) {
    render(<Label {...props} />)
  }

  it('Renders the content', () => {
    setup({ children: 'test' })

    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
