import { Component, OnInit  } from '@angular/core';
import { EChartsOption } from 'echarts';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';

var msg = 
    {"jsonrpc": "2.0",
     "method": "public/subscribe",
     "id": 999,
     "params": {
        "channels": ["chart.trades.BTC-PERPETUAL.1"]}
    };

@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})


export class PriceChartComponent implements OnInit {
  echartsInstance : any;
  dataSource: DataItem[] = [];
  dataSplitted: any;
  mergeOptions = {};
  ws1 = new WebSocket('wss://localhost:7111/ws/api/v2');
  constructor(private http: HttpClient) { }

  chartOption: EChartsOption = {
    dataset: {
      source: this.dataSource
    },
    title: {
      text: 'BTC'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        }
      }
    },
    xAxis: {
      type: 'category',      
      boundaryGap: false,
      axisLine: { onZero: true },
      splitLine: { show: true },   
      min: 'dataMin',
      max: 'dataMax',
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
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor
          },
          encode: {
            x: 0,
            y: [1, 2, 3, 4]
          },
          markLine: { 
            data:[{
              yAxis:0.2,
              lineStyle: {
                color:'green'
              }}]
      }
      }   
    ],
  }
  
  ngOnInit(): void { 

    this.http.get<any>(
      'https://localhost:7111/api/v2/public/get_tradingview_chart_data?instrument_name=BTC-PERPETUAL&resolution=60&start_timestamp=1665535044204&end_timestamp=1676755044204'
    ).subscribe(data => {this.onData(data)});
    
    // = (data) => { this.onData(data) };
    
     

        this.ws1.onopen = this.onOpen;

        this.ws1.onmessage = (e) => {
          this.onTick(e);
        };    
  }

  onChartInit(ec : any) {
    this.echartsInstance = ec;
  }

  onClick($event: MouseEvent) {
    console.log($event);
    const yValue = this.echartsInstance.convertFromPixel({ seriesIndex: 0 }, [0, $event.offsetY])[1];
    console.log('Clicked y value:', yValue);
    var opt = this.echartsInstance.getOption();//.series[0].markLine;//.data[0].yAxis = 200;
   
    // append data to markline
    opt.series[0].markLine.data.push({yAxis: yValue, lineStyle: {color:'red'}});
    
    
    this.echartsInstance.setOption(opt);
  }

  onData(data: any) {
    console.log('onData:', data);
    console.log('this onData: ', this);
      /*const categoryData = data.result.ticks.map((tick:  number ) => echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss',new Date(tick))); //.toLocaleTimeString()
      const values = data.result.open.map((open: any, i: string | number) => [
        data.result.open[i],
        data.result.close[i],
        data.result.low[i],
        data.result.high[i]]);*/
        const dataArray: DataItem[] = data.result.ticks.map((tick: number, index: number) => [
          echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss',new Date(tick)), // convert tick to date string
          data.result.open[index],
          data.result.close[index],
          data.result.low[index],
          data.result.high[index],
          data.result.volume[index],
          data.result.cost[index]
        ]);
        this.dataSource = dataArray;
        //var opt = this.echartsInstance.getOption();
        //opt.dataset.source = this.dataSource;
        //console.log(this.dataSource);
        

        this.echartsInstance.setOption({
          dataset: {
            source: this.dataSource
          }
        });
        
    }

  onChartClick(e: any) {    
  }

  onTick(e: any) {
    // do something with the notifications...
    console.log('e: ', e);
    console.log('received from server 222: ', e.data);
    console.log('this: ', this);

    const data = JSON.parse(e.data);
    //console.log('zzz: ', data.params.data.tick);
    // this.mergeOptions 
    const opts: EChartsOption = {
      xAxis: {
        
        data: [echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss',new Date(data.params.data.tick))]      
        
      },
      series: [
        {
          data: [[
            data.params.data.open,
            data.params.data.close,
            data.params.data.low,
            data.params.data.high,
            data.params.data.volume,
            data.params.data.cost]]
        }
      ]
    };

    //const op = this.echartsInstance.getOption();

    //this.echartsInstance.setOption(opts, false);
  }

  onOpen(event: any) {
    console.log('onOpen: ', event);
    event.target.send(JSON.stringify(msg));    
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
type DataItem = [string, number, number, number, number, number, number];


// read data above from service

