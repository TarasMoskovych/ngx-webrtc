import { BehaviorSubject } from 'rxjs';
import { TranscriptHandler } from './transcript-handler.service';

export class DefaultSpeechRecognition extends TranscriptHandler {
  private recognition: InstanceType<SpeechRecognitionType>;

  constructor(private transcript$: BehaviorSubject<string>) {
    super();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('SpeechRecognition API is not supported in this browser.');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  override onStartTranscript(): void {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        this.transcript$.next(transcript);
      }
    };

    this.recognition.start();
  }

  override onStopTranscript(): void {
    this.transcript$.next('');
    this.recognition?.stop();
  }
}

export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType | undefined;
    webkitSpeechRecognition: SpeechRecognitionType | undefined;
  }
}

type SpeechRecognitionType = {
  new (): {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
  };
};
