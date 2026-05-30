import dateFormat from 'date-fns/format';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';
import React from 'react';

import { groupBy } from '@/utils';

interface IProps {
  data: IView[];
}

export const ViewChart: React.FC<IProps> = ({ data: propsData = [] }) => {
  const formatData = propsData.map((d) => {
    return {
      ...d,
      updateAt: dateFormat(new Date(d.updateAt), 'yyyy-MM-dd'),
    };
  });
  const grouped = groupBy(formatData, (d) => d.updateAt);
  const data = Object.keys(grouped).reduce((a, updateAt) => {
    a.push({ updateAt, count: grouped[updateAt].reduce((a, c) => (a += c.count), 0) });
    return a;
  }, []);

  const option = {
    grid: {
      top: '3%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter(d) {
        const target = d && d[0] && data[d[0].dataIndex];

        return `日期：${target.updateAt}<br />访问量：${target.count}`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.updateAt),
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
    },
    dataZoom: [
      {
        type: 'inside',
      },
      {
        handleIcon:
          'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: 'var(--bg)',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
      },
    ],
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          color: 'rgb(255, 70, 131)',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 158, 68)',
            },
            {
              offset: 1,
              color: 'rgb(255, 70, 131)',
            },
          ]),
        },
        data: data.map((d) => d.count),
      },
    ],
  };

  return <ReactEcharts key={JSON.stringify(option)} option={option} />;
};
