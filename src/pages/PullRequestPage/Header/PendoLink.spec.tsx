import { render, screen } from '@testing-library/react'

import { useFlags } from 'shared/featureFlags'

import PendoLink from './PendoLink'

jest.mock('shared/featureFlags')

const mockedUseFlags = useFlags as jest.Mock<{ pendoModalPrPage: boolean }>

describe('PendoLink', () => {
  function setup({ flagValue }: { flagValue: boolean }) {
    mockedUseFlags.mockReturnValue({
      pendoModalPrPage: flagValue,
    })
  }

  describe('flag is enabled', () => {
    it('displays link', () => {
      setup({ flagValue: true })

      render(<PendoLink />)

      const link = screen.getByText('Does this report look accurate?')
      expect(link).toBeInTheDocument()
    })
  })

  describe('flag is disabled', () => {
    it('does not display anything', () => {
      setup({ flagValue: false })

      const { container } = render(<PendoLink />)

      expect(container).toBeEmptyDOMElement()
    })
  })
})
