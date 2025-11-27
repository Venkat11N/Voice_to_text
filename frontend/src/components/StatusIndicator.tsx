import React, { FC } from "react";
import {Text, StyleSheet, TextStyle} from 'react-native'
import { MESSAGES } from "../config/constants";
import { StatusIndicatorProps } from "../types";
import { colors } from '../styles/colors';


interface Styles {
  status: TextStyle;
}

const StatusIndicator: FC<StatusIndicatorProps> = ({
  isRecording,
  isProcessing
}) => {
  const getStatusText = (): string => {
    if (isRecording) return MESSAGES.RECORDING;
    if(isProcessing) return MESSAGES.PROCESSING;
    return MESSAGES.READY;
  };

  return <Text style={styles.status}>{getStatusText()}</Text>;

};

const styles= StyleSheet.create<Styles>({
  status: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default StatusIndicator;