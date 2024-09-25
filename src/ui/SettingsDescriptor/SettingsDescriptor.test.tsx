import { render, screen } from '@testing-library/react'

import SettingsDescriptor from './SettingsDescriptor'

describe('SettingsDescriptor', () => {
  describe('public scope', () => {
    it('renders the title', () => {
      render(
        <SettingsDescriptor
          title="Section Title"
          description="Section description and -if exists- a link"
          content="Section content"
        />
      )

      const title = screen.getByText(/Section Title/)
      expect(title).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(
        <SettingsDescriptor
          title="Section Title"
          description="Section description and -if exists- a link"
          content="Section content"
        />
      )

      const description = screen.getByText(
        /Section description and -if exists- a link/
      )
      expect(description).toBeInTheDocument()
    })

    it('renders the content', () => {
      render(
        <SettingsDescriptor
          title="Section Title"
          description="Section description and -if exists- a link"
          content="Section content"
        />
      )

      const content = screen.getByText(/Section content/)
      expect(content).toBeInTheDocument()
    })
  })
})
