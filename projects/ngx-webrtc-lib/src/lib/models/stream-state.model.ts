export interface StreamState {
  connected: boolean;
  loading: boolean;
  loaderText: string;
  started: number | null;
  ended: boolean;
}

export const DEFAULT_STREAM_STATE: StreamState = {
  connected: false,
  loading: true,
  loaderText: 'Connecting',
  started: null,
  ended: false,
};
