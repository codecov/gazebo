import { useHistory, useLocation, useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { Provider } from 'shared/api/helpers'
import { RadioTileGroup } from 'ui/RadioTileGroup'

const TABS = {
  Overview: 'Overview',
  Flags: 'Flags',
  Components: 'Components',
} as const
type TabsValue = (typeof TABS)[keyof typeof TABS]

interface URLParams {
  provider: Provider
  owner: string
  repo: string
  branch?: string
}

function CoverageTabNavigator() {
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const location = useLocation()
  const history = useHistory()
  const { coverage, flagsTab, componentsTab } = useNavLinks()

  const urls = {
    Overview: coverage.path({ provider, owner, repo, branch }),
    Flags: flagsTab.path({ provider, owner, repo }),
    // will probably need to add branch here as arg when we support
    // keeping same branch we are on another tab with
    Components: componentsTab.path({ provider, owner, repo, branch }),
  }

  let value: TabsValue = TABS.Overview
  if (location.pathname.startsWith(urls.Flags)) {
    value = TABS.Flags
  } else if (location.pathname.startsWith(urls.Components)) {
    value = TABS.Components
  }

  return (
    <RadioTileGroup
      value={value}
      onValueChange={(value: TabsValue) => {
        history.replace(urls[value])
      }}
      className="flex-col py-2 md:flex-row"
    >
      <RadioTileGroup.Item value={TABS.Overview} data-testid="overview-radio">
        <RadioTileGroup.Label>{TABS.Overview}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item value={TABS.Flags} data-testid="flags-radio">
        <RadioTileGroup.Label>{TABS.Flags}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item
        value={TABS.Components}
        data-testid="components-radio"
      >
        <RadioTileGroup.Label>{TABS.Components}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
    </RadioTileGroup>
  )
}

export { CoverageTabNavigator }
