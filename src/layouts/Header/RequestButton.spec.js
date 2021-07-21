import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAccountDetails } from 'services/account'
import RequestButton from './RequestButton'

jest.mock('services/account')

const params = {
  owner: 'yasha',
  provider: 'gh',
}

describe('RequestButton', () => {
  function setup(accountDetails) {
    useAccountDetails.mockReturnValue({ data: accountDetails })
    render(<RequestButton owner={params.owner} provider={params.provider} />, {
      wrapper: MemoryRouter,
    })
  }

  it('renders request demo button when there is owner with free plan is logged in', () => {
    setup({ plan: { value: 'users-free' } })

    const requestDemoButton = screen.getByTestId('request-demo')
    expect(requestDemoButton).toBeInTheDocument()
    expect(requestDemoButton).toHaveAttribute(
      'href',
      'https://about.codecov.io/demo'
    )
  })

  it('does not render request demo button when owner without free plan is logged in', () => {
    setup({ plan: { value: 'not-users-free' } })
    expect(screen.queryByText(/Request demo/)).toBeNull()
  })
})
