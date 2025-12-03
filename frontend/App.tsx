import React, { FC, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TranscriptDisplay from './src/components/TrasncriptDispaly'; 
import KeyboardInput from './src/components/KeyboardInput';
import { useVoiceRecorder } from './src/hooks/useVoiceRecorder';
import { globalStyles } from './src/styles/globalStyles';
import { colors } from './src/styles/colors';
import {api} from './src/services/api'

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  transcriptSection: ViewStyle;
  clearButton: ViewStyle;
  clearText: TextStyle;
}

const App: FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    transcript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  } = useVoiceRecorder();

  const handleKeyboardSubmit = async (text: string): void => {
    setTranscript(text);
    // Keep keyboard open for faster chatting, or uncomment next line to close
    console.log('Saving text to DB...');
    await api.saveText(text);
    
    // Keyboard.dismiss(); 

  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        
        {/* This View handles the movement with the keyboard */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          
          {/* 1. Messages Area (Takes up all available space) */}
          <View style={{ flex: 1 }}>
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              // Auto-scroll to bottom when content changes (like new text appearing)
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              <Text style={globalStyles.title}>💬 Chat</Text>
              
              <View style={styles.transcriptSection}>
                <TranscriptDisplay 
                  transcript={transcript} 
                  isProcessing={isProcessing} 
                />

                {transcript && !isProcessing && (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearTranscript}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearText}>Clear Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          {/* 2. Input Bar (Sits at bottom, pushed up by KeyboardAvoidingView) */}
          <KeyboardInput 
            onSubmit={handleKeyboardSubmit}
            isProcessing={isProcessing}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
          />

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
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  transcriptSection: {
    width: '100%',
    marginBottom: 10,
  },
  clearButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.danger,
    borderRadius: 20,
    alignSelf: 'center',
    opacity: 0.9,
  },
  clearText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
});

export default App;