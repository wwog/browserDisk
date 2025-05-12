import { themeQuartz, iconSetQuartzLight } from 'ag-grid-community';

export const myTheme = themeQuartz.withPart(iconSetQuartzLight).withParams({
  borderRadius: 0,
  browserColorScheme: 'light',
  columnBorder: true,
  fontFamily: {
    googleFont: 'Inclusive Sans',
  },
  fontSize: 14,
  headerBackgroundColor: '#FFFFFF',
  headerFontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen-Sans',
    'Ubuntu',
    'Cantarell',
    'Helvetica Neue',
    'sans-serif',
  ],
  headerFontSize: 14,
  headerFontWeight: 600,
  headerRowBorder: true,
  headerTextColor: '#000000',
  iconSize: 14,
  rowBorder: true,
  spacing: 4,
  wrapperBorder: true,
  wrapperBorderRadius: 0,
});
