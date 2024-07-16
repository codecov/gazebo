import { Meta, StoryObj } from '@storybook/react'

import { Dropdown } from './Dropdown'

type DropdownStory = React.ComponentProps<typeof Dropdown> & {
  titleSize?: 'lg' | 'base'
}

const meta: Meta<DropdownStory> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  //   argTypes: {
  //     titleSize: {
  //       description: 'Controls the font size of Card.Title',
  //       control: 'radio',
  //       options: ['lg', 'base'],
  //     },
  //   },
} as Meta
export default meta

type Story = StoryObj<DropdownStory>

export const Default: Story = {
  render: () => (
    <Dropdown>
      <Dropdown.Trigger>Open</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Label>My Label</Dropdown.Label>
        <Dropdown.Item>Apple</Dropdown.Item>
        <Dropdown.Item>Orange</Dropdown.Item>
        <Dropdown.Item>Strawberry</Dropdown.Item>
        <Dropdown.Item>Lemon</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  ),
}

// export const CardWithHeader: Story = {
//   args: {
//     titleSize: 'lg',
//   },
//   render: (args) => (
//     <Dropdown>
//       <Dropdown.Header>
//         <Dropdown.Title size={args.titleSize}>
//           A header can have a title.
//         </Dropdown.Title>
//         <Dropdown.Description>And it can have a description.</Dropdown.Description>
//       </Dropdown.Header>
//       <Dropdown.Content>
//         The header will place a border between it and the main Dropdown content.
//       </Dropdown.Content>
//     </Dropdown>
//   ),
// }

// export const CardWithFooter: Story = {
//   render: () => (
//     <Card>
//       <Card.Header>
//         <Card.Title>Card With Footer</Card.Title>
//       </Card.Header>
//       <Card.Content>
//         A footer will similarly have a border between it and the main Card
//         content.
//       </Card.Content>
//       <Card.Footer>Footer!</Card.Footer>
//     </Card>
//   ),
// }

// export const CardWithCustomStyles: Story = {
//   render: () => (
//     <Card className="border-4 border-ds-pink">
//       <Card.Header className="border-b-4 border-inherit">
//         <Card.Title className="text-ds-blue">Custom Styles</Card.Title>
//       </Card.Header>
//       <Card.Content className="flex gap-5">
//         <Card className="flex-1">
//           <Card.Content className="text-center">
//             Using the <code className="bg-ds-gray-secondary">className</code>{' '}
//             prop,
//           </Card.Content>
//         </Card>
//         <Card className="flex-1">
//           <Card.Content className="text-center">
//             you can set custom styles!
//           </Card.Content>
//         </Card>
//       </Card.Content>
//       <Card.Footer className="border-t-4 border-inherit text-center">
//         But if you&apos;re going to do that, consider adding a{' '}
//         <a
//           href="https://cva.style/docs/getting-started/variants"
//           className="text-ds-blue hover:underline"
//         >
//           CVA variant
//         </a>{' '}
//         for the component instead.
//       </Card.Footer>
//     </Card>
//   ),
// }
