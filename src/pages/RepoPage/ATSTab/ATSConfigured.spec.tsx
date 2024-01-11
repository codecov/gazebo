import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ATSConfigured from './ATSConfigured'

const wrapper: React.FC<React.PropsWithChildren> = () => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/ats']}>
    <ATSConfigured />
  </MemoryRouter>
)

function setup() {
  render(<ATSConfigured />, { wrapper: wrapper })
}

beforeEach(() => {
  setup()
})

describe('ATSConfigured', () => {
  it('renders header', () => {
    expect(
      screen.getByText('Automated Test Selection Configured')
    ).toBeInTheDocument()
  })

  it('displays the beta badge', () => {
    const betaBadge = screen.getByText('BETA')
    expect(betaBadge).toBeInTheDocument()
  })

  it('displays the feedback link with correct text', () => {
    const feedbackLink = screen.getByText('here')
    expect(feedbackLink).toBeInTheDocument()
    expect(feedbackLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/feedback/discussions'
    )
  })

  it('renders the Read Documentation button', () => {
    const readDocButton = screen.getByText('Read Documentation')
    expect(readDocButton).toBeInTheDocument()
    expect(readDocButton).toHaveAttribute(
      'href',
      'https://docs.codecov.com/docs/automated-test-selection'
    )
  })
})
