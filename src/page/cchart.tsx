import React from "react";
import { Line } from "react-chartjs-2";
//require ("chartjs-plugin-streaming");

const Chart = props => <Line height={350} data={props.data} options={props.options} />;

export default Chart;