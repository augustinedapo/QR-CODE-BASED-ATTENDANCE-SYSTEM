'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  DotProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StudentCourseAttendanceSummary } from '@/types/index';
import styles from './AttendanceChart.module.css';

interface AttendanceChartProps {
  summaries: StudentCourseAttendanceSummary[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ summaries }) => {
  const data = summaries.map((summary) => ({
    course: summary.course.course_code,
    attendance: summary.percentage,
    attended: summary.attended,
    missed: summary.missed,
    total: summary.total_lectures,
    color: getStatusColor(summary.percentage),
  }));

  const averageAttendance = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.attendance, 0) / data.length)
    : 0;

  return (
    <section className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div>
          <h2>Attendance Trends</h2>
          <p>Course-by-course attendance performance</p>
        </div>
        <div className={styles.chartBadge}>
          <span>Average</span>
          <strong>{averageAttendance}%</strong>
        </div>
      </div>
      {data.length > 0 ? (
        <div className={styles.chartFrame}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 16, right: 18, left: -14, bottom: 2 }}>
              <defs>
                <linearGradient id="attendanceTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 8" className={styles.grid} />
              <XAxis
                dataKey="course"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={12}
                className={styles.axis}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}%`}
                className={styles.axis}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(127, 168, 216, 0.32)', strokeWidth: 2 }}
                content={<AttendanceTooltip />}
              />
              <Area
                type="monotone"
                dataKey="attendance"
                stroke="var(--color-primary)"
                strokeWidth={4}
                fill="url(#attendanceTrendFill)"
                activeDot={<TrendDot active />}
                dot={<TrendDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles.emptyState}>
          Attendance trends will appear after you enroll in courses and scan QR sessions.
        </div>
      )}
    </section>
  );
};

function getStatusColor(percentage: number) {
  if (percentage >= 90) return '#16A36A';
  if (percentage >= 75) return '#20C7D9';
  if (percentage >= 60) return '#F2C94C';
  return '#F05264';
}

type TrendDotProps = DotProps & {
  active?: boolean;
  payload?: {
    color?: string;
  };
};

function TrendDot(props: TrendDotProps) {
  const { cx, cy, payload, active } = props;
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;

  const color = payload?.color || 'var(--color-primary)';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={active ? 7 : 5}
      fill={color}
      stroke="var(--color-surface)"
      strokeWidth={3}
    />
  );
}

type AttendanceTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    payload: {
      attendance: number;
      attended: number;
      total: number;
      missed: number;
      color: string;
    };
  }>;
};

function AttendanceTooltip({ active, payload, label }: AttendanceTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipDot} style={{ background: item.color }} />
        <strong>{label}</strong>
      </div>
      <div className={styles.tooltipValue}>{item.attendance}% attendance</div>
      <div className={styles.tooltipMeta}>
        <span>{item.attended}/{item.total} attended</span>
        <span>{item.missed} missed</span>
      </div>
    </div>
  );
}

export default AttendanceChart;
