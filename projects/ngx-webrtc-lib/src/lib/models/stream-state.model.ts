export interface StreamState {
  connected: boolean;
  loading: boolean;
  statusText: string;
  started: number | null;
  ended: boolean;
  error: boolean;
}

export const DEFAULT_STREAM_STATE: StreamState = {
  connected: false,
  loading: true,
  statusText: 'Initializing',
  started: null,
  ended: false,
  error: false,
};
