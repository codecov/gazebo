import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import SelfHostedLicenseExpiration from './SelfHostedLicenseExpiration'

jest.mock('config')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = ['/gh/test-org']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('SelfHostedLicenseExpiration', () => {
  function setup({
    isUndefined = false,
    seatsLimit = 50,
    seatsUsed = 10,
    expirationDate = '2020-05-09T00:00:00',
  }) {
    const user = userEvent.setup({ delay: null })

    server.use(
      graphql.query('SelfHostedSeatsAndLicense', (req, res, ctx) => {
        if (isUndefined) {
          return res(ctx.status(200), ctx.data({ config: undefined }))
        }

        return res(
          ctx.status(200),
          ctx.data({
            config: {
              seatsLimit,
              seatsUsed,
              selfHostedLicense: {
                expirationDate,
              },
            },
          })
        )
      })
    )

    return { user }
  }

  describe('cloud mode', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = false
      setup({ isUndefined: true })
    })
    afterEach(() => jest.resetAllMocks())

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

  describe('self hosted with invalid data params', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })
    afterEach(() => jest.resetAllMocks())

    it('does not render when there is no provider', () => {
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

  describe('self hosted with correct params', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-08-01'))
    })
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })
    afterEach(() => jest.resetAllMocks())

    it('does not render the banner when it should not be displayed', async () => {
      setup({
        seatsUsed: 5,
        seatsLimit: 10,
        expirationDate: '2023-08-09T00:00:00',
      })
      render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

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

      describe('when resolve issue button is clicked', () => {
        it('renders the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedText = await screen.findByText(
            /Seat limit reached/
          )
          expect(seatsLimitReachedText).toBeInTheDocument()
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

      describe('when resolve issue button is clicked', () => {
        it('renders the seat limit reached section', async () => {
          const { user } = setup(params)
          render(<SelfHostedLicenseExpiration />, { wrapper: wrapper() })

          const resolveIssueButton = await screen.findByRole('button', {
            name: /Resolve issue/,
          })
          expect(resolveIssueButton).toBeInTheDocument()

          await user.click(resolveIssueButton)

          const seatsLimitReachedText = await screen.findByText(
            /Seat limit reached/
          )
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

      describe('when resolve issue button is clicked', () => {
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

      describe('when resolve issue button is clicked', () => {
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
