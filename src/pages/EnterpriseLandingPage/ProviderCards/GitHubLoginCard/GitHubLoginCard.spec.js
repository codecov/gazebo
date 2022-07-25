import { render, screen } from '@testing-library/react'

import config from 'config'

import GitHubLoginCard from './GitHubLoginCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('GitHubLoginCard', () => {
  function setup(data) {
    render(<GitHubLoginCard github={data} />)
  }

  describe('when system is configured with GitHub', () => {
    beforeEach(() => {
      const data = [
        { hostingOption: 'EXTERNAL' },
        { hostingOption: 'SELF_HOSTED' },
      ]
      setup(data)
    })

    it('renders external login button', () => {
      const element = screen.getByRole('link', { name: 'Login via GitHub' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/gh`)
    })

    it('renders self hosted login link', () => {
      const element = screen.getByRole('link', {
        name: 'Login via GitHub Enterprise',
      })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/ghe`)
    })
  })
})
