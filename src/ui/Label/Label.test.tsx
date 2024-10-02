import { render, screen } from '@testing-library/react'

import Label from './Label'

describe('Label', () => {
  it('Renders the content', () => {
    render(<Label>test</Label>)

    const content = screen.getByText('test')
    expect(content).toBeInTheDocument()
  })
})
