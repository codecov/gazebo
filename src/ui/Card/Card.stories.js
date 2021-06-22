import Card from './Card'

const Template = (args) => <Card {...args} />

export const NormalCard = Template.bind({})
NormalCard.args = {
  children: (
    <>
      Here is the Card component, you are free to render anything you would like
      here.
    </>
  ),
}

export const CardWithHeader = Template.bind({})
CardWithHeader.args = {
  header: <b>Title on a card</b>,
  children: (
    <>
      It’s possible to pass a header prop to the Card component which put it at
      the top of the card and add a line to separate it from the component.
      <br />
      <br />
      Inside the card, you are free to do whatever you want, just keep in mind
      that the component have a 16px padding.
      <br />
      <br />
      the prop header, footer and children can render any valid React element
    </>
  ),
}

export const CardWithFooter = Template.bind({})
CardWithFooter.args = {
  ...CardWithHeader.args,
  footer: <i>you add extra information here, and maybe buttons :)</i>,
}

export default {
  title: 'Components/Card',
  component: Card,
}
