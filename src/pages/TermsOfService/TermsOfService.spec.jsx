import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import TermsOfService from './TermsOfService'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
let errorMock

let testLocation = {
  pathname: '',
}

const wrapper = ({ children }) => (
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
})
afterAll(() => {
  server.close()
})

const mockedUserData = {
  email: null,
  name: null,
  externalId: null,
  owners: [],
  termsAgreement: false,
}

jest.mock('shared/featureFlags')

describe('TermsOfService', () => {
  beforeEach(() => jest.resetModules())

  function setup({
    internalUserData = mockedUserData,
    isValidationError = false,
    isUnAuthError = false,
    isUnknownError = false,
    termsOfServicePageFlag = true,
  } = {}) {
    const mockMutationVariables = jest.fn()
    const user = userEvent.setup()

    useFlags.mockReturnValue({
      termsOfServicePage: termsOfServicePageFlag,
    })

    server.use(
      rest.get('/internal/user', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(internalUserData))
      ),
      graphql.mutation('SigningTermsAgreement', (req, res, ctx) => {
        mockMutationVariables(req.variables)
        if (isUnAuthError) {
          return res(
            ctx.status(200),
            ctx.data({
              ...(req.variables?.tosInput && {
                saveTermsAgreement: {
                  error: {
                    __typename: 'UnauthenticatedError',
                    message: 'unauthenticatedError error',
                  },
                },
              }),
            })
          )
        }
        if (isValidationError) {
          return res(
            ctx.status(200),
            ctx.data({
              ...(req.variables?.tosInput && {
                saveTermsAgreement: {
                  __typename: 'ValidationError',
                  error: {
                    message: 'validation error',
                  },
                },
              }),
            })
          )
        }

        if (isUnknownError) {
          return res(
            ctx.status(500),
            ctx.errors([{ message: 'unknown error' }])
          )
        }
        return res(ctx.status(200), ctx.data({}))
      })
    )

    return { user, mockMutationVariables }
  }

  describe('page renders', () => {
    beforeEach(() =>
      setup({
        useUserData: {
          me: {
            email: 'chetney@cr.com',
            termsAgreement: false,
          },
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
    beforeEach(() => jest.resetAllMocks())

    // Into the realm of testing implementation details, but I want to make sure
    // that the correct inputs are being sent to the server.
    it('Sign TOS, sends the correct inputs to the server', async () => {
      const { user, mockMutationVariables } = setup({
        internalUserData: {
          email: 'personal@cr.com',
          name: 'Chetney',
          externalId: '1234',
          owners: [],
          termsAgreement: false,
        },
      })

      render(<TermsOfService />, { wrapper })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()

      const selectedTos = screen.getByLabelText(
        /I agree to the TOS and privacy policy/i
      )

      await user.click(selectedTos)

      const submit = await screen.findByRole('button', { name: /Continue/ })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          tosInput: {
            businessEmail: 'personal@cr.com',
            termsAgreement: true,
            marketingConsent: false,
          },
        })
      )
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
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
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
        },
      },
      [expectPageIsReady],
      [expectUserSelectsMarketingWithFoundEmail, { email: 'chetney@cr.com' }],
      [expectSubmitIsDisabled],
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
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSelectsMarketingWithFoundEmail, { email: 'chetney@cr.com' }],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
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
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
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
        },
      },
      [expectPageIsReady],
      [expectEmailRequired],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectSubmitIsDisabled],
    ],
    [
      'case #7',
      {
        validationDescription: 'server unknown error notification',
        isUnknownError: true,
        internalUserData: {
          termsAgreement: false,
          email: 'personal@cr.com',
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
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
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
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
        },
      },
      [expectPageIsReady],
      [expectUserSignsTOS],
      [expectClickSubmit],
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
          email: '',
          owners: [{ service: 'github', username: 'chetney' }],
        },
      },
      [expectRedirectTo, '/gh/codecov/cool-repo'],
    ],
  ])('form validation, %s', (_, initializeTest, ...steps) => {
    beforeEach(() => {
      const spy = jest.spyOn(console, 'error')
      errorMock = jest.fn()
      spy.mockImplementation(errorMock)
    })

    afterEach(() => {
      errorMock.mockReset()
    })

    describe(`
        Has signed in: ${!!initializeTest.internalUserData}
        Has a email via oauth: ${initializeTest.internalUserData?.email}
      `, () => {
      jest.mock('./hooks/useTermsOfService', () => ({
        useSaveTermsAgreement: jest.fn(() => ({ data: 'mocked' })),
      }))

      it(`scenario: ${initializeTest.validationDescription}`, async () => {
        const { user } = setup({
          isUnknownError: initializeTest.isUnknownError,
          isValidationError: initializeTest.isValidationError,
          isUnAuthError: initializeTest.isUnAuthError,
          internalUserData: initializeTest.internalUserData,
        })
        render(<TermsOfService />, { wrapper })

        for (const [step, args] of steps) {
          await step(user, args)
        }
      })
    })
  })
})

// Form validation assertion helper functions

async function expectPageIsReady() {
  const welcome = await screen.findByText(/Welcome to Codecov/i)
  expect(welcome).toBeInTheDocument()
}

async function expectUserSignsTOS(user) {
  const selectedTos = screen.getByLabelText(
    /I agree to the TOS and privacy policy/i
  )

  await user.click(selectedTos)
}

async function expectUserSelectsMarketingWithFoundEmail(user, args) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )
  const emailIsInTheLabelOfSelectedMarketing = screen.getByText(
    new RegExp(args.email, 'i')
  )
  expect(emailIsInTheLabelOfSelectedMarketing).toBeInTheDocument()

  await user.click(selectedMarketing)
}

async function expectUserSelectsMarketing(user, args) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )

  await user.click(selectedMarketing)
}

async function expectUserTextEntryEmailField(user, args) {
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

async function expectClickSubmit(user) {
  const submit = screen.getByRole('button', { name: /Continue/ })

  await user.click(submit)
}

async function expectEmailRequired(user) {
  const selectedMarketing = screen.getByLabelText(
    /I would like to receive updates via email/i
  )

  await user.click(selectedMarketing)

  const emailRequired = screen.getByText(/Contact email/i)
  expect(emailRequired).toBeInTheDocument()
}

async function expectRendersServerFailureResult(user, expectedError = {}) {
  expect(await screen.findByRole('button', { name: /Continue/ })).toBeTruthy()
  const submit = screen.getByRole('button', { name: /Continue/ })

  await user.click(submit)

  expect(
    await screen.findByText(
      /There was an error with our servers. Please try again later or/i
    )
  ).toBeTruthy()
  const error = screen.getByText(
    /There was an error with our servers. Please try again later or/i
  )
  expect(error).toBeInTheDocument()
  await waitFor(() => expect(errorMock).toBeCalled())
  await waitFor(() => expect(errorMock).toHaveBeenLastCalledWith(expectedError))

  const issueLink = screen.getByRole('link', { name: /contact support/i })
  expect(issueLink).toBeInTheDocument()
  expect(issueLink.href).toBe('https://codecovpro.zendesk.com/hc/en-us')
}

async function expectRedirectTo(user, to) {
  await waitFor(() => expect(testLocation.pathname).toBe(to))
}
