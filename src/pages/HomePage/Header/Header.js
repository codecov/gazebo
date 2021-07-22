import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { providerFeedback } from 'shared/utils'
import Banner from 'ui/Banner'
import Icon from 'ui/Icon'
import A from 'ui/A'

function Header() {
  const { provider } = useParams()

  return (
    <>
      <Banner
        storageId="ui-changing-00"
        title={
          <div className="flex justify-center gap-2">
            <Icon name="speakerphone"></Icon>
            <h2>Updating our web app</h2>
          </div>
        }
      >
        <p>
          We’ve been making changes to the web experience and will be
          continuously releasing a new experience over the next few months. We
          would love to hear your feedback! Let us know what you think in{' '}
          <A
            hook="feedback"
            href={providerFeedback(provider)}
            isExternal={true}
          >
            this issue
          </A>
          .
        </p>
      </Banner>
      <MyContextSwitcher pageName="owner" activeContext={null} />
    </>
  )
}

export default Header
