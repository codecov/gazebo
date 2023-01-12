import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom/cjs/react-router-dom.min'

import PlanControls from './PlanControls'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ provider: 'gh' }),
}))

describe('PlanPricing', () => {
  describe('user is on an enterprise plan', () => {
    describe('user is on a monthly plan', () => {
      it('renders contact message', () => {
        const accountDetails = {
          plan: {
            marketingName: 'Team Name',
            baseUnitPrice: 12,
            benefits: [],
            quantity: 5,
            value: 'users-enterprisem',
          },
          activatedUserCount: 2,
        }
        render(<PlanControls accountDetails={accountDetails} />, {
          wrapper: MemoryRouter,
        })
        expect(
          screen.getByText('To change or cancel your plan please contact')
        ).toBeInTheDocument()
      })
    })

    describe('user is on a yearly plan', () => {
      it('renders contact message', () => {
        const accountDetails = {
          plan: {
            marketingName: 'Team Name',
            baseUnitPrice: 12,
            benefits: [],
            quantity: 5,
            value: 'users-enterprisey',
          },
          activatedUserCount: 2,
        }
        render(<PlanControls accountDetails={accountDetails} />, {
          wrapper: MemoryRouter,
        })
        expect(
          screen.getByText('To change or cancel your plan please contact')
        ).toBeInTheDocument()
      })
    })

    describe('user is an invoiced customer', () => {
      it('renders contact message', () => {
        const accountDetails = {
          plan: {
            marketingName: 'Team Name',
            baseUnitPrice: 12,
            benefits: [],
            quantity: 5,
            value: 'users-basic',
          },
          activatedUserCount: 2,
          subscriptionDetail: {
            collectionMethod: 'send_invoice',
          },
        }
        render(<PlanControls accountDetails={accountDetails} />, {
          wrapper: MemoryRouter,
        })
        expect(
          screen.getByText('To change or cancel your plan please contact')
        ).toBeInTheDocument()
      })
    })
  })
})
