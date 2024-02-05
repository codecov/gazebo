import { render, screen } from '@testing-library/react'

import { useFlags } from 'shared/featureFlags'

import OtherCI from './OtherCI'

jest.mock('./OtherCIRepoToken', () => () => 'OtherCIRepoToken')
jest.mock('./OtherCIOrgToken', () => () => 'OtherCIOrgToken')
jest.mock('shared/featureFlags')

const mockedNewRepoFlag = useFlags as jest.Mock<{ newRepoFlag: boolean }>

describe('OtherCI', () => {
  function setup(show: boolean) {
    mockedNewRepoFlag.mockReturnValue({ newRepoFlag: show })
  }

  describe('when org upload token is available', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders OtherCIOrgToken', async () => {
      render(<OtherCI />)

      const OtherCIOrgToken = await screen.findByText('OtherCIOrgToken')
      expect(OtherCIOrgToken).toBeInTheDocument()
    })
  })

  describe('when org upload token is not available', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders OtherCIRepoToken', async () => {
      render(<OtherCI />)

      const OtherCIRepoToken = await screen.findByText('OtherCIRepoToken')
      expect(OtherCIRepoToken).toBeInTheDocument()
    })
  })
})
