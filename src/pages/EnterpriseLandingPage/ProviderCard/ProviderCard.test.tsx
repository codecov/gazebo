import { render, screen } from '@testing-library/react'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { EnterpriseLoginProviders } from 'services/config/LoginProvidersQueryOpts'
import { ThemeContextProvider } from 'shared/ThemeContext'
import { LoginProvidersEnum } from 'shared/utils/loginProviders'

import ProviderCard from './ProviderCard'

vi.mock('config')
config.API_URL = 'secret-api-url'

const { location } = window
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { ...location, protocol: 'http:', host: 'secret-api-url' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { value: location })
})

const wrapper =
  (initialEntries = '/'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <ThemeContextProvider>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/">{children}</Route>
      </MemoryRouter>
    </ThemeContextProvider>
  )

type LoginProviders = typeof LoginProvidersEnum

type Provider = {
  [K in keyof LoginProviders]: LoginProviders[K]
}[keyof LoginProviders]

describe('ProviderCard', () => {
  interface Case {
    provider: Provider
    name: string
    providers: Array<EnterpriseLoginProviders>
    to: string
  }

  const cases: Case[] = [
    {
      provider: LoginProvidersEnum.BITBUCKET,
      name: LoginProvidersEnum.BITBUCKET.name,
      providers: ['BITBUCKET'],
      to: '/login/bb',
    },
    {
      provider: LoginProvidersEnum.BITBUCKET,
      name: LoginProvidersEnum.BITBUCKET.selfHostedName,
      providers: ['BITBUCKET_SERVER'],
      to: '/login/bbs',
    },
    {
      provider: LoginProvidersEnum.GITHUB,
      name: LoginProvidersEnum.GITHUB.name,
      providers: ['GITHUB'],
      to: '/login/gh',
    },
    {
      provider: LoginProvidersEnum.GITHUB,
      name: LoginProvidersEnum.GITHUB.selfHostedName,
      providers: ['GITHUB_ENTERPRISE'],
      to: '/login/ghe',
    },
    {
      provider: LoginProvidersEnum.GITLAB,
      name: LoginProvidersEnum.GITLAB.name,
      providers: ['GITLAB'],
      to: '/login/gl',
    },
    {
      provider: LoginProvidersEnum.GITLAB,
      name: LoginProvidersEnum.GITLAB.selfHostedName,
      providers: ['GITLAB_ENTERPRISE'],
      to: '/login/gle',
    },
    {
      provider: LoginProvidersEnum.OKTA,
      name: LoginProvidersEnum.OKTA.name,
      providers: ['OKTA'],
      to: '/login/okta',
    },
  ]

  describe.each(cases)('$name', ({ provider, providers, to, name }) => {
    describe('when system is configured with $providers.[0]', () => {
      it('renders the correct login button', () => {
        render(<ProviderCard provider={provider} providers={providers} />, {
          wrapper: wrapper(),
        })

        const element = screen.getByRole('link', {
          name: `Login via ${name}`,
        })
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute('href', `secret-api-url${to}`)
      })
    })
  })

  describe('when to param is provided', () => {
    interface Case {
      provider: typeof LoginProvidersEnum.GITHUB
      isSelfHosted: boolean
      name: string
      providers: Array<EnterpriseLoginProviders>
      to: string
    }

    const cases: Case[] = [
      {
        provider: LoginProvidersEnum.GITHUB,
        isSelfHosted: false,
        name: LoginProvidersEnum.GITHUB.name,
        providers: ['GITHUB'],
        to: '/login/gh',
      },
      {
        provider: LoginProvidersEnum.GITHUB,
        isSelfHosted: true,
        name: LoginProvidersEnum.GITHUB.selfHostedName,
        providers: ['GITHUB_ENTERPRISE'],
        to: '/login/ghe',
      },
    ]

    describe.each(cases)(
      '$name',
      ({ provider, providers, name, isSelfHosted }) => {
        describe(`is ${isSelfHosted ? 'self hosted' : 'external'} provider`, () => {
          it('appends redirect param to the login url', () => {
            const key = isSelfHosted
              ? provider.selfHostedKey
              : provider.externalKey
            const queryString = qs.stringify(
              { to: `/${key}/codecov/gazebo` },
              { addQueryPrefix: true }
            )

            render(<ProviderCard provider={provider} providers={providers} />, {
              wrapper: wrapper(`/login/${key}${queryString}`),
            })

            const redirectURL = qs.stringify(
              { to: `http://secret-api-url/${key}${queryString}` },
              { addQueryPrefix: true }
            )

            const element = screen.getByRole('link', {
              name: `Login via ${name}`,
            })
            expect(element).toBeInTheDocument()
            expect(element).toHaveAttribute(
              'href',
              `secret-api-url/login/${key}${redirectURL}`
            )
          })
        })
      }
    )
  })
})
