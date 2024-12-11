import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import config from 'config'

import { SentryBugReporter } from 'sentry'

import { InternalUserData } from 'services/user/useInternalUser'

import TermsOfService from './TermsOfService'

vi.mock('config')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
let errorMock: Mock

type TestStep = (user: UserEvent, args?: { email: string }) => Promise<void>

let testLocation = {
  pathname: '',
} as { pathname: string }

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <Route path="/:provider/:owner/:repo">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => {
  server.close()
})

const mockedUserData = {
  email: null,
  name: null,
  externalId: null,
  owners: null,
  termsAgreement: false,
}

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

interface Setup {
  internalUserData?: InternalUserData
  isValidationError?: boolean
  isUnAuthError?: boolean
  isUnknownError?: boolean
  termsOfServicePageFlag?: boolean
}

describe('TermsOfService', () => {
  function setup({
    internalUserData = mockedUserData,
    isValidationError = false,
    isUnAuthError = false,
    isUnknownError = false,
    termsOfServicePageFlag = true,
  }: Setup = {}) {
    const mockMutationVariables = vi.fn()
    const user = userEvent.setup()

    mocks.useFlags.mockReturnValue({
      termsOfServicePage: termsOfServicePageFlag,
    })

    server.use(
      http.get('/internal/user', () => {
        return HttpResponse.json({ ...mockedUserData, ...internalUserData })
      }),
      graphql.mutation('SigningTermsAgreement', (info) => {
        mockMutationVariables(info.variables)
        if (isUnAuthError) {
          return HttpResponse.json({
            data: {
              ...(info.variables?.tosInput && {
                saveTermsAgreement: {
                  error: {
                    __typename: 'UnauthenticatedError',
                    message: 'unauthenticatedError error',
                  },
                },
              }),
            },
          })
        }
        if (isValidationError) {
          return HttpResponse.json({
            data: {
              ...(info.variables?.tosInput && {
                saveTermsAgreement: {
                  __typename: 'ValidationError',
                  error: {
                    message: 'validation error',
                  },
                },
              }),
            },
          })
        }

        if (isUnknownError) {
          return HttpResponse.json(
            { errors: [{ message: 'unknown error' }] },
            { status: 500 }
          )
        }
        return HttpResponse.json({ data: {} })
      })
    )

    return { user, mockMutationVariables }
  }

  describe('page renders', () => {
    beforeEach(() =>
      setup({
        internalUserData: {
          email: '',
          name: '',
          externalId: '',
          owners: null,
          termsAgreement: false,
        },
      })
    )

    it('only renders the component after a valid user is returned from the useUser hook', async () => {
      render(<TermsOfService />, { wrapper })

      let welcome = screen.queryByText(/Welcome to Codecov/i)
      expect(welcome).not.toBeInTheDocument()

      welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()
    })

    it('renders welcome message', async () => {
      render(<TermsOfService />, { wrapper })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()
    })

    it('renders img of Codecov umbrella', async () => {
      render(<TermsOfService />, { wrapper })

      const umbrella = await screen.findByRole('img', {
        name: /codecov-umbrella/i,
      })
      expect(umbrella).toBeInTheDocument()
    })

    it('submit button is disabled initially', async () => {
      render(<TermsOfService />, { wrapper })

      const submit = await screen.findByRole('button', { name: /Continue/ })
      expect(submit).toBeDisabled()
    })

    it('links to the privacy policy', async () => {
      render(<TermsOfService />, { wrapper })

      const privacyPolicy = await screen.findByRole('link', {
        name: /Privacy Policy/i,
      })
      expect(privacyPolicy).toHaveAttribute(
        'href',
        'https://about.codecov.io/privacy'
      )
    })

    it('links to the terms of service', async () => {
      render(<TermsOfService />, { wrapper })

      const termsOfService = await screen.findByRole('link', {
        name: /Terms of Service/i,
      })
      expect(termsOfService).toHaveAttribute(
        'href',
        'https://about.codecov.io/terms-of-service'
      )
    })
  })

  describe('on submit', () => {
    beforeEach(() => vi.resetAllMocks())

    // Into the realm of testing implementation details, but I want to make sure
    // that the correct inputs are being sent to the server.
    it('Sign TOS, sends the correct inputs to the server', async () => {
      const { user, mockMutationVariables } = setup({
        internalUserData: {
          email: 'personal@cr.com',
          name: 'Chetney',
          externalId: '1234',
          owners: null,
          termsAgreement: false,
        },
      })

      render(<TermsOfService />, { wrapper })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()

      const selectedTos = screen.getByLabelText(
        /I agree to the TOS and privacy policy/i
      )

      const customerIntent = screen.getByRole('radio', { name: /Personal use/ })
      await user.click(customerIntent)

      await user.click(selectedTos)

      const submit = await screen.findByRole('button', { name: /Continue/ })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          tosInput: {
            businessEmail: 'personal@cr.com',
            termsAgreement: true,
            marketingConsent: false,
            customerIntent: 'PERSONAL',
          },
        })
      )
    })
  })

  describe('on back', () => {
    it('sends user back to the login page', async () => {
      render(<TermsOfService />, { wrapper })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()

      const back = await screen.findByRole('link', { name: /Back/ })
      await userEvent.click(back)

      expect(testLocation.pathname).toBe('/login')
    })
  })

  /*
   * This is to test the various form validation edge cases case with different data.
   * The describe.each function takes an array of arrays, each array is a test case.
   *
   * The first element of each array is the test case name (mostly for identifying broken tests
   * in the future), the second element is the test setup data. Any following arguments is an array
   * of async test assertion functions that will be called in order.
   *
   */
  describe.each([
    [
      'case #1',
      {
        validationDescription:
          'user has email, signs TOS, submit is now enabled',
        internalUserData: {
          email: 'personal@cr.com',
          termsAgreement: false,
          externalId: '1234',
          owners: null,
          name: 'Chetney',
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectUserToChooseCustomerIntent],
      [expectSubmitIsEnabled],
    ],
    [
      'case #2',
      {
        validationDescription:
          'user wants to receive emails, signs TOS, submit is now enabled',
        internalUserData: {
          email: 'chetney@cr.com',
          termsAgreement: false,
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectUserSelectsMarketingWithFoundEmail, { email: 'chetney@cr.com' }],
      [expectSubmitIsDisabled],
      [expectUserToChooseCustomerIntent],
      [expectUserSignsTOS],
      [expectSubmitIsEnabled],
    ],
    [
      'case #3',
      {
        validationDescription:
          'user has email, user wants to receive emails, signs TOS, submit is now enabled',
        internalUserData: {
          email: 'chetney@cr.com',
          termsAgreement: false,
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSelectsMarketingWithFoundEmail, { email: 'chetney@cr.com' }],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectUserToChooseCustomerIntent],
      [expectSubmitIsEnabled],
    ],
    [
      'case #4',
      {
        validationDescription:
          'signs TOS, decides not to, is warned they must sign and cannot submit',
        internalUserData: {
          email: 'chetney@cr.com',
          termsAgreement: false,
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserToChooseCustomerIntent],
      [expectUserSignsTOS],
      [expectSubmitIsEnabled],
      [expectUserSignsTOS],
      [expectSubmitIsDisabled],
      [expectUserIsWarnedTOS],
    ],
    [
      'case #5',
      {
        validationDescription:
          'user checks marketing consent and is required to provide an email, sign TOS (check email validation messages)',
        internalUserData: {
          termsAgreement: false,
          name: 'Chetney',
          externalId: '1234',
          owners: null,
          email: '',
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectEmailRequired],
      [expectUserTextEntryEmailField, { email: 'chetney' }],
      [expectUserIsWarnedForValidEmail],
      [expectSubmitIsDisabled],
      [expectUserTextEntryEmailField, { email: '@cr.com' }],
      [expectUserIsNotWarnedForValidEmail],
      [expectSubmitIsDisabled],
      [expectUserSelectsMarketing],
      [expectSubmitIsDisabled],
      [expectUserToChooseCustomerIntent],
      [expectUserSignsTOS],
      [expectSubmitIsEnabled],
    ],
    [
      'case #6',
      {
        validationDescription:
          'user checks marketing consent and does not provide an email, sign TOS (check email validation messages)',
        internalUserData: {
          termsAgreement: false,
          email: '',
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectEmailRequired],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectSubmitIsDisabled],
      [expectUserToChooseCustomerIntent],
    ],
    [
      'case #7',
      {
        validationDescription: 'server unknown error notification',
        isUnknownError: true,
        internalUserData: {
          termsAgreement: false,
          email: 'personal@cr.com',
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
      [expectUserToChooseCustomerIntent],
      [
        expectRendersServerFailureResult,
        {
          data: {
            errors: [
              {
                message: 'unknown error',
              },
            ],
          },
          status: 500,
        },
      ],
    ],
    [
      'case #8',
      {
        validationDescription: 'server failure error notification',
        isUnAuthError: true,
        internalUserData: {
          termsAgreement: false,
          email: 'personal@cr.com',
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
      [expectUserToChooseCustomerIntent],
      [
        expectRendersServerFailureResult,
        {
          __typename: 'UnauthenticatedError',
          message: 'unauthenticatedError error',
        },
      ],
    ],
    [
      'case #9',
      {
        validationDescription:
          'server validation error notification (saveTerms)',
        isValidationError: true,
        internalUserData: {
          termsAgreement: false,
          email: 'personal@cr.com',
          name: 'Chetney',
          externalId: '1234',
          owners: null,
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
      [expectUserToChooseCustomerIntent],
      [expectRendersServerFailureResult, 'validation error'],
    ],
    [
      'case #10',
      {
        validationDescription:
          'redirects to main root if user has already synced a provider',
        isValidationError: true,
        internalUserData: {
          termsAgreement: true,
          name: 'Chetney',
          externalId: '1234',
          email: '',
          owners: [
            {
              avatarUrl: 'http://127.0.0.1/avatar-url',
              integrationId: null,
              name: null,
              ownerid: 2,
              stats: null,
              service: 'github',
              username: 'chetney',
            },
          ],
        },
      },
      [expectRedirectTo, '/gh/codecov/cool-repo'],
    ],
    [
      'case #11',
      {
        validationDescription: 'provide no customer intent, does not submit',
        internalUserData: {
          termsAgreement: true,
          name: 'Chetney',
          externalId: '1234',
          email: '',
          owners: [
            {
              avatarUrl: 'http://roland.com/avatar-url',
              integrationId: null,
              name: null,
              ownerid: 2,
              stats: null,
              service: 'github',
              username: 'roland',
            },
          ],
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectSubmitIsDisabled],
    ],
  ])(
    'form validation, %s',
    (
      _,
      initializeTest: {
        internalUserData: InternalUserData
        validationDescription: string
        isValidationError?: boolean
        isUnAuthError?: boolean
        isUnknownError?: boolean
      },
      ...steps
    ) => {
      beforeEach(() => {
        const spy = vi.spyOn(console, 'error')
        errorMock = vi.fn()
        spy.mockImplementation(errorMock)
      })

      afterEach(() => {
        errorMock.mockReset()
      })

      describe(`
        Has signed in: ${!!initializeTest.internalUserData}
        Has a email via oauth: ${initializeTest.internalUserData?.email}
      `, () => {
        it(`scenario: ${initializeTest.validationDescription}`, async () => {
          const { user } = setup({
            isUnknownError: initializeTest?.isUnknownError,
            isValidationError: initializeTest?.isValidationError,
            isUnAuthError: initializeTest?.isUnAuthError,
            internalUserData: initializeTest.internalUserData,
          })
          render(<TermsOfService />, { wrapper })

          for (const [step, args] of steps as Array<
            [TestStep, { email: string }]
          >) {
            await step(user, args)
          }
        })
      })
    }
  )

  describe('sentry user feedback widget', () => {
    describe('when SENTRY_DSN is not defined', () => {
      it('does not render', async () => {
        setup({
          internalUserData: {
            email: '',
            name: '',
            externalId: '',
            owners: null,
            termsAgreement: false,
          },
        })
        const removeFromDom = vi.fn()
        const createWidget = vi.fn().mockReturnValue({
          removeFromDom,
        })
        SentryBugReporter.createWidget = createWidget
        render(<TermsOfService />, { wrapper })

        const welcome = await screen.findByText(/Welcome to Codecov/i)
        expect(welcome).toBeInTheDocument()

        expect(createWidget).not.toHaveBeenCalled()
        expect(removeFromDom).not.toHaveBeenCalled()
      })
    })

    describe('when SENTRY_DSN is defined', () => {
      it('renders', async () => {
        setup({
          internalUserData: {
            email: '',
            name: '',
            externalId: '',
            owners: null,
            termsAgreement: false,
          },
        })
        config.SENTRY_DSN = 'dsn'
        const removeFromDom = vi.fn()
        const createWidget = vi.fn().mockReturnValue({
          removeFromDom,
        })
        SentryBugReporter.createWidget = createWidget
        render(<TermsOfService />, { wrapper })

        const welcome = await screen.findByText(/Welcome to Codecov/i)
        expect(welcome).toBeInTheDocument()

        expect(createWidget).toHaveBeenCalled()
        expect(removeFromDom).not.toHaveBeenCalled()
      })

      describe('and component unmounts', () => {
        it('removes the widget from the dom', async () => {
          setup({
            internalUserData: {
              email: '',
              name: '',
              externalId: '',
              owners: null,
              termsAgreement: false,
            },
          })
          config.SENTRY_DSN = 'dsn'
          const removeFromDom = vi.fn()
          const createWidget = vi.fn().mockReturnValue({
            removeFromDom,
          })
          SentryBugReporter.createWidget = createWidget
          const view = render(<TermsOfService />, { wrapper })

          const welcome = await screen.findByText(/Welcome to Codecov/i)
          expect(welcome).toBeInTheDocument()

          expect(createWidget).toHaveBeenCalled()
          expect(removeFromDom).not.toHaveBeenCalled()

          view.unmount()

          expect(removeFromDom).toHaveBeenCalled()
        })
      })
    })
  })
})

// Form validation assertion helper functions

async function expectPageIsReady() {
  const welcome = await screen.findByText(/Welcome to Codecov/i)
  expect(welcome).toBeInTheDocument()
}

async function expectUserToChooseCustomerIntent(user: UserEvent) {
  const customerIntent = screen.getByRole('radio', { name: /Personal use/ })

  await user.click(customerIntent)
}

async function expectUserSignsTOS(user: UserEvent) {
  const selectedTos = screen.getByLabelText(
    /I agree to the TOS and privacy policy/i
  )

  await user.click(selectedTos)
}

async function expectUserSelectsMarketingWithFoundEmail(
  user: UserEvent,
  args: { email: string }
) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )
  const emailIsInTheLabelOfSelectedMarketing = screen.getByText(
    new RegExp(args.email, 'i')
  )
  expect(emailIsInTheLabelOfSelectedMarketing).toBeInTheDocument()

  await user.click(selectedMarketing)
}

async function expectUserSelectsMarketing(user: UserEvent) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )

  await user.click(selectedMarketing)
}

async function expectUserTextEntryEmailField(
  user: UserEvent,
  args: { email: string }
) {
  const emailInput = screen.getByLabelText(/Contact email/i)

  await user.type(emailInput, args.email)
}

async function expectSubmitIsDisabled() {
  const submit = screen.getByRole('button', { name: /Continue/ })
  expect(submit).toBeDisabled()
}

async function expectSubmitIsEnabled() {
  const submit = screen.getByRole('button', { name: /Continue/ })
  expect(submit).toBeEnabled()
}

async function expectUserIsWarnedTOS() {
  const warning = screen.getByText(/You must accept Terms and Conditions./i)
  expect(warning).toBeInTheDocument()
}

async function expectUserIsWarnedForValidEmail() {
  const warning = screen.getByText(/Invalid email/i)
  expect(warning).toBeInTheDocument()
}

async function expectUserIsNotWarnedForValidEmail() {
  const warning = screen.queryByText(/Invalid email/i)
  expect(warning).not.toBeInTheDocument()
}

async function expectClickSubmit(user: UserEvent) {
  const submit = screen.getByRole('button', { name: /Continue/ })

  await user.click(submit)
}

async function expectEmailRequired(user: UserEvent) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )

  await user.click(selectedMarketing)

  const emailRequired = screen.getByText(/Contact email/i)
  expect(emailRequired).toBeInTheDocument()
}

async function expectRendersServerFailureResult(
  user: UserEvent,
  expectedError = {}
) {
  const submit = await screen.findByRole('button', { name: /Continue/ })

  await user.click(submit)

  const error = await screen.findByText(
    /There was an error with our servers. Please try again later or/i
  )
  expect(error).toBeInTheDocument()
  await waitFor(() => expect(errorMock).toHaveBeenCalled())
  await waitFor(() => expect(errorMock).toHaveBeenLastCalledWith(expectedError))

  const issueLink = screen.getByRole('link', { name: /contact support/i })
  expect(issueLink).toBeInTheDocument()
  expect(issueLink).toHaveAttribute(
    'href',
    'https://codecovpro.zendesk.com/hc/en-us'
  )
}

async function expectRedirectTo(user: UserEvent, to: string) {
  await waitFor(() => expect(testLocation.pathname).toBe(to))
}
