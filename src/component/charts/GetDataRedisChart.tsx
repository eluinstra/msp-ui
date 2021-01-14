import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Line } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { props } from "rambda";
import { fillChartData } from '@/component/charts/ChartRedis'
import ChartRedis from '@/component/charts/ChartRedis'
import { Button } from '@material-ui/core'

type Props = {}

type State = {
  name: string
}

class ChartGetDataRedisChart extends Component<Props, State> {
    constructor(props) {
      super(props);
      this.state = {
        name: ""
      };
    }

    clickEvent(event) {
      this.setState({
      name: 'Getting data!'
    });

    /* get database records */
    fillChartData();

  }

  //  <!--<button title="Get Data" color="#841584" id="name" onClick={this.changeText.bind(this)} />-->

  render() {
     return (
       <div>
         <Button variant="contained" onClick={() => {{ this.clickEvent(this)  }}}>Get Data</Button>
         <h3>Answer: {this.state.name}</h3>
       </div>
     );
  }
}

export const GetDataRedisChart = () => {
  return (
    <React.Fragment>
      <h2>Chart from Redis</h2>
      <ChartRedis />

    </React.Fragment>
  )
}