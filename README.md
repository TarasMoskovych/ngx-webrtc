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

[![npm version](https://badge.fury.io/js/ngx-webrtc-lib.svg)](https://badge.fury.io/js/ngx-webrtc-lib) ![npm downloads](https://img.shields.io/npm/dm/ngx-webrtc-lib) [![Build Status](https://github.com/TarasMoskovych/ngx-webrtc/workflows/premerge/badge.svg)](https://github.com/TarasMoskovych/ngx-webrtc/actions) [![codecov](https://codecov.io/gh/TarasMoskovych/ngx-webrtc/branch/main/graph/badge.svg)](https://codecov.io/gh/TarasMoskovych/ngx-webrtc)

> This library provides an easy-to-integrate UI for video communication between two users in an Angular application. Built using the [Agora WebRTC SDK](https://www.agora.io), it offers full control over the video communication experience, enabling you to customize it based on your needs.

With `ngx-webrtc-lib`, you can easily integrate real-time, peer-to-peer video communication features into your web app. This is ideal for building applications that require direct video interaction, such as customer support, remote consultations, or any use case involving live, two-way video communication.

![Video Communication in Action](https://raw.githubusercontent.com/TarasMoskovych/ngx-webrtc/refs/heads/main/src/assets/ngx-webrtc-lib-min.png)

## Prerequisites
To get started with Agora, follow this [guide](https://www.agora.io/en/blog/how-to-get-started-with-agora/?utm_source=medium&utm_medium=blog&utm_campaign=Add_Video_Calling_in_your_Web_App_using_Agora_Web_NG_SDK) to retrieve the `AppID`.

## Installation

Install `ngx-webrtc-lib` from `npm`:
```bash
npm install ngx-webrtc-lib
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

Include `WebRtcComponent` in the imports of your standalone host component:

```ts
import { WebRtcComponent } from 'ngx-webrtc-lib';

@Component({
  standalone: true,
  template: `<ngx-webrtc .../>`,
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
    remoteUser: this.remoteUser,
    localUser: this.localUser,
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

## Version Compatibility

The supported versions start from 3.x, which is compatible with Angular 12. The next major version after 3.x is 13.x, which corresponds to Angular 13. From there, each library version aligns with its respective Angular major version (e.g., 14.x for Angular 14, 15.x for Angular 15, etc.).
For NodeJS compatibility, refer to the [Angular Version Reference](https://angular.dev/reference/versions).

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
| @Input() remoteUser: User             | Represents the remote user in the call. Optional, used for reference or display purposes.                                                 |
| @Input() localUser: User              | Represents the current user in the call. Optional, used for reference or display purposes.                                                |
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
| outcome: boolean     | Defines the UI for incoming or outgoing call modes.                                                                                       |
| remoteUser: User     | Represents the remote user in the call.  It replaces the `user` field and should be used instead.                                         |
| localUser: User      | Represents the current user in the call.  Optional, used for reference or display purposes.                                               |

### VideoCallDialog

| Name                                                              | Description                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| acceptCall: () => void                                            | Closes the confirmation dialog and opens `WebRtcComponent` with passed data before.    |
| close: () => void                                                 | Closes the dialog with video-call confirmation component.                              |
| afterConfirmation: () => Observable<VideoCallDialogData \| null>; | Returns Observable with the data depends on accepting or declining the call.           |
| afterCallEnd: () => Observable<boolean>;                          | Returns Observable with the value when the call is ended.                              |

### User

| Name                 | Description                          |
| ---------------------| ------------------------------------ |
| name: string         | The name of the user.                |
| photoURL: string     | The URL of the user's profile photo. |
