import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundlesTab from './BundlesTab'

jest.mock('./BundleOnboarding', () => () => <div>BundleOnboarding</div>)

const wrapper =
  (
    initialEntries = '/gh/test-owner/test-repo/bundles'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/bundles',
            '/:provider/:owner/:repo/bundles/new',
            '/:provider/:owner/:repo/bundles/new/rollup',
            '/:provider/:owner/:repo/bundles/new/webpack',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    )

describe('BundlesTab', () => {
  describe('onboarding routes', () => {
    describe('root onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })

    describe('rollup onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new/rollup'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })

    describe('webpack onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new/webpack'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })
  })
})
