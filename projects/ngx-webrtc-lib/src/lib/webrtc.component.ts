import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { take } from 'rxjs/operators';

import { AsyncPipe, NgIf } from '@angular/common';
import { fadeAnimation } from './animations';
import { ControlsComponent, DialogComponent, SpinnerComponent, TimerComponent } from './components';
import { ToggleDirective } from './directives';
import { WebRtcService } from './services';

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
export class WebRtcComponent extends DialogComponent implements OnInit, OnDestroy {
  @Input() uid: string;
  @Input() token: string;
  @Input() channel: string;
  @Input() animate = true;
  @Input() displaySmallScreen = false;
  @Input() debug = false;
  @Output() callEnd = new EventEmitter<void>();
  @HostBinding('class.small-screen') smallScreenEnabled = false;
  @HostBinding('class.active') active = false;

  public streamState$ = this.webRtcService.streamState$;
  public remoteStreamVideoToggle$ = this.webRtcService.remoteStreamVideoToggle$;

  constructor(
    private webRtcService: WebRtcService,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.webRtcService.init(this.uid, this.channel, this.token, this.debug)
      .pipe(take(1))
      .subscribe(() => {
        this.active = this.smallScreenEnabled;
        this.callEnd.emit();
        this.closeDialog(true);
      });
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
}
