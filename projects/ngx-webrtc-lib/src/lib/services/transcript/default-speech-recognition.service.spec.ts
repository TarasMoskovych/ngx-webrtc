import { BehaviorSubject } from 'rxjs';
import { DefaultSpeechRecognition, SpeechRecognitionEvent } from './default-speech-recognition.service';

class MockSpeechRecognition {
  continuous = true;
  interimResults = true;
  lang = 'en-US';
  onresult: ((event: SpeechRecognitionEvent) => void);

  start(): void {
    this.onresult({
      resultIndex: 0,
      results: [
        [
          {
            transcript: 'Hello ',
          },
        ],
        [
          {
            transcript: 'world',
          },
        ],
      ],
    } as unknown as SpeechRecognitionEvent);
  }

  stop(): void {
  }
}

export const mockSpeechRecognition = () => {
  window.SpeechRecognition = MockSpeechRecognition;
  window.webkitSpeechRecognition = MockSpeechRecognition;
};

describe('DefaultSpeechRecognition', () => {
  const transcriptString = new BehaviorSubject<string>('');
  let service: DefaultSpeechRecognition;

  describe('SpeechRecognition API', () => {
    beforeAll(() => {
      mockSpeechRecognition();
      service = new DefaultSpeechRecognition(transcriptString);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('onStartTranscript', () => {
      it('should start speech recognition and emit transcript', () => {
        service.onStartTranscript();
        expect(transcriptString.value).toBe('Hello world');
      });
    });

    describe('onStopTranscript', () => {
      it('should stop speech recognition and clear transcript', () => {
        service.onStopTranscript();
        expect(transcriptString.value).toBe('');
      });
    });
  });

  describe('SpeechRecognition API not supported', () => {
    beforeAll(() => {
      window.webkitSpeechRecognition = undefined;
      window.SpeechRecognition = undefined;
    });

    it('should log an error when SpeechRecognition API is not supported', () => {
      try {
        new DefaultSpeechRecognition(transcriptString);
      } catch (error) {
        expect(error).toEqual(new Error('SpeechRecognition API is not supported in this browser.'));
      }
    });
  });
});
