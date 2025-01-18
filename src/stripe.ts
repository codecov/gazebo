export const StripeAppearance = (isDarkMode: boolean) => {
  return {
    appearance: {
      variables: {
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif',
      },
      rules: {
        '.Label': {
          fontWeight: '600',
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Input': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Input:focus': {
          borderColor: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Tab': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Tab:hover': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Tab--selected': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.PickerItem': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.PickerItem:hover': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.PickerItem--selected': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
        },
      },
    },
  }
}
