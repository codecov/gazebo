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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} {...args} />
    </>
  )
}

export const SimpleModal = Template.bind({})

SimpleModal.args = {
  title: 'Simple modal',
  body: 'You can use the body to render any JSX',
}

export const ModalWithFooter = Template.bind({})

ModalWithFooter.args = {
  title: 'Modal with a footer',
  body: 'The footer will appear under a line, good place for buttons',
  footer: <Button>Footer here</Button>,
}

export const ModalWithSubtitle = Template.bind({})

ModalWithSubtitle.args = {
  title: 'Modal with a subtitle',
  subtitle: 'You can add some extra content under the title with this prop',
  body: 'And it should render well with a body',
}

export const ModalWithNoCloseButton = Template.bind({})

ModalWithNoCloseButton.args = {
  title: 'Modal with no close button',
  body: "You pass the prop hasCloseButton={false} so the close button doesn't appear next to the title",
  hasCloseButton: false,
}

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

export default {
  title: 'Components/Modal',
  component: Modal,
}
