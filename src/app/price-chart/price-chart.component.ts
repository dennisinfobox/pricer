import { Component, OnInit  } from '@angular/core';
import { EChartsOption } from 'echarts';


@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})

export class PriceChartComponent implements OnInit {

  echartsInstance : any;
  
  ngOnInit(): void {
    
  }

  onChartInit(ec : any) {
    this.echartsInstance = ec;
  }

  
  chartOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        markLine: {
          data:[{
            yAxis:500,
            lineStyle: {
              color:'red'
            }}]
         }
      }      
    ],
  }; 

  onClick($event: MouseEvent) {
    console.log($event);
    const yValue = this.echartsInstance.convertFromPixel({ seriesIndex: 0 }, [0, $event.offsetY])[1];
    console.log('Clicked y value:', yValue);
    var opt = this.echartsInstance.getOption();//.series[0].markLine;//.data[0].yAxis = 200;
   
    // append data to markline
    opt.series[0].markLine.data.push({yAxis: yValue, lineStyle: {color:'red'}});
    
    
    this.echartsInstance.setOption(opt);
  }

  onChartClick($event: any) {
    var opt = this.echartsInstance.getOption();//.series[0].markLine;//.data[0].yAxis = 200;
    opt.series[0].markLine.data[0].yAxis = 200;

    this.echartsInstance.setOption(opt);
  }

  
}
