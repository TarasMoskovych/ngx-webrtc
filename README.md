# NgxWebrtc

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Build package

Run `npm run build:lib` to build the package. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

* * *

# ngx-webrtc-lib

[![https://nodei.co/npm/ngx-webrtc-lib.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/ngx-webrtc-lib.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/ngx-webrtc-lib)

[![npm version](https://badge.fury.io/js/ngx-webrtc-lib.svg)](https://badge.fury.io/js/ngx-webrtc-lib) ![npm downloads](https://img.shields.io/npm/dm/ngx-webrtc-lib) [![Build Status](https://github.com/TarasMoskovych/ngx-webrtc/workflows/premerge/badge.svg)](https://github.com/TarasMoskovych/ngx-webrtc/actions) [![codecov](https://codecov.io/gh/TarasMoskovych/ngx-webrtc/branch/main/graph/badge.svg)](https://codecov.io/gh/TarasMoskovych/ngx-webrtc)

> Angular microapp/library for Agora WebRTC client from [Agora.io](https://www.agora.io) using [agora-rtc-sdk-ng](https://www.npmjs.com/package/agora-rtc-sdk-ng).

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Prerequisites
To get started with Agora, follow this [guide](https://www.agora.io/en/blog/how-to-get-started-with-agora/?utm_source=medium&utm_medium=blog&utm_campaign=Add_Video_Calling_in_your_Web_App_using_Agora_Web_NG_SDK) to retrieve the `AppID`.

## Installation

Install `ngx-webrtc-lib` from `npm`:
```bash
npm install ngx-webrtc-lib --save
```

### Standalone Component support
To use the library in standalone mode, follow these steps:

Provide `WebRtc` configuration in `app.configs.ts` file
```ts
import { provideWebRtc } from 'ngx-webrtc-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWebRtc({
      AppID: 'Agora AppID',
    }),
    // Other providers
  ],
};
```

Import `WebRtcComponent` into the host component's imports:

```ts
import { WebRtcComponent } from 'ngx-webrtc-lib';

@Component({
  standalone: true,
  imports: [
    WebRtcComponent,
  ],
  ...
})
export class HostComponent {
  // Host component logic
}
```

### NgModule support

To use the library with NgModules, import `WebRtcModule` into your module's imports:

```js
import { WebRtcModule } from 'ngx-webrtc-lib';

@NgModule({
  ...
  imports: [
    WebRtcModule.forRoot({
      AppID: 'Agora AppID',
    }),
  ]
  ...
})
```


### Basic usage
Add `WebRtcComponent` to your component template:
```html
<ngx-webrtc
  [channel]="channel"
  [displaySmallScreen]="true"
  [uid]="uid"
  [token]="token"
  (callEnd)="onCallEnd()"
></ngx-webrtc>
```

### Advanced usage
The library allows you to display a video call confirmation dialog. To use the dialog service:
1. Inject `VideoCallDialogService` into your component or service.
2. Call the `open` method with the required data.

This returns `VideoCallDialog` object with an API that allows you to:
- Programmatically close the dialog
- Accept the call, which will open WebRtcComponent
- Subscribe to the dialog state

```ts
import { VideoCallDialogService, VideoCallDialogData } from 'ngx-webrtc-lib';

constructor(private dialogService: VideoCallDialogService) { }

onDialogOpen(): void {
  const dialog = this.dialogService.open({
    uid: this.uid,
    token: this.token,
    channel: this.channelId,
    outcome: this.outcome,
    user: this.user,
  });

  setTimeout(() => dialog.close(), 7000);
  dialog.afterConfirmation().subscribe((data: VideoCallDialogData) => console.log(data));
}
```

Import `assets` in your angular.json file

```json
"assets": [
  {
    "glob": "**/*",
    "input": "./node_modules/ngx-webrtc-lib/src/assets/",
    "output": "./assets/"
  }
],
```

For real-life video call confirmation behavior with multiple clients, where one client declines the call, and the result immediately reflects on the other clients, you need to implement your own custom solution.
This is an example of the implementation using [web-sockets](https://github.com/TarasMoskovych/angular-slack/pull/20/files).

### How to build lib for development

```bash
git clone https://github.com/TarasMoskovych/ngx-webrtc.git
cd ngx-webrtc
npm ci
npm start
```

## Compatibility

To use this library, please follow the versioning specified in the following table.

| `ngx-webrtc-lib`| Angular     | NodeJS
| --------------- | ------------| --------------------------------------|
| ~~1.x~~         | ^12.2.0     | ^12.14.0 \|\| ^14.15.0                |
| ~~2.x~~         | ^12.2.0     | ^12.14.0 \|\| ^14.15.0                |
| 3.x             | ^12.2.0     | ^12.14.0 \|\| ^14.15.0                |
| 13.x            | ~13.4.0     | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0  |
| 14.x            | ^14.3.0     | ^14.15.0 \|\| ^16.10.0                |
| 15.x            | ^15.2.10    | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0  |
| 16.x            | ^16.2.10    | ^16.14.0 \|\| ^18.10.0                |
| 17.x            | ^17.1.2     | ^18.13.0 \|\| ^20.9.0                 |
| 18.x            | ^18.2.10    | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0   |

## API reference

### AgoraConfig

| Name                 | Description                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| AppID                | The App ID provided by Agora to initialize the Agora SDK.                                               |
| debug                | Enable debugging for Agora SDK. Default value `false`                                                   |
| useVirtualBackground | Enable Agora Virtual Background feature (only the "blur" is currently supported). Default value `false` |

### WebRtcComponent

| Name                                  | Description |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| @Input() uid: string                  | User identifier.                                                                                                                          |
| @Input() token: string                | Agora token for [Secure Authentication](https://docs.agora.io/en/video-calling/get-started/authentication-workflow). Default value `null` |
| @Input() channel: string              | Channel identifier.                                                                                                                       |
| @Input() displaySmallScreen: boolean  | Display small screen toggle. Default value `false`                                                                                        |
| @Output() callEnd: EventEmitter<void> | Event that is emitted when the call is ended.                                                                                             |

### VideoCallDialogService

| Name                                               | Description                                  |
| -------------------------------------------------- | -------------------------------------------- |
| open: (`VideoCallDialogData`) => `VideoCallDialog` | Renders `VideoCallComponent` in the dialog.  |

### VideoCallDialogData

| Name                 | Description |
| ---------------------| ----------------------------------------------------------------------------------------------------------------------------------------- |
| uid: string          | User identifier.                                                                                                                          |
| channel: string      | Channel identifier.                                                                                                                       |
| token: string        | Agora token for [Secure Authentication](https://docs.agora.io/en/video-calling/get-started/authentication-workflow). Default value `null` |
| outcome: boolean     | Defines the UI for incoming or outgoing call modes.                                                                                           |
| user: User           | User name and photo URL.                                                                                                                  |

### VideoCallDialog

| Name                                                              | Description                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| acceptCall: () => void                                            | Closes the confirmation dialog and opens `WebRtcComponent` with passed data before.    |
| close: () => void                                                 | Closes the dialog with video-call confirmation component.                              |
| afterConfirmation: () => Observable<VideoCallDialogData \| null>; | Returns Observable with the data depends on accepting or declining the call.           |
| afterCallEnd: () => Observable<boolean>;                          | Returns Observable with the value when the call is ended.                              |
