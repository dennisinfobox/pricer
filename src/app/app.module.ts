import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxEchartsModule } from 'ngx-echarts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PriceChartComponent } from './price-chart/price-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    PriceChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    //NgxEchartsModule.forRoot({ echarts: () => import('echarts'), })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
