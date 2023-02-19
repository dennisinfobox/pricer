import { Component, OnInit  } from '@angular/core';
import { EChartsOption } from 'echarts';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';


@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})


export class PriceChartComponent implements OnInit {

  echartsInstance : any;
  dataSource: DataItem[] = [];
  dataSplitted: any;
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.http.get<any>(
      'https://localhost:7111/api/v2/public/get_tradingview_chart_data?instrument_name=BTC-PERPETUAL&resolution=60&start_timestamp=1665535044204&end_timestamp=1676755044204'
    ).subscribe(data => {
      const categoryData = data.result.ticks.map((tick:  number ) => echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss',new Date(tick))); //.toLocaleTimeString()
      const values = data.result.open.map((open: any, i: string | number) => [
        data.result.open[i],
        data.result.close[i],
        data.result.low[i],
        data.result.high[i]]);
        const dataArray: DataItem[] = data.result.ticks.map((tick: number, index: number) => [
          echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss',new Date(tick)), // convert tick to date string
          data.result.open[index],
          data.result.high[index],
          data.result.close[index],
          data.result.low[index],
          data.result.volume[index],
          data.result.cost[index]
        ]);
        this.dataSource = dataArray;
        var opt = this.echartsInstance.getOption();
        //opt.dataset.source = this.dataSource;
        //console.log(opt.dataset.source);
        

        const chartOption2: EChartsOption = {
          
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
            data: categoryData,          
            boundaryGap: false,
            axisLine: { onZero: true },
            splitLine: { show: true },
            axisLabel: { show: true },
            axisTick: { show: true },
      
            min: 'dataMin',
            max: 'dataMax',
            show: true
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
                data: values,               
                itemStyle: {
                  color: upColor,
                  color0: downColor,
                  borderColor: upBorderColor,
                  borderColor0: downBorderColor
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
        }; 

        this.echartsInstance.setOption(chartOption2); 

      

      //var opt = this.echartsInstance.getOption();
      
      //
      //opt.series[0].data = values;
      //opt.xAxis.data = categoryData;
      //console.log(categoryData);
      //this.echartsInstance.setOption(opt, true);      
      
      //console.log(this.dataSplitted.values);
      
    });
    
  }

  onChartInit(ec : any) {
    this.echartsInstance = ec;
  }

  
  chartOption: EChartsOption = { }; 

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
type DataItem = [string, number, number, number, number, number, number];


// read data above from service

