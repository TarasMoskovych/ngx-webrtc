export interface StreamState {
  connected: boolean;
  loading: boolean;
  statusText: string;
  started: number | null;
  ended: boolean;
}

export const DEFAULT_STREAM_STATE: StreamState = {
  connected: false,
  loading: true,
  statusText: 'Connecting',
  started: null,
  ended: false,
};
