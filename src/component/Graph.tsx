import React from 'react'
import { Line } from 'react-chartjs-2'

export const Graph = props => {
  return (
    <Line
      data={{
        datasets: props.datasets
      }}
      options={{
        scales: {
          xAxes: [{
            realtime: {
              onRefresh: function(chart) {
                chart.data.datasets.forEach(function(dataset) {
                  dataset.data.push({
                    x: Date.now(),
                    y: Math.random()
                  });
                });
              },
              delay: 2000
            }
          }]
        }
      }}
    />
  )
}