import { useState } from 'react'
import noop from 'lodash/noop'

import Button from 'ui/Button'

import Modal from './Modal'
import BaseModal from './BaseModal'

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button hook="open" onClick={() => setIsOpen(true)}>
        Open
      </Button>
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

export const BaseModalOnly = () => (
  <div className="bg-gray-900 p-20">
    <div className="w-1/3">
      <BaseModal
        onClose={noop}
        title="<BaseModal/>"
        body={
          <div className="flex flex-col">
            <span>
              You can only use the Modal/BaseModal to only use the styling of
              the modal itself if you need to shell it differently
            </span>
          </div>
        }
        footer={<Button>Footer here</Button>}
      />
    </div>
  </div>
)

ModalWithFooter.args = {
  footer: <Button>Footer here</Button>,
}

export default {
  title: 'Components/Modal',
  component: Modal,
}
