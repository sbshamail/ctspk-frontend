interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
  SpeechRecognition: new () => SpeechRecognition;
}