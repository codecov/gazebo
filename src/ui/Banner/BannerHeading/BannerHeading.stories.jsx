import Icon from 'ui/Icon'

import BannerHeading from './BannerHeading'

const Template = () => {
  return (
    <BannerHeading>
      <div className="flex justify-center gap-2">
        <Icon name="speakerphone"></Icon>A Header
      </div>
    </BannerHeading>
  )
}

export const DefaultBannerHeading = {
  render: Template,
}

export default {
  title: 'Components/Banner/BannerHeading',
  component: BannerHeading,
}
