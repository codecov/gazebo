import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'
import { LoginProvidersEnum } from 'shared/utils/loginProviders'

import ProviderCard, { InternalProviderButton } from './ProviderCard'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ThemeContextProvider>
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">{children}</Route>
    </MemoryRouter>
  </ThemeContextProvider>
)

describe('ProviderCard', () => {
  describe('Bitbucket', () => {
    describe('when system is configured with Bitbucket', () => {
      it('renders external login button', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.BITBUCKET}
            providers={['BITBUCKET']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', {
          name: 'Login via BitBucket',
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/bb')
      })

      it('renders self hosted login link', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.BITBUCKET}
            providers={['BITBUCKET_SERVER']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', {
          name: 'Login via BitBucket Server',
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/bbs')
      })
    })
  })

  describe('GitHub', () => {
    describe('when system is configured with GitHub', () => {
      it('renders external login button', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.GITHUB}
            providers={['GITHUB']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', { name: 'Login via GitHub' })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/gh')
      })

      it('renders self hosted login link', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.GITHUB}
            providers={['GITHUB_ENTERPRISE']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', {
          name: 'Login via GitHub Enterprise',
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/ghe')
      })
    })
  })

  describe('GitLab', () => {
    describe('when system is configured with GitLab', () => {
      it('renders external login button', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.GITLAB}
            providers={['GITLAB']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', { name: 'Login via GitLab' })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/gl')
      })

      it('renders self hosted login link', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.GITLAB}
            providers={['GITLAB_ENTERPRISE']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', {
          name: 'Login via GitLab CE/EE',
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/gle')
      })
    })
  })

  describe('Okta', () => {
    describe('when system is configured with Okta', () => {
      it('renders external login button', () => {
        render(
          <ProviderCard
            provider={LoginProvidersEnum.OKTA}
            providers={['OKTA']}
          />,
          { wrapper }
        )

        const element = screen.getByRole('link', { name: 'Login via Okta' })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', '/login/okta')
      })
    })

    it('InternalProviderButton returns null', () => {
      const { container } = render(
        <InternalProviderButton provider={LoginProvidersEnum.OKTA} />,
        { wrapper }
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
