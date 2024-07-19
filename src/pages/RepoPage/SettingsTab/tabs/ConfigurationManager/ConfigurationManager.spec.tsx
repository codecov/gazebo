import { render, screen } from '@testing-library/react'

import ConfigurationManager from './ConfigurationManager'

describe('Configuration Manager', () => {
  it('temp: renders Configuration Manager', async () => {
    render(<ConfigurationManager />)

    const text = await screen.findByText('Configuration Manager')
    expect(text).toBeInTheDocument()
  })
})
