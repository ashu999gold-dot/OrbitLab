// ORBITLAB — Scientific Formatting & Number Presentation

export function formatScientific(val: number, precision: number = 3): string {
  if (!Number.isFinite(val)) return '—';
  if (val === 0) return '0.00';
  const abs = Math.abs(val);
  if (abs >= 1e4 || abs < 1e-2) {
    return val.toExponential(precision);
  }
  return val.toFixed(precision);
}

export function formatDistanceSI(meters: number): string {
  if (!Number.isFinite(meters)) return '—';
  if (meters >= 1.496e11) {
    return `${(meters / 1.495978707e11).toFixed(3)} AU`;
  }
  if (meters >= 1e6) {
    return `${(meters / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  }
  if (meters >= 1e3) {
    return `${(meters / 1e3).toFixed(2)} km`;
  }
  return `${meters.toFixed(1)} m`;
}

export function formatVelocitySI(mps: number): string {
  if (!Number.isFinite(mps)) return '—';
  if (Math.abs(mps) >= 1e3) {
    return `${(mps / 1e3).toFixed(3)} km/s`;
  }
  return `${mps.toFixed(1)} m/s`;
}

export function formatForceSI(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e24) return `${(n / 1e24).toFixed(3)} YN`;
  if (n >= 1e21) return `${(n / 1e21).toFixed(3)} ZN`;
  if (n >= 1e18) return `${(n / 1e18).toFixed(3)} EN`;
  if (n >= 1e15) return `${(n / 1e15).toFixed(3)} PN`;
  if (n >= 1e12) return `${(n / 1e12).toFixed(3)} TN`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(3)} GN`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(3)} MN`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)} kN`;
  return `${n.toFixed(1)} N`;
}

export function formatEnergySI(joules: number): string {
  if (!Number.isFinite(joules)) return '—';
  const sign = joules < 0 ? '-' : '';
  const abs = Math.abs(joules);
  if (abs >= 1e33) return `${sign}${(abs / 1e33).toFixed(3)}×10³³ J`;
  if (abs >= 1e30) return `${sign}${(abs / 1e30).toFixed(3)}×10³⁰ J`;
  if (abs >= 1e27) return `${sign}${(abs / 1e27).toFixed(3)}×10²⁷ J`;
  if (abs >= 1e24) return `${sign}${(abs / 1e24).toFixed(3)} YJ`;
  if (abs >= 1e21) return `${sign}${(abs / 1e21).toFixed(3)} ZJ`;
  if (abs >= 1e18) return `${sign}${(abs / 1e18).toFixed(3)} EJ`;
  if (abs >= 1e15) return `${sign}${(abs / 1e15).toFixed(3)} PJ`;
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)} TJ`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(3)} GJ`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} MJ`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)} kJ`;
  return `${sign}${abs.toFixed(1)} J`;
}

export function formatTimeSI(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  const days = seconds / 86400;
  if (days >= 365.25) return `${(days / 365.25).toFixed(2)} yrs (${days.toFixed(1)} d)`;
  if (days >= 1) return `${days.toFixed(2)} days (${(seconds / 3600).toFixed(1)} hrs)`;
  const hrs = seconds / 3600;
  if (hrs >= 1) return `${hrs.toFixed(2)} hrs`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)} mins`;
  return `${seconds.toFixed(1)} s`;
}
