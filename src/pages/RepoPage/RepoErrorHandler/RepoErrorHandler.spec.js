import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RepoErrorHandler from '.'
import { useUser } from 'services/user'
import { useResyncUser } from 'services/user'

jest.mock('services/user')
const trigger = jest.fn()

describe('RepoErrorHandler', () => {
  function setup(returnValueResync, privateAccess) {
    useUser.mockReturnValue({
      data: {
        privateAccess,
      },
    })
    useResyncUser.mockReturnValue(returnValueResync)
    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test/repo']}>
        <RepoErrorHandler />
      </MemoryRouter>
    )
  }

  describe('when rendered with public scope and not syncing', () => {
    beforeEach(() => {
      setup(
        {
          isSyncing: false,
          triggerResync: trigger,
        },
        false
      )
    })

    it('renders 404 error text', () => {
      expect(screen.getByText('404 error')).toBeInTheDocument()
    })

    it('renders 404 error pic', () => {
      expect(
        screen.getByRole('img', { src: 'error-404.svg' })
      ).toBeInTheDocument()
    })

    it('renders resync btn', () => {
      expect(
        screen.getByRole('button', { name: 're-sync' })
      ).toBeInTheDocument()
    })

    it('renders add private repo scope', () => {
      expect(
        screen.getByRole('link', { name: 'add private scope' })
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with public scope and is syncing', () => {
    beforeEach(() => {
      setup({
        isSyncing: true,
        triggerResync: trigger,
      })
    })

    it('does not render 404 error text', () => {
      expect(screen.queryByText('404 error')).not.toBeInTheDocument()
    })

    it('renders 404 error pic', () => {
      expect(
        screen.getByRole('img', { src: 'error-404.svg' })
      ).toBeInTheDocument()
    })

    it('does not render resync btn', () => {
      expect(
        screen.queryByRole('button', { name: 're-sync' })
      ).not.toBeInTheDocument()
    })

    it('renders syncing text', () => {
      expect(screen.getByText('Syncing...')).toBeInTheDocument()
    })
  })

  describe('when rendered with private scope', () => {
    beforeEach(() => {
      setup(
        {
          isSyncing: false,
          triggerResync: trigger,
        },
        true
      )
    })

    it('renders 404 error text', () => {
      expect(screen.getByText('404 error')).toBeInTheDocument()
    })

    it('renders 404 error pic', () => {
      expect(
        screen.getByRole('img', { src: 'error-404.svg' })
      ).toBeInTheDocument()
    })

    it('renders resync btn', () => {
      expect(
        screen.getByRole('button', { name: 're-sync' })
      ).toBeInTheDocument()
    })

    it('does not render add private repo scope', () => {
      expect(
        screen.queryByRole('link', { name: 'add private scope' })
      ).not.toBeInTheDocument()
    })
  })
})
