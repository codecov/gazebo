import Icon from 'ui/Icon'

import Banner from './Banner'

const Template = (args) => {
  return (
    <>
      <Banner
        {...args}
        title={
          <div className="flex justify-center gap-2">
            <Icon name="speakerphone"></Icon>A Header
          </div>
        }
      >
        <p>
          This is the children of the new ui system Banner. Lorem Ipsum blah
          bleh bluh.
        </p>
      </Banner>
      <p className="m-10">
        * Dismiss is tied to local storage <i>banner-storybook</i>. Delete the
        entry to show the alert again.
      </p>
    </>
  )
}

export const DefaultBanner = Template.bind({})
DefaultBanner.args = {
  children: 'Normal button',
  variant: 'default',
}

export const PlainBanner = Template.bind({})
PlainBanner.args = {
  children: 'Normal button',
  variant: 'plain',
}

export const WarningBanner = Template.bind({})
WarningBanner.args = {
  children: 'Normal button',
  variant: 'warning',
}

export default {
  title: 'Components/Banner',
  component: Banner,
}
