import { render, screen } from '@testing-library/react'

import PendoLink from './PendoLink'

jest.mock('shared/featureFlags')

describe('PendoLink', () => {
  it('displays link', () => {
    render(<PendoLink />)

    const link = screen.getByText('Does this report look accurate?')
    expect(link).toBeInTheDocument()
  })
})
