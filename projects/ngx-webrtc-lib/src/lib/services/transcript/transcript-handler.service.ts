/**
 * @jsdoc
 * Abstract class for handling transcript events.
 *
 * Implement this class to define custom behavior for starting and stopping transcription processes.
 *
 * @abstract
 */
export abstract class TranscriptHandler {
  abstract onStartTranscript(): void;
  abstract onStopTranscript(): void;
}
