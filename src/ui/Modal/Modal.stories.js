import Modal from './Modal'
import { useState } from 'react'
import Button from 'ui/Button'

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <Modal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Title"
        body={
          <div className="flex flex-col">
            <span>
              These are the children of the new ui system Modal. Lorem Ipsum
              blah bleh bluh
            </span>
            <span>Good children</span>
          </div>
        }
      />
    </>
  )
}

export const SimpleModal = Template.bind({})

export const ModalWithFooter = Template.bind({})

ModalWithFooter.args = {
  footer: <Button>Footer here</Button>,
}

export default {
  title: 'Components/Modal',
  component: Modal,
}
