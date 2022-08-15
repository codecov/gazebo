import { render, screen } from '@testing-library/react'

import config from 'config'

import ProviderCard from './ProviderCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('ProviderCard', () => {
  function setup({ key, data }) {
    render(<ProviderCard providerKey={key} providers={data} />)
  }

  describe('Bitbucket', () => {
    describe('when system is configured with Bitbucket', () => {
      beforeEach(() => {
        const data = ['BITBUCKET', 'BITBUCKET_SERVER']
        setup({ key: 'bb', data })
      })

      it('renders external login button', () => {
        const element = screen.getByRole('link', {
          name: 'Login via Bitbucket',
        })
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

  describe('GitHub', () => {
    describe('when system is configured with GitHub', () => {
      beforeEach(() => {
        const data = ['GITHUB', 'GITHUB_ENTERPRISE']
        setup({ key: 'gh', data })
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

  describe('GitLab', () => {
    describe('when system is configured with GitLab', () => {
      beforeEach(() => {
        const data = ['GITLAB', 'GITLAB_ENTERPRISE']
        setup({ key: 'gl', data })
      })

      it('renders external login button', () => {
        const element = screen.getByRole('link', { name: 'Login via GitLab' })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/gl`)
      })

      it('renders self hosted login link', () => {
        const element = screen.getByRole('link', {
          name: 'Login via GitLab CE/EE',
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', `${config.BASE_URL}/login/gle`)
      })
    })
  })
})
