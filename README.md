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

## Installation

Install `ngx-web-rtc-lib` from `npm`:
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

Add component to your page:
```html
<ngx-webrtc
  [channel]="channel"
  [debug]="true"
  [uid]="uid"
  (callEnd)="onCallEnd()"
></ngx-webrtc>
```

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
| 12.x            | 1.x                 |

## API reference

| Name                                  | Description |
| ------------------------------------- | --------------------------------------------- |
| @Input() uid: string                  | User identifier.                              |
| @Input() channel: string              | Channel identifier.                           |
| @Input() debug: boolean               | Enable debugging. Default value `false`       |
| @Output() callEnd: EventEmitter<void> | Event that is emitted when the call is ended. |
