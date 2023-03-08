import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkMenuModule } from '@angular/cdk/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PriceChartComponent } from './price-chart/price-chart.component';
import { DataService } from './data.service';

@NgModule({
    declarations: [AppComponent, PriceChartComponent],
    imports: [
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        CdkMenuModule,
        BrowserAnimationsModule,
        NgxEchartsModule.forRoot({ echarts }),
    ],
    providers: [DataService],
    bootstrap: [AppComponent],
})
export class AppModule {}
