interface ColorPalette {
  primary: string;
  danger: string;
  disabled: string;
  background: string;
  white: string;
  text: {
    primary: string;
    secondary: string;
    dark: string;
  };
  shadow: string;
  button: string;
}

export const colors: ColorPalette = {
  primary: '#007AFF',
  danger: '#FF3B30',
  disabled: '#CCC',
  background: '#F0F4F8',
  white: '#FFF',
  text: {
    primary: '#1A1A2E',
    secondary: '#666',
    dark: '#333',
  },
  shadow: '#000',
  button: '#E0E0E0',
};