import { render, screen } from '@testing-library/react'

import SettingsDescriptor from './SettingsDescriptor'

describe('SettingsDescriptor', () => {
  function setup() {
    render(
      <SettingsDescriptor
        title="Section Title"
        description="Section description and -if exists- a link"
        content="Section content"
      />
    )
  }

  describe('public scope', () => {
    beforeEach(() => {
      setup()
    })
    it('renders the title', () => {
      expect(screen.getByText(/Section Title/)).toBeInTheDocument()
    })
    it('renders the description', () => {
      expect(
        screen.getByText(/Section description and -if exists- a link/)
      ).toBeInTheDocument()
    })
    it('renders the content', () => {
      expect(screen.getByText(/Section content/)).toBeInTheDocument()
    })
  })
})
