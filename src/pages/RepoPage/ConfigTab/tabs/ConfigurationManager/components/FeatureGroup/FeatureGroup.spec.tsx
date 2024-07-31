import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import FeatureGroup from './FeatureGroup'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/config']}>
    <Route path="/:provider/:owner/:repo/config">{children}</Route>
  </MemoryRouter>
)

describe('FeatureGroup', () => {
  it('renders title', async () => {
    render(<FeatureGroup title="Title" getStartedLink="repo" />, { wrapper })

    const title = await screen.findByText('Title')
    expect(title).toBeInTheDocument()
  })

  it('renders get started button', async () => {
    render(
      <FeatureGroup
        title="Title"
        getStartedLink="repo"
        showGetStartedLink={true}
      />,
      { wrapper }
    )

    const button = await screen.findByRole('link', { name: 'Get Started' })
    expect(button).toBeInTheDocument()
  })

  it('renders children', async () => {
    render(
      <FeatureGroup title="Title" getStartedLink="repo">
        <p>child</p>
      </FeatureGroup>,
      { wrapper }
    )

    const child = await screen.findByText('child')
    expect(child).toBeInTheDocument()
  })

  describe('composition with UniversalItems and ProItems', () => {
    it('renders children', async () => {
      render(
        <FeatureGroup title="Title" getStartedLink="repo">
          <FeatureGroup.UniversalItems>
            <p>Universal child</p>
          </FeatureGroup.UniversalItems>
          <FeatureGroup.ProItems>
            <p>Pro child</p>
          </FeatureGroup.ProItems>
        </FeatureGroup>,
        { wrapper }
      )

      const universalChild = await screen.findByText('Universal child')
      expect(universalChild).toBeInTheDocument()

      const proChild = await screen.findByText('Pro child')
      expect(proChild).toBeInTheDocument()
    })
  })
})

describe('UniversalItems', () => {
  it('renders children', async () => {
    render(
      <FeatureGroup.UniversalItems>
        <p>child</p>
      </FeatureGroup.UniversalItems>,
      { wrapper }
    )

    const child = await screen.findByText('child')
    expect(child).toBeInTheDocument()
  })
})

describe('ProItems', () => {
  it('renders children', async () => {
    render(
      <FeatureGroup.ProItems>
        <p>child</p>
      </FeatureGroup.ProItems>,
      { wrapper }
    )

    const child = await screen.findByText('child')
    expect(child).toBeInTheDocument()
  })

  describe('when on team plan', () => {
    it('renders upgrade to pro CTA', async () => {
      render(<FeatureGroup.ProItems isTeamPlan={true} />, { wrapper })

      const cta = await screen.findByText('Available with Pro Plan')
      expect(cta).toBeInTheDocument()

      const upgrade = await screen.findByRole('link', { name: 'upgrade' })
      expect(upgrade).toBeInTheDocument()
    })
  })

  describe('when not on team plan', () => {
    it('does not render upgrade to pro CTA', async () => {
      render(
        <FeatureGroup.ProItems isTeamPlan={false}>
          <p>child</p>
        </FeatureGroup.ProItems>,
        { wrapper }
      )

      await waitFor(() => screen.findByText('child'))

      const cta = screen.queryByText('Available with Pro Plan')
      expect(cta).not.toBeInTheDocument()

      const upgrade = screen.queryByRole('link', { name: 'upgrade' })
      expect(upgrade).not.toBeInTheDocument()
    })
  })
})
