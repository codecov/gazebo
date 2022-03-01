import { render, screen } from 'custom-testing-library'

import Banner from './Banner'

describe('Banner', () => {
  function setup(props = {}, content) {
    render(<Banner {...props}>{content}</Banner>)
  }

  describe('using missing children', () => {
    beforeEach(() => {
      setup({ title: <span>this is the title</span> })
    })

    it('renders title title', () => {
      expect(screen.getByText(/this is the title/)).toBeInTheDocument()
    })
  })

  describe('using full props', () => {
    beforeEach(() => {
      setup({ title: <span>title</span> }, <span>this is the content</span>)
    })

    it('renders title', () => {
      expect(screen.getByText(/title/)).toBeInTheDocument()
    })

    it('renders content', () => {
      expect(screen.getByText(/this is the content/)).toBeInTheDocument()
    })
  })

  describe('no title', () => {
    beforeEach(() => {
      setup({}, <span>this is the content</span>)
    })
    it('renders content', () => {
      expect(screen.getByText(/this is the content/)).toBeInTheDocument()
    })
  })
})
