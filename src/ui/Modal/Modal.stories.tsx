import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { useState } from 'react'

import Button from 'ui/Button'

import BaseModal from './BaseModal'
import Modal, { ModalProps } from './Modal'

export default {
  title: 'Components/Modal',
  component: Modal,
} as Meta

type Story = StoryObj<typeof Modal>

const RenderTemplate: React.FC<{ args: ModalProps }> = ({ args }) => {
  const [isOpen, setIsOpen] = useState(false)
  args.isOpen = isOpen
  args.onClose = () => setIsOpen(false)
  return (
    <>
      <Button
        hook="open"
        onClick={() => setIsOpen(true)}
        to={undefined}
        disabled={false}
      >
        Open
      </Button>
      <Modal {...args} />
    </>
  )
}

export const SimpleModal: Story = {
  args: {
    title: 'Simple modal',
    body: 'You can use the body to render any JSX',
  },
  render: (args) => <RenderTemplate args={args} />,
}

export const ModalWithFooter: Story = {
  args: {
    title: 'Modal with a footer',
    body: 'The footer will appear under a line, good place for buttons',
    footer: (
      <Button to={undefined} disabled={false} hook="">
        Footer here
      </Button>
    ),
  },
  render: (args) => <RenderTemplate args={args} />,
}

export const ModalWithSubtitle: Story = {
  args: {
    title: 'Modal with a subtitle',
    subtitle: 'You can add some extra content under the title with this prop',
    body: 'And it should render well with a body',
  },
  render: (args) => <RenderTemplate args={args} />,
}

export const ModalWithNoCloseButton: Story = {
  args: {
    title: 'Modal with no close button',
    body: "You pass the prop hasCloseButton={false} so the close button doesn't appear next to the title",
    hasCloseButton: false,
  },
  render: (args) => <RenderTemplate args={args} />,
}

export const BaseModalOnly: React.FC = () => (
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
        footer={
          <Button to={undefined} disabled={false} hook="">
            Footer here
          </Button>
        }
      />
    </div>
  </div>
)
