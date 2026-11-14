// High-performance 2D Canvas Chart for real-time orbital telemetry
// Zero React SVG DOM lag; renders at 60 FPS with auto-scaling and hover tooltips.

import React, { useEffect, useRef, useState } from 'react';

export interface DataSeries {
  id: string;
  label: string;
  color: string;
  data: number[];
  unit?: string;
  dashed?: boolean;
}

interface CanvasChartProps {
  title: string;
  subtitle?: string;
  timeData: number[]; // seconds
  series: DataSeries[];
  height?: number;
  yFormat?: (val: number) => string;
  timeFormat?: (val: number) => string;
}

export const CanvasChart: React.FC<CanvasChartProps> = ({
  title,
  subtitle,
  timeData,
  series,
  height = 140,
  yFormat,
  timeFormat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Default formatters
  const formatY = yFormat || ((val: number) => {
    if (Math.abs(val) === 0) return '0';
    if (Math.abs(val) >= 1e9 || (Math.abs(val) < 1e-2 && Math.abs(val) > 0)) {
      return val.toExponential(2);
    }
    if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(1)}k`;
    return val.toFixed(1);
  });

  const formatTime = timeFormat || ((val: number) => {
    if (val < 60) return `${val.toFixed(1)}s`;
    if (val < 3600) return `${(val / 60).toFixed(1)}m`;
    if (val < 86400) return `${(val / 3600).toFixed(1)}h`;
    return `${(val / 86400).toFixed(1)}d`;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 18, right: 12, bottom: 22, left: 52 };
    const chartW = Math.max(10, width - padding.left - padding.right);
    const chartH = Math.max(10, height - padding.top - padding.bottom);

    const pointCount = timeData.length;
    if (pointCount < 2) {
      // Empty placeholder
      ctx.fillStyle = '#64748B';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting simulation telemetry data...', width / 2, height / 2);
      return;
    }

    // Determine Y range across all active series
    let minY = Infinity;
    let maxY = -Infinity;
    for (const s of series) {
      for (let i = 0; i < s.data.length; i++) {
        const v = s.data[i];
        if (Number.isFinite(v)) {
          if (v < minY) minY = v;
          if (v > maxY) maxY = v;
        }
      }
    }

    if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
      minY = 0;
      maxY = 1;
    }

    // Add 10% margin padding
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    } else {
      const span = maxY - minY;
      minY -= span * 0.08;
      maxY += span * 0.08;
    }

    const tMin = timeData[0];
    const tMax = timeData[pointCount - 1] || tMin + 1;
    const tSpan = Math.max(tMax - tMin, 1e-6);

    // Draw horizontal grid lines & labels
    const gridLines = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const frac = i / gridLines;
      const yVal = minY + (1 - frac) * (maxY - minY);
      const py = padding.top + frac * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, py);
      ctx.lineTo(padding.left + chartW, py);
      ctx.stroke();

      ctx.fillText(formatY(yVal), padding.left - 6, py + 3);
    }

    // Draw bottom time axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Time ticks
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(tMin), padding.left, height - 6);
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(tMax), padding.left + chartW, height - 6);

    // Helper coordinate mapper
    const mapX = (t: number) => padding.left + ((t - tMin) / tSpan) * chartW;
    const mapY = (v: number) => padding.top + (1 - (v - minY) / (maxY - minY)) * chartH;

    // Draw each series
    for (const s of series) {
      if (s.data.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.75;
      if (s.dashed) {
        ctx.setLineDash([4, 3]);
      } else {
        ctx.setLineDash([]);
      }

      for (let i = 0; i < s.data.length; i++) {
        const px = mapX(timeData[i]);
        const py = mapY(s.data[i]);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw hover cursor line
    if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < pointCount) {
      const hX = mapX(timeData[hoverIdx]);
      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, padding.top + chartH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw points for each series at hoverIdx
      for (const s of series) {
        if (s.data[hoverIdx] !== undefined) {
          const py = mapY(s.data[hoverIdx]);
          ctx.beginPath();
          ctx.arc(hX, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  }, [timeData, series, height, hoverIdx, formatY, formatTime]);

  // Mouse interaction for hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || timeData.length < 2) return;
    const rect = container.getBoundingClientRect();
    const paddingLeft = 52;
    const paddingRight = 12;
    const chartW = rect.width - paddingLeft - paddingRight;
    const relX = e.clientX - rect.left - paddingLeft;
    if (relX < 0 || relX > chartW) {
      setHoverIdx(null);
      return;
    }
    const frac = relX / chartW;
    const idx = Math.min(timeData.length - 1, Math.max(0, Math.round(frac * (timeData.length - 1))));
    setHoverIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  const latestIdx = hoverIdx !== null ? hoverIdx : (timeData.length ? timeData.length - 1 : null);

  return (
    <div
      ref={containerRef}
      className="w-full bg-space-900/80 rounded-lg p-2.5 border border-white/5 flex flex-col relative select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div>
          <span className="text-xs font-semibold text-slate-200">{title}</span>
          {subtitle && <span className="text-[10px] text-slate-400 ml-1.5">({subtitle})</span>}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {series.map((s) => {
            const val = latestIdx !== null && s.data[latestIdx] !== undefined ? s.data[latestIdx] : null;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-400">{s.label}:</span>
                <span className="text-slate-200 font-medium">
                  {val !== null ? formatY(val) : '—'} {s.unit || ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full block" />
    </div>
  );
};
