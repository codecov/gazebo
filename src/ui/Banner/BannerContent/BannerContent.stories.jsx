import BannerContent from './BannerContent'

const Template = () => {
  return (
    <BannerContent>
      <p>
        This is the children of the new ui system Banner. Lorem Ipsum blah bleh
        bluh.
      </p>
    </BannerContent>
  )
}

export const DefaultBannerContent = {
  render: Template,
}

export default {
  title: 'Components/Banner/BannerContent',
  component: BannerContent,
}
