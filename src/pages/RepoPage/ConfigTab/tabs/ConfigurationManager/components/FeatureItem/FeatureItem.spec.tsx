import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import FeatureItem from './FeatureItem'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/config']}>
    <Route path="/:provider/:owner/:repo/config">{children}</Route>
  </MemoryRouter>
)

describe('FeatureItem', () => {
  it('renders name', async () => {
    render(
      <FeatureItem
        name="Name"
        configured={true}
        docsLink="flags"
        getStartedLink="flags"
        hiddenStatus={false}
      />,
      { wrapper }
    )

    const name = await screen.findByText('Name')
    expect(name).toBeInTheDocument()
  })

  it('renders children', async () => {
    render(
      <FeatureItem
        name="Name"
        configured={true}
        docsLink="flags"
        getStartedLink="flags"
        hiddenStatus={false}
      >
        <p>child</p>
      </FeatureItem>,
      { wrapper }
    )

    const child = await screen.findByText('child')
    expect(child).toBeInTheDocument()
  })

  it('renders docs link', async () => {
    render(
      <FeatureItem
        name="Name"
        configured={true}
        docsLink="flags"
        getStartedLink="flags"
        hiddenStatus={false}
      />,
      { wrapper }
    )

    const link = await screen.findByRole('link')
    expect(link).toBeInTheDocument()
  })

  it('does not render docs link when undefined', async () => {
    render(
      <FeatureItem
        name="Name"
        configured={true}
        getStartedLink="flags"
        hiddenStatus={false}
      />,
      { wrapper }
    )

    await waitFor(() => screen.findByText('Name'))

    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  describe('when hiddenStatus is true', () => {
    it('does not render configuration status', async () => {
      render(
        <FeatureItem
          name="Name"
          configured={true}
          getStartedLink="flags"
          hiddenStatus={true}
        />,
        { wrapper }
      )

      await waitFor(() => screen.findByText('Name'))

      const configured = screen.queryByText('Configured')
      expect(configured).not.toBeInTheDocument()
    })
  })

  it('renders configuration status', async () => {
    render(
      <FeatureItem
        name="Name"
        configured={true}
        getStartedLink="flags"
        hiddenStatus={false}
      />,
      { wrapper }
    )

    const configured = await screen.findByText('Configured')
    expect(configured).toBeInTheDocument()
  })

  it('renders unconfigured status', async () => {
    render(
      <FeatureItem name="Name" getStartedLink="flags" hiddenStatus={false} />,
      { wrapper }
    )

    const unconfigured = await screen.findByRole('link', {
      name: 'Get Started',
    })
    expect(unconfigured).toBeInTheDocument()
  })

  describe('when getStartedLink is undefinted', () => {
    it('does not render any configuration status', async () => {
      render(<FeatureItem name="Name" hiddenStatus={false} />, { wrapper })

      const unconfigured = screen.queryByRole('link', { name: 'Get Started' })
      expect(unconfigured).not.toBeInTheDocument()
    })
  })

  it('renders name link', async () => {
    render(<FeatureItem name="Name" hiddenStatus={false} nameLink="flags" />, {
      wrapper,
    })

    const name = await screen.findByText('Name')
    expect(name).toBeInTheDocument()
    const link = await screen.findByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://docs.codecov.com/docs/flags')
  })

  it('does not render name link when prop is undefined', async () => {
    render(<FeatureItem name="Name" hiddenStatus={false} />, {
      wrapper,
    })

    const name = await screen.findByText('Name')
    expect(name).toBeInTheDocument()
    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })
})
