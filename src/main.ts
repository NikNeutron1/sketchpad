/**
 * @license
 * Copyright 2025 Lukas Huhn. All Rights Reserved.
 *
 * This software is proprietary and confidential. Unauthorized copying, distribution, or modification of this software,
 * or any portion thereof, is strictly prohibited. This includes, but is not limited to, the use of this software
 * for training artificial intelligence models or machine learning algorithms.
 */

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
