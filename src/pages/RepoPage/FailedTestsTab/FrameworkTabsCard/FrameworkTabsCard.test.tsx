import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FrameworkTabsCard } from './FrameworkTabsCard'

vi.mock('./FrameworkTabs', () => ({
  FrameworkTabs: () => 'FrameworkTabs',
}))

describe('FrameworkTabsCard', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  it('renders title of card', () => {
    setup()
    render(<FrameworkTabsCard />)

    const title = screen.getByText('Step 1: Output a JUnit XML file in your CI')
    expect(title).toBeInTheDocument()
  })

  it('renders content of card', () => {
    setup()
    render(<FrameworkTabsCard />)

    const content = screen.getByText(
      /Select the framework below to generate a JUnit XM/
    )
    expect(content).toBeInTheDocument()
  })

  it('renders framework tabs', () => {
    setup()
    render(<FrameworkTabsCard />)

    const frameworkTabs = screen.getByText('FrameworkTabs')
    expect(frameworkTabs).toBeInTheDocument()
  })
})
