import { Component, OnInit  } from '@angular/core';
import { EChartsOption } from 'echarts';
import { DataService } from '../data.service';
import {io} from 'socket.io-client';

const socket = io('wss://test.deribit.com/ws/api/v2');
const message = {
  method: 'public/subscribe',
  params: {
    channels: ['ticker.BTC-PERPETUAL.100ms']
  },
  jsonrpc: '2.0',
  id: 1
};
socket.emit('message', message);
socket.on('message', (data) => {
  const { method, params } = data;

  if (method === 'subscription') {
    const { channel, data: tickerData } = params;

    if (channel === 'ticker.BTC-PERPETUAL.100ms') {
      const formattedData = {
        timestamp: tickerData.timestamp,
        price: tickerData.last_price
      };

      // Call a method on your chart component to update the data
      //this.chartComponent.updateData(formattedData);
      console.log(formattedData);
    }
  }
});

@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})

export class PriceChartComponent implements OnInit {

  echartsInstance : any;
  data: any;
  dataSplitted: any;
  constructor(private dataService: DataService) { }
  
  ngOnInit(): void {
    this.dataService.getData().subscribe(data => {
      this.data = data; 
      this.dataSplitted = splitData(this.data);
      var opt = this.echartsInstance.getOption();
      opt.xAxis.data = this.dataSplitted.categoryData;
      opt.series[0].data = this.dataSplitted.values;
      this.echartsInstance.setOption(opt);
      console.log(this.dataSplitted.values);
    });
    
  }

  onChartInit(ec : any) {
    this.echartsInstance = ec;
  }

  
  chartOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: [],
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
    }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    series: [
      {        
          name: 'BITCOIN',
          type: 'candlestick',
          data: [],
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor
          },
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
    //var opt = this.echartsInstance.getOption();//.series[0].markLine;//.data[0].yAxis = 200;
    //opt.series[0].markLine.data[0].yAxis = 200;

    //this.echartsInstance.setOption(opt);
  }  
}
function splitData(rawData: (number | string)[][]) {
  const categoryData = [];
  const values = [];
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0]);
    values.push(rawData[i]);
  }
  return {
    categoryData: categoryData,
    values: values
  };
}
const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';


// read data above from service

