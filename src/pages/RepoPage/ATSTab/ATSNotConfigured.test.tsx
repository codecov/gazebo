import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ATSNotConfigured from './ATSNotConfigured'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/ats']}>
    {children}
  </MemoryRouter>
)

describe('ATSNotConfigured', () => {
  it('renders header', () => {
    render(<ATSNotConfigured />, { wrapper: wrapper })

    const header = screen.getByText(
      'Automated Test Selection Not Yet Configured'
    )
    expect(header).toBeInTheDocument()
  })

  it('renders sub header', () => {
    render(<ATSNotConfigured />, { wrapper: wrapper })

    const subHeader = screen.getByText(
      /Ready to Accelerate Your CI\/CD Pipeline?/
    )
    expect(subHeader).toBeInTheDocument()
  })

  it('renders paragraph', () => {
    render(<ATSNotConfigured />, { wrapper: wrapper })

    const paragraph = screen.getByText(
      'Automated Test Selection is waiting to be set up!'
    )
    expect(paragraph).toBeInTheDocument()
  })

  it('renders the Read Documentation button', () => {
    render(<ATSNotConfigured />, { wrapper: wrapper })

    const readDocButton = screen.getByText('Read the Documentation and Set Up')
    expect(readDocButton).toBeInTheDocument()
    expect(readDocButton).toHaveAttribute(
      'href',
      'https://docs.codecov.com/docs/automated-test-selection'
    )
  })
})
