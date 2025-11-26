import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';

interface GlobalStyles {
  container: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  shadow: ViewStyle;
}

export const globalStyles = StyleSheet.create<GlobalStyles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 40,
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});