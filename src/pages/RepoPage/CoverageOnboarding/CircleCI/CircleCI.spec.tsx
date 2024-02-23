import { render, screen } from '@testing-library/react'

import { useFlags } from 'shared/featureFlags'

import CircleCI from './CircleCI'

jest.mock('./CircleCIRepoToken', () => () => 'CircleCIRepoToken')
jest.mock('./CircleCIOrgToken', () => () => 'CircleCIOrgToken')
jest.mock('shared/featureFlags')

const mockedNewRepoFlag = useFlags as jest.Mock<{ newRepoFlag: boolean }>

describe('CircleCI', () => {
  function setup(show: boolean) {
    mockedNewRepoFlag.mockReturnValue({ newRepoFlag: show })
  }

  describe('when org upload token is available', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders CircleCIOrgToken', async () => {
      render(<CircleCI />)

      const CircleCIOrgToken = await screen.findByText('CircleCIOrgToken')
      expect(CircleCIOrgToken).toBeInTheDocument()
    })
  })

  describe('when org upload token is not available', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders CircleCIRepoToken', async () => {
      render(<CircleCI />)

      const CircleCIRepoToken = await screen.findByText('CircleCIRepoToken')
      expect(CircleCIRepoToken).toBeInTheDocument()
    })
  })
})
