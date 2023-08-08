import { render, screen } from '@testing-library/react'

import config from 'config'

import { LoginProvidersEnum } from 'services/loginProviders'

import ProviderCard from './ProviderCard'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

describe('ProviderCard', () => {
  function setup({ provider, data }) {
    render(<ProviderCard provider={provider} providers={data} />)
  }

  describe('Bitbucket', () => {
    describe('when system is configured with Bitbucket', () => {
      beforeEach(() => {
        const data = ['BITBUCKET', 'BITBUCKET_SERVER']
        setup({ provider: LoginProvidersEnum.BITBUCKET, data })
      })

      it('renders external login button', () => {
        const element = screen.getByRole('link', {
          name: 'Login via Bitbucket',
        })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/bb`)
      })

      it('renders self hosted login link', () => {
        const element = screen.getByRole('link', {
          name: 'Login via Bitbucket Server',
        })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/bbs`)
      })
    })
  })

  describe('GitHub', () => {
    describe('when system is configured with GitHub', () => {
      beforeEach(() => {
        const data = ['GITHUB', 'GITHUB_ENTERPRISE']
        setup({ provider: LoginProvidersEnum.GITHUB, data })
      })

      it('renders external login button', () => {
        const element = screen.getByRole('link', { name: 'Login via GitHub' })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/gh`)
      })

      it('renders self hosted login link', () => {
        const element = screen.getByRole('link', {
          name: 'Login via GitHub Enterprise',
        })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/ghe`)
      })
    })
  })

  describe('GitLab', () => {
    describe('when system is configured with GitLab', () => {
      beforeEach(() => {
        const data = ['GITLAB', 'GITLAB_ENTERPRISE']
        setup({ provider: LoginProvidersEnum.GITLAB, data })
      })

      it('renders external login button', () => {
        const element = screen.getByRole('link', { name: 'Login via GitLab' })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/gl`)
      })

      it('renders self hosted login link', () => {
        const element = screen.getByRole('link', {
          name: 'Login via GitLab CE/EE',
        })
        expect(element).toBeInTheDocument()
        // This is supposed to have REACT_APP_API_URL in front of it, but a lot
        // of tests rely on that value being blank in `.env.test` so the test
        // appears to assert that it is a same-site URL.
        expect(element).toHaveAttribute('href', `${config.API_URL}/login/gle`)
      })
    })
  })
})
