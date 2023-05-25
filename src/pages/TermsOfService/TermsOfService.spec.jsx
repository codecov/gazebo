import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { trackSegmentEvent } from 'services/tracking/segment'

import TermsOfService from './TermsOfService'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

jest.mock('services/tracking/segment')

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
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
afterAll(() => server.close())
describe('TermsOfService', () => {
  beforeEach(() => jest.resetModules())
  function setup({
    myOrganizationsData,
    useUserData,
    isValidationError = false,
    isUnAuthError = false,
    isUnknownError = false,
  }) {
    const mockMutationVariables = jest.fn()
    const user = userEvent.setup()

    server.use(
      graphql.query('UseMyOrganizations', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(myOrganizationsData))
      }),
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(useUserData))
      }),
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
              ...(req.variables?.defaultOrgInput && {
                updateDefaultOrganization: {
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
              ...(req.variables?.defaultOrgInput && {
                updateDefaultOrganization: {
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
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })
    )

    it('only renders the component after a valid user is returned from the useUser hook', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      let welcome = screen.queryByText(/Welcome to Codecov/i)
      expect(welcome).not.toBeInTheDocument()

      welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()
    })

    it('renders welcome message', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()
    })

    it('submit button is disabled initially', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', { name: /Continue/ })
      expect(submit).toBeDisabled()
    })

    it('links to the privacy policy', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const privacyPolicy = await screen.findByRole('link', {
        name: /Privacy Policy/i,
      })
      expect(privacyPolicy).toHaveAttribute(
        'href',
        'https://about.codecov.io/privacy'
      )
    })

    it('links to the terms of service', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const termsOfService = await screen.findByRole('link', {
        name: /Terms of Service/i,
      })
      expect(termsOfService).toHaveAttribute(
        'href',
        'https://about.codecov.io/terms-of-service'
      )
    })

    it('links to help finding your org', async () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const helpFindingOrg = await screen.findByRole('link', {
        name: /Help finding org/i,
      })
      expect(helpFindingOrg).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/video-guide-connecting-codecov-to-github'
      )
    })
  })

  describe('on submit', () => {
    beforeEach(() => jest.resetAllMocks())

    it('tracks the segment event', async () => {
      const segmentMock = jest.fn()
      trackSegmentEvent.mockReturnValue(segmentMock)

      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<TermsOfService />, { wrapper: wrapper() })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()

      const selectedMarketing = screen.getByLabelText(
        /I would like to receive updates via email/i
      )

      await user.click(selectedMarketing)

      const selectedTos = screen.getByLabelText(
        /I agree to the TOS and privacy policy/i
      )

      await user.click(selectedTos)

      const submit = await screen.findByRole('button', { name: /Continue/ })

      await user.click(submit)

      expect(trackSegmentEvent).toHaveBeenLastCalledWith({
        event: 'Onboarding email opt in',
        data: {
          email: 'personal@cr.com',
          ownerid: '1234',
          username: 'chetney',
        },
      })
    })

    // Into the realm of testing implementation details, but I want to make sure
    // that the correct inputs are being sent to the server.
    it('Sign TOS, sends the correct inputs to the server', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<TermsOfService />, { wrapper: wrapper() })

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
          },
        })
      )
    })

    it('Sign TOS, select a default org, sends the correct inputs to the server', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<TermsOfService />, { wrapper: wrapper() })

      const welcome = await screen.findByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()

      const select = screen.getByRole('button', {
        name: 'Select an organization',
      })

      await user.click(select)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })

      await user.click(orgInList)

      const selected = screen.getByText(new RegExp('criticalRole', 'i'))
      expect(selected).toBeInTheDocument()

      const selectedTos = screen.getByLabelText(
        /I agree to the TOS and privacy policy/i
      )

      await user.click(selectedTos)

      const submit = await screen.findByRole('button', { name: /Continue/ })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          tosInput: { businessEmail: 'personal@cr.com', termsAgreement: true },
          defaultOrgInput: { username: 'criticalRole' },
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
          'user selects an org, signs TOS, submit is now enabled',
        useUserData: {
          me: {
            email: 'personal@cr.com',
            termsAgreement: false,
          },
        },
      },
      [expectPageIsReady],
      [expectUserSelectsOrg, { orgName: 'criticalRole' }],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectSubmitIsEnabled],
    ],
    [
      'case #2',
      {
        validationDescription:
          'user wants to receive emails, signs TOS, submit is now enabled',
        useUserData: {
          me: {
            email: 'chetney@cr.com',
            termsAgreement: false,
          },
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
          'user selects a default org, user wants to receive emails, signs TOS, submit is now enabled',
        useUserData: {
          me: {
            email: 'chetney@cr.com',
            termsAgreement: false,
          },
        },
      },
      [expectPageIsReady],
      [expectUserSelectsOrg, { orgName: 'criticalRole' }],
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
        useUserData: {
          me: {
            email: 'chetney@cr.com',
            termsAgreement: false,
          },
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
          'user must provide a valid email and sign TOS (check email validation messages)',
        useUserData: {
          me: {
            termsAgreement: false,
          },
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
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
          'user cannot sign tos without providing an email',
        useUserData: {
          me: {
            termsAgreement: false,
          },
        },
      },
      [expectPageIsReady],
      [expectSubmitIsDisabled],
      [expectUserSignsTOS],
      [expectSubmitIsDisabled],
    ],
    [
      'case #7',
      {
        validationDescription: 'server unknown error notification',
        isUnknownError: true,
        useUserData: {
          me: {
            termsAgreement: false,
            email: 'personal@cr.com',
          },
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
        useUserData: {
          me: {
            termsAgreement: false,
            email: 'personal@cr.com',
          },
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
        useUserData: {
          me: {
            termsAgreement: false,
            email: 'personal@cr.com',
          },
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
          'server validation error notification (default org)',
        isValidationError: true,
        useUserData: {
          me: {
            termsAgreement: false,
            email: 'personal@cr.com',
          },
        },
      },
      [expectPageIsReady],
      [expectUserSelectsOrg, { orgName: 'criticalRole' }],
      [expectUserSignsTOS],
      [expectClickSubmit],
      [expectRendersServerFailureResult, 'validation error'],
    ],
  ])('form validation, %s', (_, initializeTest, ...steps) => {
    beforeEach(() => jest.resetModules())
    describe(`
      Has signed in: ${!!initializeTest.useUserData.me}
      Has a email via oauth: ${initializeTest.useUserData.me?.email}
    `, () => {
      jest.mock('./hooks/useTermsOfService', () => ({
        useSaveTermsAgreement: jest.fn(() => ({ data: 'mocked' })),
      }))
      it(`scenario: ${initializeTest.validationDescription}`, async () => {
        const { user } = setup({
          isUnknownError: initializeTest.isUnknownError,
          isValidationError: initializeTest.isValidationError,
          isUnAuthError: initializeTest.isUnAuthError,
          useUserData: initializeTest.useUserData,
          myOrganizationsData: {
            me: {
              myOrganizations: {
                edges: [
                  {
                    node: {
                      avatarUrl:
                        'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                      username: 'criticalRole',
                      ownerid: 1,
                    },
                  },
                ],
                pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
              },
            },
          },
        })
        render(<TermsOfService />, { wrapper: wrapper() })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(1))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

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

async function expectUserSelectsOrg(user, args) {
  const select = screen.getByRole('button', {
    name: 'Select an organization',
  })

  await user.click(select)

  const orgInList = screen.getByRole('option', { name: args.orgName })

  await user.click(orgInList)

  const selected = screen.getByText(new RegExp(args.orgName, 'i'))
  expect(selected).toBeInTheDocument()
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
  const emailInput = screen.getByLabelText(/Contact email required/i)

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
  const warning = screen.getByText(/This is not a valid email./i)
  expect(warning).toBeInTheDocument()
}

async function expectUserIsNotWarnedForValidEmail() {
  const warning = screen.queryByText(/This is not a valid email./i)
  expect(warning).not.toBeInTheDocument()
}

async function expectClickSubmit(user) {
  const submit = screen.getByRole('button', { name: /Continue/ })

  await user.click(submit)
}

async function expectRendersServerFailureResult(user, expectedError = {}) {
  const spy = jest.spyOn(console, 'error')
  const errorMock = jest.fn()
  spy.mockImplementation(errorMock)

  const submit = screen.getByRole('button', { name: /Continue/ })

  await user.click(submit)

  const error = screen.getByText(
    /There was an error with our servers. Please try again later or/i
  )
  expect(error).toBeInTheDocument()
  // await waitFor(() => expect(errorMock).toHaveBeenLastCalledWith(expectedError))

  const issueLink = screen.getByRole('link', { name: /contact support/i })
  expect(issueLink).toBeInTheDocument()
  expect(issueLink.href).toBe('https://codecov.freshdesk.com/support/home')
}
