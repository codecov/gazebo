import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'

import { RepoBreadcrumbProvider } from './context'
import RepoPage from './RepoPage'

vi.mock('./BundlesTab', () => ({ default: () => 'BundlesTab' }))
vi.mock('./BundlesTab/BundleOnboarding', () => ({
  default: () => 'BundleOnboarding',
}))
vi.mock('./CommitsTab', () => ({ default: () => 'CommitsTab' }))
vi.mock('./CoverageTab', () => ({ default: () => 'CoverageTab' }))
vi.mock('./CoverageOnboarding', () => ({ default: () => 'CoverageOnboarding' }))
vi.mock('./PullsTab', () => ({ default: () => 'PullsTab' }))
vi.mock('./ConfigTab', () => ({ default: () => 'ConfigurationTab' }))
vi.mock('./ActivationAlert', () => ({ default: () => 'ActivationAlert' }))
vi.mock('./FailedTestsTab', () => ({ default: () => 'FailedTestsTab' }))

const mockGetRepo = ({
  noUploadToken = false,
  isRepoPrivate = false,
  isRepoActivated = true,
  isCurrentUserPartOfOrg = true,
  isRepoActive = true,
  isCurrentUserActivated = true,
}) => ({
  owner: {
    isAdmin: true,
    isCurrentUserPartOfOrg,
    isCurrentUserActivated,
    repository: {
      __typename: 'Repository',
      private: isRepoPrivate,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: isRepoActivated,
      oldestCommitAt: '',
      active: isRepoActive,
      isFirstPullRequest: false,
    },
  },
})

const mockRepoOverview = ({
  coverageEnabled = true,
  bundleAnalysisEnabled = true,
  testAnalyticsEnabled = false,
  language = '',
}) => {
  const languages = ['python']
  if (language !== '') {
    languages.push(language)
  }

  return {
    owner: {
      isCurrentUserActivated: true,
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled,
        bundleAnalysisEnabled,
        testAnalyticsEnabled,
        languages,
      },
    },
  }
}

const mockOwner = {
  ownerid: 123,
  username: 'test-owner',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  isCurrentUserPartOfOrg: true,
  isAdmin: true,
}

const mockUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
      customerIntent: 'PERSONAL',
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const server = setupServer()
let testLocation: ReturnType<typeof useLocation>

const wrapper =
  ({
    queryClient,
    initialEntries = '/gh/codecov/cool-repo',
  }: {
    queryClient: QueryClient
    initialEntries?: string
  }): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <NetworkErrorBoundary>
          <Route
            path={[
              '/:provider/:owner/:repo/blob/:ref/:path+',
              '/:provider/:owner/:repo/commits',
              '/:provider/:owner/:repo/bundles/:branch/:bundle',
              '/:provider/:owner/:repo/bundles/:branch',
              '/:provider/:owner/:repo/bundles',
              '/:provider/:owner/:repo/flags',
              '/:provider/:owner/:repo/components',
              '/:provider/:owner/:repo/new',
              '/:provider/:owner/:repo/pulls',
              '/:provider/:owner/:repo/config',
              '/:provider/:owner/:repo/tree/:branch',
              '/:provider/:owner/:repo/tree/:branch/:path+',
              '/:provider/:owner/:repo',
              '/:provider/:owner/:repo/tests/new',
              '/:provider/:owner/:repo/tests/new/codecov-cli',
            ]}
          >
            <Suspense fallback={null}>
              <RepoBreadcrumbProvider>{children}</RepoBreadcrumbProvider>
            </Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </NetworkErrorBoundary>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  noUploadToken?: boolean
  isCurrentUserPartOfOrg?: boolean
  hasRepoData?: boolean
  isRepoPrivate?: boolean
  isRepoActivated?: boolean
  isRepoActive?: boolean
  isTeamPlan?: boolean
  isCurrentUserActivated?: boolean
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
  language?: string
  testAnalyticsEnabled?: boolean
}

