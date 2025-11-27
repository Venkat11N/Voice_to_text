import React, { FC } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MicButton from './src/components/MicButton';
import TranscriptDisplay from './src/components/TrasncriptDispaly';
import KeyboardInput from './src/components/KeyboardInput';
import { useVoiceRecorder } from './src/hooks/useVoiceRecorder';
import { globalStyles } from './src/styles/globalStyles';
import { colors } from './src/styles/colors';

const { width } = Dimensions.get('window');

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  inputContainer: ViewStyle;
  micContainer: ViewStyle;
  clearButton: ViewStyle;
  clearText: TextStyle;
  statusText: TextStyle;
  bottomInputSection: ViewStyle;
}

const App: FC = () => {
  const {
    transcript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  } = useVoiceRecorder();

  const handleKeyboardSubmit = (text: string): void => {
    setTranscript(text);
  };

  const getStatusText = (): string => {
    if (isRecording) return '🔴 Recording...';
    if (isProcessing) return '⏳ Processing...';
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={globalStyles.title}>💬 Voice & Text</Text>
            <Text style={globalStyles.subtitle}>Multiple Input Methods</Text>

            {/* Display Area */}
            <TranscriptDisplay 
              transcript={transcript} 
              isProcessing={isProcessing} 
            />

            {/* Clear Button */}
            {transcript && !isProcessing && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearTranscript}
                activeOpacity={0.7}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bottom Input Section - Always Visible */}
          <View style={styles.bottomInputSection}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            
            <View style={styles.inputContainer}>
              {/* Keyboard Input - Takes most space */}
              <View style={{ flex: 1 }}>
                <KeyboardInput 
                  onSubmit={handleKeyboardSubmit}
                  isProcessing={isProcessing}
                />
              </View>

              {/* Mic Button - Fixed size on the right */}
              <View style={styles.micContainer}>
                <TouchableOpacity
                  style={[
                    {
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: isRecording ? colors.danger : colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 10,
                    },
                    isProcessing && { backgroundColor: colors.disabled }
                  ]}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                  disabled={isProcessing}
                >
                  <Text style={{ fontSize: 28 }}>
                    {isRecording ? '🔴' : '🎤'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 120, // Space for bottom input
  },
  bottomInputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.button,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: colors.danger,
    borderRadius: 25,
  },
  clearText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default App;