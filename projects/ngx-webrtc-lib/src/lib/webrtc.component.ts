import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { take } from 'rxjs/operators';
import { fadeAnimation } from './animations';
import { DialogComponent } from './components';
import { User } from './models';
import { WebRtcService } from './services';

interface OnInitWebRtc {
  onInitWebRtc(): void;
  canInitWebRtc(): boolean;
}

/**
 * The `WebRtcComponent` handles WebRTC-based video calling functionality.
 * It initializes the WebRTC service and manages the stream and call states.
 * It also provides control over video and audio settings.
 *
 * @publicApi
 */
@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
})
export class WebRtcComponent extends DialogComponent implements OnInitWebRtc, OnDestroy {

  /**
   * User identifier for the WebRTC session.
   */
  @Input() uid: string;

  /**
   * Authentication token for the WebRTC session (optional).
   */
  @Input() token: string;

  /**
   * Channel identifier for the WebRTC session.
   */
  @Input() channel: string;

  /**
   * Represents the current user in the call.
   * Optional, used for reference or display purposes.
   */
  @Input() localUser: User;

  /**
   * Represents the remote user in the call.
   * Optional, used for reference or display purposes.
   */
  @Input() remoteUser: User;

  /**
   * Flag to enable/disable animation in the WebRTC component.
   * Default is true.
   */
  @Input() animate = true;

  /**
   * Flag to enable/disable small screen mode.
   * Default is false.
   */
  @Input() displaySmallScreen = false;

  /**
   * Event emitter that emits when the call ends.
   */
  @Output() callEnd = new EventEmitter<void>();
  @HostBinding('class.small-screen') smallScreenEnabled = false;
  @HostBinding('class.active') active = false;

  public streamState$ = this.webRtcService.streamState$;
  public remoteStreamVideoToggle$ = this.webRtcService.remoteStreamVideoToggle$;
  public remoteStreamAudioToggle$ = this.webRtcService.remoteStreamAudioToggle$;
  public controlsVisibility$ = new BehaviorSubject<boolean>(true);
  public webRtcInitialized = false;

  constructor(
    private webRtcService: WebRtcService,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  onInitWebRtc(): void {
    if (this.canInitWebRtc()) {
      this.webRtcInitialized = true;
      this.webRtcService.init(this.uid, this.channel, this.token)
        .pipe(take(1))
        .subscribe(() => {
          this.active = this.smallScreenEnabled;
          this.callEnd.emit();
          this.closeDialog(true);
        });
    }
  }

  ngOnDestroy(): void {
    this.webRtcService.deinit();
  }

  get localContainerId(): string {
    return this.webRtcService.localContainerId;
  }

  get remoteCalls(): string[] {
    return this.webRtcService.remoteCalls;
  }

  get cameraEnabled(): boolean {
    return this.webRtcService.isVideoEnabled();
  }

  get microphoneEnabled(): boolean {
    return this.webRtcService.isAudioEnabled();
  }

  get fullScreenEnabled(): boolean {
    return !!document.fullscreenElement;
  }

  get blurEnabled(): boolean {
    return this.webRtcService.isBlurEnabled();
  }

  get screenShareEnabled(): boolean {
    return this.webRtcService.isScreenShared();
  }

  get useVirtualBackground(): boolean {
    return this.webRtcService.useVirtualBackground();
  }

  onToggleCamera(state: boolean): void {
    this.webRtcService.toggleVideo(state);
  }

  onToggleMicrophone(state: boolean): void {
    this.webRtcService.toggleAudio(state);
  }

  onToggleFullScreen(state: boolean): void {
    this.webRtcService.toggleFullScreen(state);
  }

  onToggleSmallScreen(state: boolean): void {
    this.smallScreenEnabled = !state;
    this.active = true;
  }

  onToggleBlur(state: boolean): void {
    this.webRtcService.toggleBlur(state);
  }

  async onToggleScreenShare(state: boolean): Promise<void> {
    await this.webRtcService.toggleScreenShare(state);
  }

  onEndCall(): void {
    this.webRtcService.endCall();
  }

  canInitWebRtc(): boolean {
    return !this.webRtcInitialized;
  }
}
