import { waitFor, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Home', () => () => 'HomeComponent')
jest.mock('./pages/About', () => () => 'AboutComponent')

describe('App', () => {

  describe('when rendering the App on homepage', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/')
      render(<App />)
    })

    it('renders the loading state', () => {
      const loading = screen.getByText(/loading.../i)
      expect(loading).toBeInTheDocument()
    })

    it('renders the homepage', () => {
      return waitFor(() => {
        const page = screen.getByText(/HomeComponent/i)
        expect(page).toBeInTheDocument()
      })
    })
  })

  describe('when visiting the about page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/about')
      render(<App />)
    })

    it('renders the homepage', () => {
      return waitFor(() => {
        const page = screen.getByText(/AboutComponent/i)
        expect(page).toBeInTheDocument()
      })
    })
  })
})
