import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
} from '@angular/core';

import { AsyncPipe, isPlatformBrowser, NgIf } from '@angular/common';
import { take } from 'rxjs/operators';
import { fadeAnimation } from './animations';
import { ControlsComponent, DialogComponent, SpinnerComponent, TimerComponent } from './components';
import { ToggleDirective } from './directives';
import { WebRtcService } from './services';

interface OnInitWebRtc {
  onInitWebRtc(): void;
  canInitWebRtc(): boolean;
}

@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ControlsComponent,
    SpinnerComponent,
    TimerComponent,
    ToggleDirective,
  ],
})
export class WebRtcComponent extends DialogComponent implements OnInitWebRtc, OnDestroy {
  @Input() uid: string;
  @Input() token: string;
  @Input() channel: string;
  @Input() animate = true;
  @Input() displaySmallScreen = false;
  @Input() debug = false;
  @Output() callEnd = new EventEmitter<void>();
  @HostBinding('class.small-screen') smallScreenEnabled = false;
  @HostBinding('class.active') active = false;

  private readonly platformId = inject(PLATFORM_ID);
  public streamState$ = this.webRtcService.streamState$;
  public remoteStreamVideoToggle$ = this.webRtcService.remoteStreamVideoToggle$;
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
      this.webRtcService.init(this.uid, this.channel, this.token, this.debug)
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

  onEndCall(): void {
    this.webRtcService.endCall();
  }

  canInitWebRtc(): boolean {
    return !this.webRtcInitialized && isPlatformBrowser(this.platformId);
  }
}
