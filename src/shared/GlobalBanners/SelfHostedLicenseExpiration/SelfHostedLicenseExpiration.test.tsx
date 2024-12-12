import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import SelfHostedLicenseExpiration from './SelfHostedLicenseExpiration'

vi.mock('config')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = ['/gh/test-org']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Suspense fallback={<p>Loading</p>}>
            <Route path="/:provider/:owner">{children}</Route>
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isUndefined?: boolean
  seatsLimit?: number | null
  seatsUsed?: number | null
  expirationDate?: string | null
}

describe('SelfHostedLicenseExpiration', () => {
  function setup({
    isUndefined = false,
    seatsLimit = 50,
    seatsUsed = 10,
    expirationDate = '2020-05-09T00:00:00',
  }: SetupArgs) {
    const user = userEvent.setup({ delay: null })

    server.use(
      graphql.query('SelfHostedSeatsAndLicense', () => {
        if (isUndefined) {
          return HttpResponse.json({ data: { config: undefined } })
        }

        return HttpResponse.json({
          data: {
            config: {
              seatsLimit,
              seatsUsed,
              selfHostedLicense: {
                expirationDate,
              },
            },
          },
        })
      })
    )

    return { user }
  }

  describe('cloud mode', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = false
      config.IS_DEDICATED_NAMESPACE = false
      setup({ isUndefined: true })
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('does not render when there is no provider', () => {
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
    })

    it('does not render the banner info when a provider is present', () => {
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

      const resolveIssue = screen.queryByText(/Resolve issue/)
      expect(resolveIssue).not.toBeInTheDocument()
    })
  })

  describe('self hosted and ECDN with invalid data params', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    it('does not render the banner when it is self-hosted but not ECDN', async () => {
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = false
      setup({
        seatsUsed: 5,
        seatsLimit: 4,
        expirationDate: '2020-05-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })

    it('does not render when there is no provider', () => {
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = true
      setup({
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: '2020-05-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })

    it('does not render the banner when there is no license expiration date', async () => {
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = true
      setup({
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: null,
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })

    it('does not render the banner when there are no seats used', async () => {
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = true
      setup({
        seatsUsed: null,
        seatsLimit: 10,
        expirationDate: '2020-05-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })

    it('does not render the banner when there are no seat limit', async () => {
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = true
      setup({
        seatsUsed: 5,
        seatsLimit: null,
        expirationDate: '2020-05-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper(['']) })

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })
  })

  describe('self hosted and ECDN with correct params', () => {
    beforeAll(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-08-01'))
      config.IS_SELF_HOSTED = true
      config.IS_DEDICATED_NAMESPACE = true
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('does not render the banner when there is not a seat limit or when the license has not expired/will expire within 30 days', async () => {
      setup({
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: '2024-08-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

      const suspense = await screen.findByText('Loading')
      expect(suspense).toBeInTheDocument()

      await waitFor(() =>
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
      )

      const resolveIssueButton = screen.queryByText(/Resolve issue/)
      expect(resolveIssueButton).not.toBeInTheDocument()
    })

    describe('when license is expired and seats limit is reached', () => {
      const params = {
        seatsUsed: 10,
        seatsLimit: 10,
        expirationDate: '2023-07-09T00:00:00',
      }

      it('renders the appropriate banner text', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const bannerText = await screen.findByText(
          /Your organization's license has expired and seat count has been reached./
        )
        expect(bannerText).toBeInTheDocument()
      })

      it('renders the resolve issue button', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const resolveIssueButton = await screen.findByRole('button', {
          name: /Resolve issue/,
        })
        expect(resolveIssueButton).toBeInTheDocument()
      })

      describe('when resolve issue button is clicked and modal is opened', () => {
        it('renders the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedTitle =
            await screen.findByText(/Seat limit reached/)
          expect(seatsLimitReachedTitle).toBeInTheDocument()

          const seatsLimitReachedText = await screen.findByText(
            /All of the seats on the organization's plan have been used./
          )
          expect(seatsLimitReachedText).toBeInTheDocument()

          const supportLink = await screen.findByRole('link', {
            name: /support@codecov.io/,
          })
          expect(supportLink).toBeInTheDocument()
          expect(supportLink).toHaveAttribute(
            'href',
            'mailto:support@codecov.io'
          )
        })

        it('renders the license renewal section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const licenseRenewalTitle = await screen.findByText(/License renewal/)
          expect(licenseRenewalTitle).toBeInTheDocument()

          const licenseRenewalText = await screen.findByText(
            /Your license is about to expire. To avoid any interruption in service, please renew your license promptly. /
          )
          expect(licenseRenewalText).toBeInTheDocument()

          const stepsLink = await screen.findByRole('link', {
            name: /these steps/,
          })
          expect(stepsLink).toBeInTheDocument()
          expect(stepsLink).toHaveAttribute(
            'href',
            'https://github.com/codecov/self-hosted/tree/main#license-generation'
          )
        })

        it('renders the control and customization section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const controlAndCustomizationTitle = await screen.findByText(
            /Looking for more control and customization?/
          )
          expect(controlAndCustomizationTitle).toBeInTheDocument()

          const controlAndCustomizationText = await screen.findByText(
            /Consider setting up a/
          )
          expect(controlAndCustomizationText).toBeInTheDocument()

          const dedicatedNamespaceLink = await screen.findByRole('link', {
            name: /dedicated namespace/,
          })
          expect(dedicatedNamespaceLink).toBeInTheDocument()
          expect(dedicatedNamespaceLink).toHaveAttribute(
            'href',
            'https://docs.codecov.com/docs/codecov-dedicated-enterprise-cloud-install-steps'
          )
        })

        it('renders the Generate New License button', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const generateNewLicenseLink = await screen.findByRole('link', {
            name: /Generate New License/,
          })
          expect(generateNewLicenseLink).toBeInTheDocument()
          expect(generateNewLicenseLink).toHaveAttribute(
            'href',
            'https://github.com/codecov/self-hosted/tree/main#license-generation'
          )
        })

        it('closes the modal when pressing the x button', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()
          await user.click(resolveIssueButton)

          const xButton = screen.getByLabelText('Close')
          await user.click(xButton)

          const seatsLimitReachedTitle =
            screen.queryByText(/Seat limit reached/)
          expect(seatsLimitReachedTitle).not.toBeInTheDocument()
        })
      })
    })

    describe('when seats limit is reached', () => {
      const params = {
        seatsUsed: 10,
        seatsLimit: 10,
        expirationDate: '2025-07-09T00:00:00',
      }

      it('renders the appropriate banner text', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const bannerText = await screen.findByText(
          /Your organization's seat count has been reached./
        )
        expect(bannerText).toBeInTheDocument()
      })

      it('renders the resolve issue button', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const resolveIssueButton = await screen.findByRole('button', {
          name: /Resolve issue/,
        })
        expect(resolveIssueButton).toBeInTheDocument()
      })

      describe('when resolve issue button is clicked and modal is opened', () => {
        it('renders the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedText =
            await screen.findByText(/Seat limit reached/)
          expect(seatsLimitReachedText).toBeInTheDocument()
        })

        it('does not render the license renewal section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const licenseRenewalText = screen.queryByText(/License renewal/)
          expect(licenseRenewalText).not.toBeInTheDocument()
        })

        it('renders the control and customization section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const controlAndCustomizationText = await screen.findByText(
            /Looking for more control and customization?/
          )
          expect(controlAndCustomizationText).toBeInTheDocument()
        })
      })
    })

    describe('when license is expiring within 30 days', () => {
      const params = {
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: '2023-08-06T00:00:00',
      }

      it('renders the appropriate banner text', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const bannerText = await screen.findByText(
          /Your organization's license ends in 5 days./
        )
        expect(bannerText).toBeInTheDocument()
      })

      it('renders the resolve issue button', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const resolveIssueButton = await screen.findByRole('button', {
          name: /Resolve issue/,
        })
        expect(resolveIssueButton).toBeInTheDocument()
      })

      describe('when resolve issue button is clicked and modal is opened', () => {
        it('does not render the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedText = screen.queryByText(/Seat limit reached/)
          expect(seatsLimitReachedText).not.toBeInTheDocument()
        })

        it('renders the license renewal section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const licenseRenewalText = await screen.findByText(/License renewal/)
          expect(licenseRenewalText).toBeInTheDocument()
        })

        it('renders the control and customization section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const controlAndCustomizationText = await screen.findByText(
            /Looking for more control and customization?/
          )
          expect(controlAndCustomizationText).toBeInTheDocument()
        })
      })
    })

    describe('when license is expired', () => {
      const params = {
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: '2023-07-09T00:00:00',
      }

      it('renders the appropriate banner text', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const bannerText = await screen.findByText(
          /Your organization's license has expired./
        )
        expect(bannerText).toBeInTheDocument()
      })

      it('renders the resolve issue button', async () => {
        setup(params)
        render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

        const resolveIssueButton = await screen.findByRole('button', {
          name: /Resolve issue/,
        })
        expect(resolveIssueButton).toBeInTheDocument()
      })

      describe('when resolve issue button is clicked and modal is opened', () => {
        it('does not render the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedText = screen.queryByText(/Seat limit reached/)
          expect(seatsLimitReachedText).not.toBeInTheDocument()
        })

        it('renders the license renewal section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const licenseRenewalText = await screen.findByText(/License renewal/)
          expect(licenseRenewalText).toBeInTheDocument()
        })

        it('renders the control and customization section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const controlAndCustomizationText = await screen.findByText(
            /Looking for more control and customization?/
          )
          expect(controlAndCustomizationText).toBeInTheDocument()
        })
      })
    })
  })
})
