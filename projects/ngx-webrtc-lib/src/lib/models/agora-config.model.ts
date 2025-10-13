import { InjectionToken } from '@angular/core';

/**
 * Configuration options for the Agora SDK.
 * @publicApi
 */
export interface AgoraConfig {
  /**
   * The App ID provided by Agora.
   * Used to initialize the Agora SDK.
   */
  AppID: string;

  /**
   * Whether to enable debugging for Agora SDK.
   * Defaults to `false` if not specified.
   */
  debug?: boolean;

  /**
   * Whether to enable the Agora Virtual Background feature.
   * Currently, only the "blur" mode is supported.
   * Defaults to `false` if not specified.
   */
  useVirtualBackground?: boolean;
}

// Injection token for providing the AgoraConfig in Angular's dependency injection system.
export const AGORA_CONFIG = new InjectionToken<AgoraConfig>('AgoraConfig');
