import React, {FC} from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from'../styles/colors';
import { MESSAGES } from '../config/constants';
import { TranscriptDisplayProps } from '../types';


interface Styles {
  resultBox: ViewStyle;
  processingContainer: ViewStyle;
  processingText: TextStyle;
  transcript: TextStyle;
}

const TranscriptDisplay: FC <TranscriptDisplayProps> = ({
  transcript,
  isProcessing
}  )  => {
  return (
    <View style = {styles.resultBox}>
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>
            {MESSAGES.CONVERTING}
          </Text>
        </View>
      ) : (
        <Text style={styles.transcript}>
          {transcript || MESSAGES.DEFAULT}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  resultBox: {
    width: '100%',
    minHeight: 180,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 16,
  },
  transcript: {
    fontSize: 20,
    color: colors.text.dark,
    lineHeight: 30,
    textAlign: 'center',
  },
  });

  export default TranscriptDisplay;