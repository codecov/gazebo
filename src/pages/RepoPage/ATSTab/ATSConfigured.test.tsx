import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ATSConfigured from './ATSConfigured'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/ats']}>
    {children}
  </MemoryRouter>
)

describe('ATSConfigured', () => {
  it('renders header', () => {
    render(<ATSConfigured />, { wrapper: wrapper })

    const header = screen.getByText('Automated Test Selection Configured')
    expect(header).toBeInTheDocument()
  })

  it('displays the beta badge', () => {
    render(<ATSConfigured />, { wrapper: wrapper })

    const betaBadge = screen.getByText('BETA')
    expect(betaBadge).toBeInTheDocument()
  })

  it('displays the feedback link with correct text', () => {
    render(<ATSConfigured />, { wrapper: wrapper })

    const feedbackLink = screen.getByText('here')
    expect(feedbackLink).toBeInTheDocument()
    expect(feedbackLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/feedback/discussions'
    )
  })

  it('renders the Read Documentation button', () => {
    render(<ATSConfigured />, { wrapper: wrapper })

    const readDocButton = screen.getByText('Read Documentation')
    expect(readDocButton).toBeInTheDocument()
    expect(readDocButton).toHaveAttribute(
      'href',
      'https://docs.codecov.com/docs/automated-test-selection'
    )
  })
})
