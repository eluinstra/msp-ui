import React, { useEffect, useState } from 'react'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import ReactApexChart from 'react-apexcharts'

var randomizeArray = function (arg) {
    var array = arg.slice();
    var currentIndex = array.length,
      temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

// data for the sparklines that appear below header area
var sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

export const ExampleTable = props => {
    const { driver, datasets } = props
    const data = {
      datasets: datasets
    }
    
    const options = {
        series: [{
            data: randomizeArray(sparklineData)
          }],
          options: {
            chart: {
              type: 'area',
              height: 160,
              sparkline: {
                enabled: true
              },
            },
            stroke: {
              curve: 'straight'
            },
            fill: {
              opacity: 0.3,
            },
            yaxis: {
              min: 0
            },
            colors: ['#DCE6EC'],
            title: {
              text: '$424,652',
              offsetX: 0,
              style: {
                fontSize: '24px',
              }
            },
            subtitle: {
              text: 'Sales',
              offsetX: 0,
              style: {
                fontSize: '14px',
              }
            }
          },
        
          seriesSpark2: [{
            data: randomizeArray(sparklineData)
          }],
          optionsSpark2: {
            chart: {
              type: 'area',
              height: 160,
              sparkline: {
                enabled: true
              },
            },
            stroke: {
              curve: 'straight'
            },
            fill: {
              opacity: 0.3,
            },
            yaxis: {
              min: 0
            },
            colors: ['#DCE6EC'],
            title: {
              text: '$235,312',
              offsetX: 0,
              style: {
                fontSize: '24px',
              }
            },
            subtitle: {
              text: 'Expenses',
              offsetX: 0,
              style: {
                fontSize: '14px',
              }
            }
          },
        
          seriesSpark3: [{
            data: randomizeArray(sparklineData)
          }],
          optionsSpark3: {
            chart: {
              type: 'area',
              height: 160,
              sparkline: {
                enabled: true
              },
            },
            stroke: {
              curve: 'straight'
            },
            fill: {
              opacity: 0.3
            },
            xaxis: {
              crosshairs: {
                width: 1
              },
            },
            yaxis: {
              min: 0
            },
            title: {
              text: '$135,965',
              offsetX: 0,
              style: {
                fontSize: '24px',
              }
            },
            subtitle: {
              text: 'Profits',
              offsetX: 0,
              style: {
                fontSize: '14px',
              }
            }
          },
        
          series1: [{
            data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
          }],
          options1: {
            chart: {
              type: 'line',
              width: 100,
              height: 35,
              sparkline: {
                enabled: true
              }
            },
            tooltip: {
              fixed: {
                enabled: false
              },
              x: {
                show: false
              },
              y: {
                title: {
                  formatter: function (seriesName) {
                    return ''
                  }
                }
              },
              marker: {
                show: false
              }
            }
          },
        
          series2: [{
            data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14]
          }],
          options2: {
            chart: {
              type: 'line',
              width: 100,
              height: 35,
              sparkline: {
                enabled: true
              }
            },
            tooltip: {
              fixed: {
                enabled: false
              },
              x: {
                show: false
              },
              y: {
                title: {
                  formatter: function (seriesName) {
                    return ''
                  }
                }
              },
              marker: {
                show: false
              }
            }
          },
        
          series3: [43, 32, 12, 9],
          options3: {
            chart: {
              type: 'pie',
              width: 40,
              height: 40,
              sparkline: {
                enabled: true
              }
            },
            stroke: {
              width: 1
            },
            tooltip: {
              fixed: {
                enabled: false
              },
            }
          },
        
          series4: [43, 32, 12, 9],
          options4: {
            chart: {
              type: 'donut',
              width: 40,
              height: 40,
              sparkline: {
                enabled: true
              }
            },
            stroke: {
              width: 1
            },
            tooltip: {
              fixed: {
                enabled: false
              },
            }
          },
        
          series5: [{
            data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
          }],
          options5: {
            chart: {
              type: 'bar',
              width: 100,
              height: 35,
              sparkline: {
                enabled: true
              }
            },
            plotOptions: {
              bar: {
                columnWidth: '80%'
              }
            },
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            xaxis: {
              crosshairs: {
                width: 1
              },
            },
            tooltip: {
              fixed: {
                enabled: false
              },
              x: {
                show: false
              },
              y: {
                title: {
                  formatter: function (seriesName) {
                    return ''
                  }
                }
              },
              marker: {
                show: false
              }
            }
          },
        
          series6: [{
            data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14]
          }],
          options6: {
            chart: {
              type: 'bar',
              width: 100,
              height: 35,
              sparkline: {
                enabled: true
              }
            },
            plotOptions: {
              bar: {
                columnWidth: '80%'
              }
            },
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            xaxis: {
              crosshairs: {
                width: 1
              },
            },
            tooltip: {
              fixed: {
                enabled: false
              },
              x: {
                show: false
              },
              y: {
                title: {
                  formatter: function (seriesName) {
                    return ''
                  }
                }
              },
              marker: {
                show: false
              }
            }
          },
        
          series7: [45],
          options7: {
            chart: {
              type: 'radialBar',
              width: 50,
              height: 50,
              sparkline: {
                enabled: true
              }
            },
            dataLabels: {
              enabled: false
            },
            plotOptions: {
              radialBar: {
                hollow: {
                  margin: 0,
                  size: '50%'
                },
                track: {
                  margin: 0
                },
                dataLabels: {
                  show: false
                }
              }
            }
          },
        
          series8: [53, 67],
          options8: {
            chart: {
              type: 'radialBar',
              width: 40,
              height: 40,
              sparkline: {
                enabled: true
              }
            },
            dataLabels: {
              enabled: false
            },
            plotOptions: {
              radialBar: {
                hollow: {
                  margin: 0,
                  size: '50%'
                },
                track: {
                  margin: 1
                },
                dataLabels: {
                  show: false
                }
              }
            }
          }
    }
  return (
    <div>
    <div className="row">
      <div className="col-md-4">
        <div id="chart-spark1">
    <ReactApexChart options={options.options} series={options.series} type="area" height={160} />
  </div>
      </div>
      <div className="col-md-4">
        <div id="chart-spark2">
    <ReactApexChart options={options.optionsSpark2} series={options.seriesSpark2} type="area" height={160} />
  </div>
      </div>
      <div className="col-md-4">
        <div id="chart-spark3">
    <ReactApexChart options={options.optionsSpark3} series={options.seriesSpark3} type="area" height={160} />
  </div>
      </div>
    </div>
  
    <div className="row">
      <table>
        <thead>
          <th>Total Value</th>
          <th>Percentage of Portfolio</th>
          <th>Last 10 days</th>
          <th>Volume</th>
        </thead>
        <tbody>
          <tr>
            <td>$32,554</td>
            <td>15%</td>
            <td>
              <div id="chart-1">
    <ReactApexChart options={options.options1} series={options.series1} type="line" height={35} width={100} />
  </div>
            </td>
            <td>
              <div id="chart-5">
    <ReactApexChart options={options.options5} series={options.series5} type="bar" height={35} width={100} />
  </div>
            </td>
          </tr>
          <tr>
            <td>$23,533</td>
            <td>7%</td>
            <td>
              <div id="chart-2">
    <ReactApexChart options={options.options2} series={options.series2} type="line" height={35} width={100} />
  </div>
            </td>
            <td>
              <div id="chart-6">
    <ReactApexChart options={options.options6} series={options.series6} type="bar" height={35} width={100} />
  </div>
            </td>
          </tr>
          <tr>
            <td>$54,276</td>
            <td>9%</td>
            <td>
              <div id="chart-3">
    <ReactApexChart options={options.options3} series={options.series3} type="pie" height={40} width={40} />
  </div>
            </td>
            <td>
              <div id="chart-7">
    <ReactApexChart options={options.options7} series={options.series7} type="radialBar" height={50} width={50} />
  </div>
            </td>
          </tr>
          <tr>
            <td>$11,533</td>
            <td>2%</td>
            <td>
              <div id="chart-4">
    <ReactApexChart options={options.options4} series={options.series4} type="donut" height={40} width={40} />
  </div>
            </td>
            <td>
              <div id="chart-8">
    <ReactApexChart options={options.options8} series={options.series8} type="radialBar" height={40} width={40} />
  </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    )
  }