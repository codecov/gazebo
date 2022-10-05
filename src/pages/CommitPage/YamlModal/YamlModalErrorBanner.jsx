import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function YamlModalErrorBanner() {
  return (
    <Banner variant="warning">
      <BannerHeading>
        <div className="font-semibold">Commit YAML is invalid</div>
      </BannerHeading>
      <BannerContent>
        When the commit-level YAML is invalid, we use the last valid repo YAML.
        To determine if your YAML is valid, please follow the steps{' '}
        <A to={{ pageName: 'repoYaml' }}>here.</A>
      </BannerContent>
    </Banner>
  )
}

export default YamlModalErrorBanner
