import { render, screen } from '@testing-library/react'

import config from 'config'

import BitbucketLoginCard from './BitbucketLoginCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('BitbucketLoginCard', () => {
  function setup(data) {
    render(<BitbucketLoginCard bitbucket={data} />)
  }

  describe('when system is configured with Bitbucket', () => {
    beforeEach(() => {
      const data = [
        { hostingOption: 'EXTERNAL' },
        { hostingOption: 'SELF_HOSTED' },
      ]
      setup(data)
    })

    it('renders external login button', () => {
      const element = screen.getByRole('link', { name: 'Bitbucket' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/bb`)
    })

    it('renders self hosted login link', () => {
      const element = screen.getByRole('link', { name: 'Bitbucket Server' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/bbs`)
    })
  })
})
