import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import IndirectChangesInfo from './IndirectChangesInfo'

vi.mock('../../ComponentsSelector', () => ({
  default: () => 'ComponentsSelector',
}))

describe('Indiret changes Info', () => {
  it('renders the expected copy', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/provider/owner/repo/pull/pullId/indirectChangesInfo',
        ]}
      >
        <Route path="/:provider/:owner/:repo/pull/:pullId/indirectChangesInfo">
          <IndirectChangesInfo />
        </Route>
      </MemoryRouter>
    )

    expect(
      screen.getByText(
        /These are files that didn't have author revisions, but contain unexpected coverage changes/
      )
    ).toBeInTheDocument()
  })

  it('renders the expected link', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/provider/owner/repo/pull/pullId/indirectChangesInfo',
        ]}
      >
        <Route path="/:provider/:owner/:repo/pull/:pullId/indirectChangesInfo">
          <IndirectChangesInfo />
        </Route>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', {
        href: 'https://docs.codecov.com/docs/unexpected-coverage-changes',
      })
    ).toBeInTheDocument()
  })
})
