import { render, screen } from '@testing-library/react'

import config from 'config'

import GitLabLoginCard from './GitLabLoginCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('GitLabLoginCard', () => {
  function setup(data) {
    render(<GitLabLoginCard gitlab={data} />)
  }

  describe('when system is configured with GitLab', () => {
    beforeEach(() => {
      const data = [
        { hostingOption: 'EXTERNAL' },
        { hostingOption: 'SELF_HOSTED' },
      ]
      setup(data)
    })

    it('renders external login button', () => {
      const element = screen.getByRole('link', { name: 'GitLab' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/gl`)
    })

    it('renders self hosted login link', () => {
      const element = screen.getByRole('link', { name: 'GitLab CE/EE' })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/gle`)
    })
  })
})
