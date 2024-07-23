export const BundleReportGroups = {
  JavaScript: 'JAVASCRIPT',
  CSS: 'STYLESHEET',
  Fonts: 'FONT',
  Images: 'IMAGE',
  Other: 'UNKNOWN',
} as const

export type BundleReportTypes = keyof typeof BundleReportGroups

export type BundleReportTypeEnums =
  (typeof BundleReportGroups)[keyof typeof BundleReportGroups]

const REPORT_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'REPORT_SIZE' as const
const JS_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'JAVASCRIPT_SIZE' as const
const CSS_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'STYLESHEET_SIZE' as const
const FONT_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'FONT_SIZE' as const
const IMAGE_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'IMAGE_SIZE' as const
const UNKNOWN_BUNDLE_MEASUREMENT_SIZE_MAPPING = 'ASSET_SIZE' as const

export function findBundleReportAssetEnum(item: string) {
  if (item === 'JAVASCRIPT') {
    return JS_BUNDLE_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'STYLESHEET') {
    return CSS_BUNDLE_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'FONT') {
    return FONT_BUNDLE_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'IMAGE') {
    return IMAGE_BUNDLE_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'UNKNOWN') {
    return UNKNOWN_BUNDLE_MEASUREMENT_SIZE_MAPPING
  } else {
    return REPORT_BUNDLE_MEASUREMENT_SIZE_MAPPING
  }
}
