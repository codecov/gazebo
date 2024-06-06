import { useMemo } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { RadioTileGroup } from 'ui/RadioTileGroup'

const TABS = {
  Overview: 'Overview',
  Flags: 'Flags',
  Components: 'Components',
} as const
type TabsValue = (typeof TABS)[keyof typeof TABS]
type TabsUrls = Record<keyof typeof TABS, string>

function getSelection(path: string, urls: TabsUrls) {
  if (path === urls.Flags) {
    return TABS.Flags
  }
  if (path === urls.Components) {
    return TABS.Components
  }
  return TABS.Overview
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function CoverageTabNavigator() {
  const { provider, owner, repo } = useParams<URLParams>()
  const location = useLocation()
  const history = useHistory()
  const { coverage, flagsTab, componentsTab } = useNavLinks()

  const urls = useMemo(
    () => ({
      Overview: coverage.path({ provider, owner, repo }),
      Flags: flagsTab.path({ provider, owner, repo }),
      Components: componentsTab.path({ provider, owner, repo }),
    }),
    [coverage, flagsTab, componentsTab, owner, provider, repo]
  )

  const value = useMemo(
    () => getSelection(location.pathname, urls),
    [location.pathname, urls]
  )

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
