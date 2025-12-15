import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeSl from '@angular/common/locales/sl';

import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeSl, 'sl-SI');

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    { provide: LOCALE_ID, useValue: 'sl-SI' },
  ],
}).catch((err) => console.error(err));
