import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ATSNotConfigured from './ATSNotConfigured'

const wrapper: React.FC<React.PropsWithChildren> = () => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/ats']}>
    <ATSNotConfigured />
  </MemoryRouter>
)

function setup() {
  render(<ATSNotConfigured />, { wrapper: wrapper })
}

beforeEach(() => {
  setup()
})

describe('ATSNotConfigured', () => {
  it('renders header', () => {
    expect(
      screen.getByText('Automated Test Selection Not Yet Configured')
    ).toBeInTheDocument()
  })

  it('renders sub header', () => {
    expect(
      screen.getByText(/Ready to Accelerate Your CI\/CD Pipeline?/)
    ).toBeInTheDocument()
  })

  it('renders paragraph', () => {
    expect(
      screen.getByText('Automated Test Selection is waiting to be set up!')
    ).toBeInTheDocument()
  })

  it('renders the Read Documentation button', () => {
    const readDocButton = screen.getByText('Read the Documentation and Set Up')
    expect(readDocButton).toBeInTheDocument()
    expect(readDocButton).toHaveAttribute(
      'href',
      'https://docs.codecov.com/docs/automated-test-selection'
    )
  })
})
