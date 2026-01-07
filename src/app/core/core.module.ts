import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

/**
 * Core Module
 * Contains singleton services, interceptors, and core functionality
 * Should be imported only once in AppModule
 */
@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ],
  providers: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}

