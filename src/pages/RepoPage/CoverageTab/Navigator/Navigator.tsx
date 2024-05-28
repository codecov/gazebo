import { useHistory, useLocation } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { RadioTileGroup } from 'ui/RadioTileGroup'

const TABS = {
  overview: 'Overview',
  flags: 'Flags',
  components: 'Components',
} as const
type TabsValue = (typeof TABS)[keyof typeof TABS]

function getInitialSelection(path: string) {
  if (path.includes('/flags')) {
    return TABS.flags
  } else if (path.includes('/components')) {
    return TABS.components
  }
  return TABS.overview
}

interface CoverageTabNavigatorProps {
  provider: string
  owner: string
  repo: string
}

function CoverageTabNavigator({
  provider,
  owner,
  repo,
}: CoverageTabNavigatorProps) {
  const location = useLocation()
  const history = useHistory()

  const { coverage, flagsTab, componentsTab } = useNavLinks()
  const urls = {
    Overview: coverage.path({ provider, owner, repo }),
    Flags: flagsTab.path({ provider, owner, repo }),
    Components: componentsTab.path({ provider, owner, repo }),
  }

  return (
    <RadioTileGroup
      defaultValue={getInitialSelection(location.pathname)}
      onValueChange={(value: TabsValue) => {
        history.replace(urls[value])
      }}
      className="py-2"
    >
      <RadioTileGroup.Item value={TABS.overview} data-testid="overview-radio">
        <RadioTileGroup.Label>{TABS.overview}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item value={TABS.flags} data-testid="flags-radio">
        <RadioTileGroup.Label>{TABS.flags}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
      <RadioTileGroup.Item
        value={TABS.components}
        data-testid="components-radio"
      >
        <RadioTileGroup.Label>{TABS.components}</RadioTileGroup.Label>
      </RadioTileGroup.Item>
    </RadioTileGroup>
  )
}

export { CoverageTabNavigator }
