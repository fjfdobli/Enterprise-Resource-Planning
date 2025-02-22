import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartProps {
  data: { [key: string]: number | string }[]
  dataKey: string
  xKey: string
  label: string
}

export default function Chart({ data, dataKey, xKey, label }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          name={label}
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}