import { Component, ElementRef, ViewChild, AfterViewInit   } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})

export class PriceChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
  myChart: any;
  constructor() {
    this.chartContainer = new ElementRef(null);
  } 

  ngAfterViewInit() {
    this.chartContainer.nativeElement.style.width = '500px';
    this.chartContainer.nativeElement.style.height = '300px';
    this.myChart = echarts.init(this.chartContainer.nativeElement);
    let options = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line'
      }]
    };

    this.myChart.setOption(options);
  }
}
