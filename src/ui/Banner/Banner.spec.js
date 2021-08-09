import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'

import mockWindowProperty from 'mock-window-property'
import Banner from './Banner'

describe('Banner', () => {
  function setup(props = {}, content) {
    render(
      <Banner storageId="unit" {...props}>
        {content}
      </Banner>
    )
  }

  describe('when the Banner is dismissed', () => {
    mockWindowProperty('localStorage', {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    })
    beforeEach(() => {
      setup({ title: <span>title</span> }, <span>this is the content</span>)
    })

    it('hides the whole banner', async () => {
      await userEvent.click(screen.getByRole('button'))
      expect(screen.queryByText(/this is the title/)).not.toBeInTheDocument()
    })

    it('is hidden on following renders while the storage id is present', async () => {
      await userEvent.click(screen.getByRole('button'))
      expect(screen.queryByText(/this is the title/)).not.toBeInTheDocument()
      setup({ title: <span>title</span> }, <span>this is the content</span>)
      expect(screen.queryByText(/this is the title/)).not.toBeInTheDocument()
    })
  })

  describe('using missing children', () => {
    beforeEach(() => {
      setup({ title: <span>this is the title</span> })
    })

    it('renders title title', () => {
      expect(screen.queryByText(/this is the title/)).toBeInTheDocument()
    })
  })

  describe('using full props', () => {
    beforeEach(() => {
      setup({ title: <span>title</span> }, <span>this is the content</span>)
    })

    it('renders title', () => {
      expect(screen.queryByText(/title/)).toBeInTheDocument()
    })

    it('renders content', () => {
      expect(screen.queryByText(/this is the content/)).toBeInTheDocument()
    })
  })

  describe('no title', () => {
    beforeEach(() => {
      setup({}, <span>this is the content</span>)
    })
    it('renders content', () => {
      expect(screen.queryByText(/this is the content/)).toBeInTheDocument()
    })
  })
})
