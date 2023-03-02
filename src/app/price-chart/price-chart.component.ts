import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';

@Component({
    selector: 'app-price-chart',
    templateUrl: './price-chart.component.html',
    styleUrls: ['./price-chart.component.css'],
})
export class PriceChartComponent implements OnInit {
    selectedTimeFrame: string = '1min';
    echartsInstance: any;
    dataSource: DataItem[] = [];
    dataSplitted: any;
    mergeOptions = {};
    ws1: WebSocket | undefined;
    yCoord: number | undefined;
    contextMenuTop: any;
    contextMenuLeft: any;
    constructor(private http: HttpClient) {}

    chartOption: EChartsOption = {
        dataset: {
            source: this.dataSource,
        },
        title: {
            text: 'BTC',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
            },
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false,
                },
            },
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            //axisLine: { onZero: true },
            splitLine: { show: true },
            min: 'dataMin',
            max: 'dataMax',
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 50,
                end: 100,
            },
            {
                show: true,
                type: 'slider',
                top: '90%',
                start: 50,
                end: 100,
            },
        ],
        series: [
            {
                name: 'BITCOIN',
                type: 'candlestick',
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor,
                },
                encode: {
                    x: 0,
                    y: [1, 2, 3, 4],
                },
                markLine: {
                    data: [
                        /*{
                            yAxis: 0.2,
                            lineStyle: {
                                color: 'green',
                            },
                        },*/
                    ],
                },
            },
        ],
    };

    ngOnInit(): void {
        this.doDataSubscribe();
    }
    private doDataSubscribe() {
        const interval = this.getBarInterval();
        const currentTimestamp: number = Date.now();
        const minutesAgo: number = interval * 600; // set number of minutes ago
        const millisecondsAgo: number = minutesAgo * 60 * 1000; // convert minutes to milliseconds
        const timestampStart: number = currentTimestamp - millisecondsAgo; // calculate timestamp 600 minutes ago

        if (this.ws1) {
            this.ws1.close();
        }

        this.ws1 = new WebSocket('wss://localhost:7111/ws/api/v2');

        this.http
            .get<any>(
                `https://localhost:7111/api/v2/public/get_tradingview_chart_data?instrument_name=BTC-PERPETUAL&resolution=${interval}&start_timestamp=${timestampStart}&end_timestamp=${currentTimestamp}`
            )
            .subscribe((data) => {
                this.onData(data);
            });

        this.ws1.onopen = (e) => {
            this.onOpen(e);
        };

        this.ws1.onmessage = (e) => {
            this.onTick(e);
        };

        setInterval(() => {
            this.onInterval();
        }, 1000);
    }

    onInterval() {
        this.echartsInstance.setOption({
            dataset: {
                source: this.dataSource,
            },
        });
    }

    changeTimeFrame(timeFrame: string) {
        this.selectedTimeFrame = timeFrame;
        this.doDataSubscribe();
    }

    onChartInit(ec: any) {
        this.echartsInstance = ec;
    }

    onClick($event: MouseEvent) {
        console.log($event);
        const yValue = this.echartsInstance.convertFromPixel(
            { seriesIndex: 0 },
            [0, $event.offsetY]
        )[1];
        console.log('Clicked y value:', yValue);
        var opt = this.echartsInstance.getOption(); //.series[0].markLine;//.data[0].yAxis = 200;

        // append data to markline
        opt.series[0].markLine.data.push({
            yAxis: yValue,
            lineStyle: { color: 'red' },
        });

        this.echartsInstance.setOption(opt);
    }

    onData(data: any) {
        const dataArray: DataItem[] = data.result.ticks.map(
            (tick: number, index: number) => [
                echarts.format.formatTime(
                    'yyyy-MM-dd\nhh:mm:ss',
                    new Date(tick)
                ), // convert tick to date string
                data.result.open[index],
                data.result.close[index],
                data.result.low[index],
                data.result.high[index],
                data.result.volume[index],
                data.result.cost[index],
                tick,
            ]
        );
        this.dataSource = dataArray;

        this.echartsInstance.setOption({
            dataset: {
                source: this.dataSource,
            },
        });
    }

    onChartClick(e: any) {}

    onTick(e: any) {
        const data = JSON.parse(e.data);

        const dataItem: DataItem = [
            echarts.format.formatTime(
                'yyyy-MM-dd\nhh:mm:ss',
                new Date(data.params.data.tick)
            ),
            data.params.data.open,
            data.params.data.close,
            data.params.data.low,
            data.params.data.high,
            data.params.data.volume,
            data.params.data.cost,
            data.params.data.tick,
        ];
        console.log('dataItem: ', dataItem);

        // check if dataSource is empty or the new tick value is greater than the last tick value in dataSource
        if (
            this.dataSource.length === 0 ||
            dataItem[7] > this.dataSource[this.dataSource.length - 1][7]
        ) {
            this.dataSource.push(dataItem); // concatenate the new data
            console.log('concat ');
        } else {
            this.dataSource[this.dataSource.length - 1] = dataItem; // replace the last element
            console.log('replace ');
        }

        // this.dataSource = this.dataSource.concat(dataItem);
    }

    onOpen(event: any) {
        const symbol = 'BTC-PERPETUAL';
        const interval = this.getBarInterval();
        const msg = {
            jsonrpc: '2.0',
            method: 'public/subscribe',
            id: 999,
            params: {
                channels: [`chart.trades.${symbol}.${interval}`],
            },
        };
        console.log('onOpen: ', event);
        event.target.send(JSON.stringify(msg));
    }

    getBarInterval() {
        switch (this.selectedTimeFrame) {
            case '1min':
                return 1;
            case '5min':
                return 5;
            case '15min':
                return 15;
            case '1hr':
                return 60;
            case '3hr':
                return 180;
            default:
                return 1;
        }
    }

    onContextMenu($event: MouseEvent) {
        console.log($event);
        $event.preventDefault();
        this.yCoord = this.echartsInstance.convertFromPixel(
            { seriesIndex: 0 },
            [0, $event.offsetY]
        )[1];
        this.contextMenuTop = $event.clientY;
        this.contextMenuLeft = $event.clientX;
    }

    createHorizontalLine() {
        console.log('yCoord: ', this.yCoord);
        const opt = this.echartsInstance.getOption();
        opt.series[0].markLine.data.push({
            yAxis: this.yCoord,
            lineStyle: { color: 'blue' },
        });
        this.echartsInstance.setOption(opt);
    }
}

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';
type DataItem = [
    string,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

// read data above from service
