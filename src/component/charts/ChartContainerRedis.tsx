import React from 'react'
import { Line } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing';
import { Button } from '@material-ui/core'
import { CChartRedis } from '@/component/charts/ChartRedis'

const styles = {
  graphContainer: {
    border: '1px solid black',
    padding: '15px'
  }
}

class ChartContainerRedis extends React.Component {

  chartReference = {};

  componentDidMount() {
    //console.log(this.chartReference); // returns a Chart.js instance reference
  }

  constructor(props) {
    super(props)

  }

  clickEvent(event) {
      this.setState({
      name: 'Getting data!'
    });

    this.forceUpdate();

  }

  componentDidUpdate()
  {
    //console.log("I updated"); // returns a Chart.js instance reference
  }

  render() {
    return (
      <div id="myChart" style={styles.graphContainer}>
        <Button variant="contained" onClick={() => {{ this.clickEvent(this)  }}}>Refresh Chart</Button>
        <CChartRedis />
      </div>
    )
  }
}

export const CChartContainerRedis = () => {
  return (
    <React.Fragment>
      <ChartContainerRedis />

    </React.Fragment>
  )
}
