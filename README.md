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

[![npm version](https://badge.fury.io/js/ngx-webrtc-lib.svg)](https://badge.fury.io/js/ngx-webrtc-lib) [![Build Status](https://github.com/TarasMoskovych/ngx-webrtc/workflows/premerge/badge.svg)](https://github.com/TarasMoskovych/ngx-webrtc/actions) [![codecov](https://codecov.io/gh/TarasMoskovych/ngx-webrtc/branch/main/graph/badge.svg)](https://codecov.io/gh/TarasMoskovych/ngx-webrtc)

> Angular microapp/library for Agora WebRTC client from [Agora.io](https://www.agora.io) using [agora-rtc-sdk](https://www.npmjs.com/package/agora-rtc-sdk) and [ngx-agora](https://www.npmjs.com/package/ngx-agora).

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Installation

Install `ngx-webrtc-lib` from `npm`:
```bash
npm install ngx-webrtc-lib --save
```

Add wanted package to NgModule imports:
```js
import { WebRtcModule } from 'ngx-webrtc-lib';

@NgModule({
  ...
  imports: [
    WebRtcModule.forRoot({
      AppID: 'agora AppID',
    }),
  ]
  ...
})
```

You can get started with Agora by following this [guide](https://www.agora.io/en/blog/how-to-get-started-with-agora/?utm_source=medium&utm_medium=blog&utm_campaign=Add_Video_Calling_in_your_Web_App_using_Agora_Web_NG_SDK) and retrieve the Appid.

### Basic usage
Add `WebRtcComponent` to your component template:
```html
<ngx-webrtc
  [channel]="channel"
  [debug]="true"
  [uid]="uid"
  (callEnd)="onCallEnd()"
></ngx-webrtc>
```

### Advanced usage
The library allows you to display a video call confirmation dialog.
Inject `VideoCallDialogService` into your component/service and call `open` method by passing the required data.
It will return a dialog object `VideoCallDialog` with an API where you can programmatically close the dialog, accept the call (it will open `WebRtcComponent`) and subscribe to the dialog state.

```ts
import { VideoCallDialogService, VideoCallDialogData } from 'ngx-webrtc-lib';

constructor(private dialogService: VideoCallDialogService) { }

onDialogOpen(): void {
  const dialog = this.dialogService.open({
    uid: this.uid,
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

For the real-life video call confirmation behavior with multiple clients where one declines the call and it immediately reflects on the second client, you need to implement your own custom solution.
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

| Angular Version | `ngx-webrtc-lib` Version |
| --------------- | ------------------- |
| 12.x            | 1.x / 2.x           |

## API reference

### WebRtcComponent

| Name                                  | Description |
| ------------------------------------- | --------------------------------------------- |
| @Input() uid: string                  | User identifier.                              |
| @Input() channel: string              | Channel identifier.                           |
| @Input() debug: boolean               | Enable debugging. Default value `false`       |
| @Output() callEnd: EventEmitter<void> | Event that is emitted when the call is ended. |

### VideoCallDialogService

| Name                                               | Description                            |
| -------------------------------------------------- | -------------------------------------- |
| open: (`VideoCallDialogData`) => `VideoCallDialog` | Renders `WebRtcComponent` in the dialog.  |

### VideoCallDialogData

| Name                 | Description |
| ---------------------| ------------------------------------------------ |
| uid: string          | User identifier.                                 |
| channel: string      | Channel identifier.                              |
| outcome: boolean     | Defines the UI for income or outcome call mode.  |
| user: User           | User name and photo URL.                         |

### VideoCallDialog

| Name                                                              | Description                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| acceptCall: () => void                                            | Closes the confirmation dialog and opens `WebRtcComponent` with passed data before.    |
| close: () => void                                                 | Closes the dialog with video-call confirmation component.                              |
| afterConfirmation: () => Observable<VideoCallDialogData \| null>; | Returns Observable with the data depends on accepting or declining the call.           |
| afterCallEnd: () => Observable<boolean>;                          | Returns Observable with the value depends on the call ending.                          |
