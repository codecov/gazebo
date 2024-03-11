import ComponentsMultiSelect from 'pages/RepoPage/CoverageTab/subroute/ComponentsMultiSelect'
import { LINE_STATE } from 'shared/utils/fileviewer'

import {
  TitleCoverage,
  TitleFlags,
  TitleHitCount,
} from '../../../../ui/FileViewer/ToggleHeader/Title/Title'

function ToggleHeader({
  showHitCount = false,
  showFlagsSelect = false,
  showComponentsSelect = false,
}) {
  const keyPadding = showComponentsSelect || showFlagsSelect ? '' : 'pt-3'
  return (
    <div
      className={`flex w-full flex-1 flex-wrap items-start gap-2 bg-white px-0 sm:flex-row sm:items-center md:mb-1 lg:w-auto lg:flex-none ${keyPadding}`}
    >
      <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
      <TitleCoverage coverage={LINE_STATE.PARTIAL} />
      <TitleCoverage coverage={LINE_STATE.COVERED} />
      <TitleHitCount showHitCount={showHitCount} />
      <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 md:mt-2 md:w-auto">
        {showFlagsSelect ? <TitleFlags /> : null}
        {showComponentsSelect ? <ComponentsMultiSelect /> : null}
      </div>
    </div>
  )
}

export default ToggleHeader
