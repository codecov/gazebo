import { render, screen } from '@testing-library/react'

import config from 'config'

import BitbucketLoginCard from './BitbucketLoginCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('BitbucketLoginCard', () => {
  function setup(data) {
    render(<BitbucketLoginCard providers={data} />)
  }

  describe('when system is configured with Bitbucket', () => {
    beforeEach(() => {
      const data = ['BITBUCKET', 'BITBUCKET_SERVER']
      setup(data)
    })

    it('renders external login button', () => {
      const element = screen.getByRole('link', { name: 'Login via Bitbucket' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/bb`)
    })

    it('renders self hosted login link', () => {
      const element = screen.getByRole('link', {
        name: 'Login via Bitbucket Server',
      })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/bbs`)
    })
  })
})
