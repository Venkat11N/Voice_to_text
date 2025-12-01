import React, { FC, useRef, useEffect } from 'react';
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
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MicButton from './src/components/MicButton';
import TranscriptDisplay from './src/components/TrasncriptDispaly';
import KeyboardInput from './src/components/KeyboardInput';
import { useVoiceRecorder } from './src/hooks/useVoiceRecorder';
import { globalStyles } from './src/styles/globalStyles';
import { colors } from './src/styles/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Styles {
  container: ViewStyle;
  innerContainer: ViewStyle;
  scrollContent: ViewStyle;
  inputSection: ViewStyle;
  voiceSection: ViewStyle;
  keyboardSection: ViewStyle;
  clearButton: ViewStyle;
  clearText: TextStyle;
  orText: TextStyle;
  inputMethodText: TextStyle;
  transcriptSection: ViewStyle;
}

const App: FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  
  const {
    transcript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  } = useVoiceRecorder();

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleKeyboardSubmit = (text: string): void => {
    setTranscript(text);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 40 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <Text style={globalStyles.title}>💬 Voice & Text</Text>
            <Text style={globalStyles.subtitle}>Speak or Type Your Message</Text>

            {/* Display Area */}
            <View style={styles.transcriptSection}>
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
                  <Text style={styles.clearText}>Clear Text</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              {/* Voice Input Section */}
              <View style={styles.voiceSection}>
                <Text style={styles.inputMethodText}>🎤 Hold to Record</Text>
                <MicButton
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                />
              </View>

              {/* OR Separator */}
              <Text style={styles.orText}>— OR —</Text>

              {/* Keyboard Input Section */}
              <View style={styles.keyboardSection}>
                <Text style={styles.inputMethodText}>⌨️ Type Your Message</Text>
                <KeyboardInput 
                  onSubmit={handleKeyboardSubmit}
                  isProcessing={isProcessing}
                />
              </View>
            </View>
          </ScrollView>
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
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transcriptSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputSection: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  keyboardSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 12,
    backgroundColor: colors.danger,
    borderRadius: 30,
    alignSelf: 'center',
  },
  clearText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  orText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 20,
  },
  inputMethodText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 10,
  },
});

export default App;