describe('RepoPage', () => {
  function setup(
    {
      noUploadToken = false,
      isCurrentUserPartOfOrg = true,
      hasRepoData = true,
      isRepoPrivate = false,
      isRepoActivated = true,
      isRepoActive = true,
      isTeamPlan = false,
      isCurrentUserActivated = true,
      coverageEnabled = true,
      bundleAnalysisEnabled = true,
      language,
      testAnalyticsEnabled = false,
    }: SetupArgs = {
      noUploadToken: false,
      isCurrentUserPartOfOrg: true,
      hasRepoData: true,
      isRepoPrivate: false,
      isRepoActivated: true,
      isRepoActive: true,
      isTeamPlan: false,
      isCurrentUserActivated: true,
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
    }
  ) {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('GetRepo', () => {
        if (hasRepoData) {
          return HttpResponse.json({
            data: mockGetRepo({
              noUploadToken,
              isRepoActive,
              isRepoPrivate,
              isRepoActivated,
              isCurrentUserPartOfOrg,
              isCurrentUserActivated,
            }),
          })
        }

        return HttpResponse.json({ data: { owner: {} } })
      }),
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: mockRepoOverview({
            coverageEnabled,
            bundleAnalysisEnabled,
            testAnalyticsEnabled,
            language,
          }),
        })
      }),
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({ data: { owner: mockOwner } })
      }),
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: mockUser })
      })
    )

    return { queryClient, user }
  }

  describe('there is no repo data', () => {
    it('renders not found', async () => {
      const { queryClient } = setup({ hasRepoData: false })
      render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

      const notFound = await screen.findByText(/not found/i)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('testing routes', () => {
    describe('repo has commits', () => {
      describe('testing base path', () => {
        describe('coverage is enabled', () => {
          it('renders coverage tab', async () => {
            const { queryClient } = setup()
            render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

            const coverage = await screen.findByText('CoverageTab')
            expect(coverage).toBeInTheDocument()
          })
        })

        describe('coverage is disabled', () => {
          it('renders new repo tab', async () => {
            const { queryClient } = setup({
              coverageEnabled: false,
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
              }),
            })

            const coverageOnboarding =
              await screen.findByText('CoverageOnboarding')
            expect(coverageOnboarding).toBeInTheDocument()
          })
        })
      })

      describe('testing tree branch path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tree/main',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing tree branch with path path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tree/main/src',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing blob branch path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/blob/main/file.js',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing bundles branch and bundle path', () => {
        describe('bundles are enabled', () => {
          it('renders bundles tab', async () => {
            const { queryClient } = setup({
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries:
                  '/gh/codecov/cool-repo/bundles/test-branch/test-bundle',
              }),
            })

            const bundlesTab = await screen.findByText('BundlesTab')
            expect(bundlesTab).toBeInTheDocument()
          })
        })

        describe('bundles are disabled', () => {
          it('renders bundle onboarding', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries:
                  '/gh/codecov/cool-repo/bundles/test-branch/test-bundle',
              }),
            })

            const bundleOnboarding = await screen.findByText('BundleOnboarding')
            expect(bundleOnboarding).toBeInTheDocument()
          })

          describe('there is no js or ts present', () => {
            it('redirects to coverage tab', async () => {
              const { queryClient } = setup({
                bundleAnalysisEnabled: false,
                coverageEnabled: true,
              })
              render(<RepoPage />, {
                wrapper: wrapper({
                  queryClient,
                  initialEntries:
                    '/gh/codecov/cool-repo/bundles/test-branch/test-bundle',
                }),
              })

              const coverage = await screen.findByText('CoverageTab')
              expect(coverage).toBeInTheDocument()
            })
          })
        })
      })

      describe('testing bundles branch path', () => {
        describe('bundles are enabled', () => {
          it('renders bundles tab', async () => {
            const { queryClient } = setup({
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/bundles/test-branch',
              }),
            })

            const bundlesTab = await screen.findByText('BundlesTab')
            expect(bundlesTab).toBeInTheDocument()
          })
        })

        describe('bundles are disabled', () => {
          it('renders bundle onboarding tab', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/bundles/test-branch',
              }),
            })

            const bundleOnboarding = await screen.findByText('BundleOnboarding')
            expect(bundleOnboarding).toBeInTheDocument()
          })

          describe('there is no js or ts present', () => {
            it('redirects to coverage tab', async () => {
              const { queryClient } = setup({
                bundleAnalysisEnabled: false,
                coverageEnabled: true,
              })
              render(<RepoPage />, {
                wrapper: wrapper({
                  queryClient,
                  initialEntries: '/gh/codecov/cool-repo/bundles/test-branch',
                }),
              })

              const coverage = await screen.findByText('CoverageTab')
              expect(coverage).toBeInTheDocument()
            })
          })
        })
      })

      describe('testing bundles path', () => {
        describe('bundles are enabled', () => {
          it('renders bundles tab', async () => {
            const { queryClient } = setup({
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/bundles',
              }),
            })

            const bundlesTab = await screen.findByText('BundlesTab')
            expect(bundlesTab).toBeInTheDocument()
          })
        })

        describe('bundles are disabled', () => {
          it('renders bundle onboarding tab', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              language: 'javascript',
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/bundles',
              }),
            })

            const bundleOnboarding = await screen.findByText('BundleOnboarding')
            expect(bundleOnboarding).toBeInTheDocument()
          })

          describe('there is no js or ts present', () => {
            it('redirects to coverage tab', async () => {
              const { queryClient } = setup({
                bundleAnalysisEnabled: false,
                coverageEnabled: true,
              })
              render(<RepoPage />, {
                wrapper: wrapper({
                  queryClient,
                  initialEntries: '/gh/codecov/cool-repo/bundles',
                }),
              })

              const coverage = await screen.findByText('CoverageTab')
              expect(coverage).toBeInTheDocument()
            })
          })
        })
      })

      describe('testing commits path', () => {
        describe('products are enabled', () => {
          it('renders commits tab', async () => {
            const { queryClient } = setup()
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/commits',
              }),
            })

            const commits = await screen.findByText('CommitsTab')
            expect(commits).toBeInTheDocument()
          })
        })

        describe('products are disabled', () => {
          it('redirects to coverage onboarding', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              coverageEnabled: false,
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/commits',
              }),
            })

            const coverage = await screen.findByText('CoverageOnboarding')
            expect(coverage).toBeInTheDocument()
          })
        })
      })

      describe('testing pulls path', () => {
        describe('products are enabled', () => {
          it('renders pulls tab', async () => {
            const { queryClient } = setup()
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/pulls',
              }),
            })

            const pulls = await screen.findByText('PullsTab')
            expect(pulls).toBeInTheDocument()
          })
        })

        describe('products are disabled', () => {
          it('redirects to coverage onboarding', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              coverageEnabled: false,
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/pulls',
              }),
            })

            const coverage = await screen.findByText('CoverageOnboarding')
            expect(coverage).toBeInTheDocument()
          })
        })
      })

      describe('testing compare path', () => {
        describe('product is enabled', () => {
          it('redirects pulls tab', async () => {
            const { queryClient } = setup()
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/compare',
              }),
            })

            const pulls = await screen.findByText('PullsTab')
            expect(pulls).toBeInTheDocument()

            await waitFor(() =>
              expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/pulls')
            )
          })
        })

        describe('products are disabled', () => {
          it('redirects to coverage onboarding', async () => {
            const { queryClient } = setup({
              bundleAnalysisEnabled: false,
              coverageEnabled: false,
            })
            render(<RepoPage />, {
              wrapper: wrapper({
                queryClient,
                initialEntries: '/gh/codecov/cool-repo/compare',
              }),
            })

            const coverage = await screen.findByText('CoverageOnboarding')
            expect(coverage).toBeInTheDocument()
          })
        })
      })

      describe('testing config path', () => {
        it('renders config tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/config',
            }),
          })

          const config = await screen.findByText('ConfigurationTab')
          expect(config).toBeInTheDocument()
        })
      })

      describe('testing random path', () => {
        it('redirects user to base path', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/blah',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
          )
        })
      })
    })

    describe('repo has no commits', () => {
      describe('testing coverage path', () => {
        it('renders new repo tab', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
          })
          render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

          const coverageOnboarding =
            await screen.findByText('CoverageOnboarding')
          expect(coverageOnboarding).toBeInTheDocument()
        })
      })

      describe('testing bundles path', () => {
        it('renders bundle onboarding tab', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
            language: 'javascript',
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/bundles',
            }),
          })

          const bundleOnboarding = await screen.findByText('BundleOnboarding')
          expect(bundleOnboarding).toBeInTheDocument()
        })
      })

      describe('testing tests analytics path', () => {
        it('handles failed tests route on active repo', async () => {
          const { queryClient } = setup({
            isRepoActive: true,
            hasRepoData: true,
            isRepoActivated: true,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests/new',
            }),
          })

          const failedTests = await screen.findByText('FailedTestsTab')
          expect(failedTests).toBeInTheDocument()
        })

        it('handles failed tests route on deactivated repo', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests/new/codecov-cli',
            }),
          })

          const coverageOnboarding = await screen.findByText('FailedTestsTab')
          expect(coverageOnboarding).toBeInTheDocument()
        })

        it('does not render failed tests tab when repo is inactive', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests/new/codecov-cli',
            }),
          })

          const onboardingFailedTests =
            await screen.findByText('FailedTestsTab')
          expect(onboardingFailedTests).toBeInTheDocument()
        })

        it('Renders tab when feature flag is on and test analytics is already enabled', async () => {
          const { queryClient } = setup({
            isRepoActive: true,
            hasRepoData: true,
            isRepoActivated: true,
            testAnalyticsEnabled: true,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests',
            }),
          })

          const failedTests = await screen.findByText('FailedTestsTab')
          expect(failedTests).toBeInTheDocument()
        })

        it('redirects to repo page if test analytics is disabled and user is not part of the org', async () => {
          const { queryClient } = setup({
            isRepoActive: true,
            hasRepoData: true,
            isRepoActivated: true,
            testAnalyticsEnabled: false,
            isCurrentUserPartOfOrg: false,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests',
            }),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
          )
        })

        it('does not show failed tests if repo is not active and user is not part of the org', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
            testAnalyticsEnabled: false,
            isCurrentUserPartOfOrg: false,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tests',
            }),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/new')
          )

          const failedTests = screen.queryByText('FailedTestsTab')
          expect(failedTests).not.toBeInTheDocument()
        })
      })

      describe('testing config path', () => {
        it('renders config tab', async () => {
          const { queryClient } = setup({
            isRepoActive: false,
            hasRepoData: true,
            isRepoActivated: false,
          })
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/config',
            }),
          })

          const config = await screen.findByText('ConfigurationTab')
          expect(config).toBeInTheDocument()
        })
      })
    })

    describe('repo is deactivated', () => {
      it('renders deactivated repo page', async () => {
        const { queryClient } = setup({
          hasRepoData: true,
          isRepoActivated: false,
          isRepoActive: true,
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

        const msg = await screen.findByText(
          'This repository has been deactivated'
        )
        expect(msg).toBeInTheDocument()
      })
    })
  })

  describe('user is not activated and repo is private', () => {
    describe('user does not have coverage enabled', () => {
      it('renders coverage setup tabs', async () => {
        const { queryClient } = setup({
          hasRepoData: true,
          isCurrentUserActivated: false,
          isRepoPrivate: true,
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
          language: 'javascript',
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })
        const coverageOnboarding = await screen.findByText('CoverageOnboarding')
        expect(coverageOnboarding).toBeInTheDocument()
        const error = screen.queryByText(/ActivationAlert/)
        expect(error).not.toBeInTheDocument()
      })
    })

    describe('user has coverage enabled', () => {
      it('renders ActivationAlert access error', async () => {
        const { queryClient } = setup({
          hasRepoData: true,
          isCurrentUserActivated: false,
          isRepoPrivate: true,
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })
        const error = await screen.findByText('ActivationAlert')
        expect(error).toBeInTheDocument()
      })
    })

    describe('user does not have bundles enabled', () => {
      it('renders bundle setup tabs', async () => {
        const { queryClient, user } = setup({
          hasRepoData: true,
          isCurrentUserActivated: false,
          isRepoPrivate: true,
          coverageEnabled: true,
          bundleAnalysisEnabled: false,
          language: 'javascript',
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })
        const bundlesTab = await screen.findByText('Bundles')
        expect(bundlesTab).toBeInTheDocument()
        await user.click(bundlesTab)
        const error = screen.queryByText(/ActivationAlert/)
        expect(error).not.toBeInTheDocument()
      })
    })

    describe('user has bundles enabled', () => {
      it('renders ActivationAlert access error', async () => {
        const { queryClient, user } = setup({
          hasRepoData: true,
          isCurrentUserActivated: false,
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
          isRepoPrivate: true,
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })
        const bundlesTab = await screen.findByText('Bundles')
        expect(bundlesTab).toBeInTheDocument()
        await user.click(bundlesTab)
        const error = await screen.findByText('ActivationAlert')
        expect(error).toBeInTheDocument()
      })
    })
  })
})
