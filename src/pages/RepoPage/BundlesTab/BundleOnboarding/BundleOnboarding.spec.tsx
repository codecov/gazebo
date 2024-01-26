import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleOnboarding from './BundleOnboarding'

jest.mock('./ViteOnboarding', () => () => <div>ViteOnboarding</div>)
jest.mock('./RollupOnboarding', () => () => <div>RollupOnboarding</div>)
jest.mock('./WebpackOnboarding', () => () => <div>WebpackOnboarding</div>)

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/new'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/bundles/new',
            '/:provider/:owner/:repo/bundles/new/rollup',
            '/:provider/:owner/:repo/bundles/new/webpack',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    )

describe('BundleOnboarding', () => {
  describe('on /new route', () => {
    describe('rendering tabs', () => {
      it('renders selected vite tab', async () => {
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('aria-current', 'page')
      })

      it('renders rollup tab', async () => {
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders webpack tab', async () => {
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders vite onboarding', async () => {
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteOnboarding = screen.getByText('ViteOnboarding')
        expect(viteOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/rollup route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders selected rollup tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('aria-current', 'page')
      })

      it('renders webpack tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders rollup onboarding', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupOnboarding = screen.queryByText('RollupOnboarding')
        expect(rollupOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/webpack route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders rollup tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders selected webpack tab', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackOnboarding = await screen.findByText('WebpackOnboarding')
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })
})
