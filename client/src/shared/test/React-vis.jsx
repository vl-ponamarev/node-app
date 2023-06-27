import React from 'react';
import {
  XYPlot,
  LineSeries,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines
} from 'react-vis';

const Chart = () => {
  const data = [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 6 },
    { x: 4, y: 8 },
    { x: 5, y: 9 }
  ];

  return (
    <XYPlot width={500} height={300}>
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis title="X Axis" />
      <YAxis title="Y Axis" />
      <LineSeries data={data} />
    </XYPlot>
  );
};

export default Chart;
