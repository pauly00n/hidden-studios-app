'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MapData {
  success: boolean;
  data: {
    start: number;
    step: number;
    values: number[];
    values_avg: number[];
    max_24h: number;
  };
}

// Calculate moving average
function calculateMovingAverage(data: number[], window: number): number[] {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - window + 1); j <= Math.min(data.length - 1, i + window - 1); j++) {
      sum += data[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

// Extract seasonal pattern (24-hour cycle with 10-minute intervals)
function extractSeasonalPattern(data: number[]): number[] {
  const pointsPerDay = 24 * 6; // 144 points per day (10-minute intervals)
  const numFullDays = Math.floor(data.length / pointsPerDay);
  const seasonalPattern = new Array(pointsPerDay).fill(0);
  const countPerSlot = new Array(pointsPerDay).fill(0);

  // Sum up values for each time slot
  for (let day = 0; day < numFullDays; day++) {
    for (let slot = 0; slot < pointsPerDay; slot++) {
      const value = data[day * pointsPerDay + slot];
      if (!isNaN(value)) {
        seasonalPattern[slot] += value;
        countPerSlot[slot]++;
      }
    }
  }

  // Calculate average for each time slot
  return seasonalPattern.map((sum, i) => sum / (countPerSlot[i] || 1));
}

// Generate projected data using seasonal pattern and trend
function generateProjection(
  values: number[], 
  lastTimestamp: number, 
  step: number, 
  seasonalPattern: number[]
): any[] {
  const projectedData = [];
  const thirtyDays = 30 * 24 * 60 * 60; // 30 days in seconds
  const numPoints = Math.floor(thirtyDays / step);
  
  // Calculate recent trend
  const recentValues = values.slice(-144); // Last 24 hours
  const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  
  // Calculate overall trend direction
  const trendDirection = values[values.length - 1] > values[0] ? 1 : -1;
  const trendStrength = 0.001; // Small daily trend factor

  for (let i = 0; i < numPoints; i++) {
    const timestamp = lastTimestamp + (i * step);
    const timeSlot = i % seasonalPattern.length;
    const daysPassed = Math.floor(i / seasonalPattern.length);
    
    // Combine seasonal pattern with slight trend
    let projectedValue = seasonalPattern[timeSlot] * 
      (1 + (trendDirection * trendStrength * daysPassed));
    
    // Normalize around recent average
    projectedValue = projectedValue * (avgRecent / (seasonalPattern.reduce((a, b) => a + b, 0) / seasonalPattern.length));
    
    // Ensure non-negative values and round to nearest integer
    projectedValue = Math.max(0, Math.round(projectedValue));

    // Format date to show only MM/DD
    const date = new Date(timestamp * 1000);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

    projectedData.push({
      time: formattedDate,
      projected: projectedValue,
      seasonal: seasonalPattern[timeSlot]
    });
  }

  return projectedData;
}

export default function MapDetailPage() {
  const params = useParams();
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayers, setCurrentPlayers] = useState<number>(0);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('mapData');
      if (!storedData) {
        setError('No map data found');
        return;
      }

      const mapData: MapData = JSON.parse(storedData);
      
      if (!mapData.success || !mapData.data) {
        setError('Invalid map data format');
        return;
      }

      // Extract seasonal pattern
      const seasonalPattern = extractSeasonalPattern(mapData.data.values);

      // Generate projection data
      const lastTimestamp = mapData.data.start + (mapData.data.values.length * mapData.data.step);
      const projectedData = generateProjection(
        mapData.data.values,
        lastTimestamp,
        mapData.data.step,
        seasonalPattern
      );

      setCurrentPlayers(mapData.data.values[mapData.data.values.length - 1]);
      setChartData(projectedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while loading the data');
      }
    }
  }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-lg border p-6">
        <h1 className="text-2xl font-bold mb-6">30-Day Player Count Forecast: {params.mapCode}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          Current Users: {currentPlayers} players (Updated hourly, ik how to fix this though for every 10min)
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--chart-1))" 
                name="Projected Players"
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="seasonal" 
                stroke="hsl(var(--chart-2))" 
                name="Base Pattern"
                dot={false}
                strokeDasharray="5 5"
                opacity={0.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          * Actual numbers will definitely vary, this is projected usage with seasonality taken into account
        </div>
      </div>
    </div>
  );
} 