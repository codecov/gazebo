import { render, screen } from 'custom-testing-library'

import FlagsWrapper from './FlagsWrapper'
jest.mock('./Flags', () => () => 'Flags')

describe('Flags Card', () => {
  function setup(data) {
    render(<FlagsWrapper />)
  }

  beforeEach(() => {
    setup()
  })

  it('renders', () => {
    const FlagComponent = screen.getByText(/Flags/)
    expect(FlagComponent).toBeInTheDocument()
  })
})
