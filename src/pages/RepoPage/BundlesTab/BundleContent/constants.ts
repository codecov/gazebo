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

// report represents the entire bundle report data
const BUNDLE_REPORT_MEASUREMENT_SIZE_MAPPING = 'REPORT_SIZE' as const
const BUNDLE_JS_MEASUREMENT_SIZE_MAPPING = 'JAVASCRIPT_SIZE' as const
const BUNDLE_CSS_MEASUREMENT_SIZE_MAPPING = 'STYLESHEET_SIZE' as const
const BUNDLE_FONT_MEASUREMENT_SIZE_MAPPING = 'FONT_SIZE' as const
const BUNDLE_IMAGE_MEASUREMENT_SIZE_MAPPING = 'IMAGE_SIZE' as const
const BUNDLE_UNKNOWN_MEASUREMENT_SIZE_MAPPING = 'ASSET_SIZE' as const

export function findBundleReportAssetEnum(item: string) {
  if (item === 'JAVASCRIPT') {
    return BUNDLE_JS_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'STYLESHEET') {
    return BUNDLE_CSS_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'FONT') {
    return BUNDLE_FONT_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'IMAGE') {
    return BUNDLE_IMAGE_MEASUREMENT_SIZE_MAPPING
  } else if (item === 'UNKNOWN') {
    return BUNDLE_UNKNOWN_MEASUREMENT_SIZE_MAPPING
  } else {
    return BUNDLE_REPORT_MEASUREMENT_SIZE_MAPPING
  }
}
