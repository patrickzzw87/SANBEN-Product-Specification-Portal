import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { PolarDataPoint } from '../types';

interface PolarChartProps {
  data: PolarDataPoint[];
  beamAngle: string;
}

export const PolarChart: React.FC<PolarChartProps> = ({ data, beamAngle }) => {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center border border-gray-200 rounded p-4 bg-white">
      <h4 className="text-sm font-bold text-gray-500 mb-2">Luminous Intensity Distribution</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="angle" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} tick={false} axisLine={false} />
          <Radar
            name="Light Distribution"
            dataKey="A"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="#0ea5e9"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-400 mt-2">Avg. Beam Angle: ~{beamAngle}</div>
    </div>
  );
};