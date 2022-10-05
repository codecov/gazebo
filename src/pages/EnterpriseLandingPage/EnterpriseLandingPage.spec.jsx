import { render, screen } from '@testing-library/react'

import EnterpriseLandingPage from './EnterpriseLandingPage'
import { useServiceProviders } from './hooks'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))
jest.mock('./hooks')

const mockData = {
  data: {
    providerList: [
      'GITHUB',
      'GITHUB_ENTERPRISE',
      'GITLAB',
      'GITLAB_ENTERPRISE',
      'BITBUCKET',
      'BITBUCKET_SERVER',
    ],
    github: true,
    gitlab: true,
    bitbucket: true,
  },
}

describe('EnterpriseLandingPage', () => {
  function setup() {
    render(<EnterpriseLandingPage />)
  }

  describe('when systems are configured', () => {
    beforeEach(() => {
      useServiceProviders.mockReturnValue(mockData)
      setup()
    })
    it('displays github card', () => {
      const element = screen.getByRole('heading', { name: 'GitHub' })
      expect(element).toBeInTheDocument()
    })
    it('displays gitlab card', () => {
      const element = screen.getByRole('heading', { name: 'GitLab' })
      expect(element).toBeInTheDocument()
    })
    it('displays bitbucket card', () => {
      const element = screen.getByRole('heading', { name: 'Bitbucket' })
      expect(element).toBeInTheDocument()
    })
  })

  describe('when no systems are configured', () => {
    beforeEach(() => {
      useServiceProviders.mockReturnValue({ data: [] })
      setup()
    })
    it('displays github login button', () => {
      expect(screen.queryByText('GitHub')).toBeNull()
    })
    it('displays gitlab button', () => {
      expect(screen.queryByText('GitLab')).toBeNull()
    })
    it('displays bitbucket button', () => {
      expect(screen.queryByText('Bitbucket')).toBeNull()
    })
  })
})
