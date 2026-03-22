import { useMemo, useState } from 'react';
import type { GameState, ProvinceApproval, TrendPoint } from '../types/game';

interface DashboardProps {
  state: GameState;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const trendArrow = (values: number[]): string => {
  if (values.length < 2) return '→';
  const delta = values[values.length - 1] - values[values.length - 2];
  if (delta > 0.4) return '↑';
  if (delta < -0.4) return '↓';
  return '→';
};

function Sparkline({ values, className }: { values: number[]; className: string }) {
  const safe = values.length > 0 ? values : [50];

  return (
    <div className={`sparkline ${className}`}>
      {safe.slice(-12).map((point, idx) => (
        <span key={`${className}-${idx}`} style={{ height: `${clamp(point)}%` }} />
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  trendValues,
  status
}: {
  label: string;
  value: number;
  suffix?: string;
  trendValues: number[];
  status: 'good' | 'warn' | 'bad';
}) {
  return (
    <article className={`metric-card metric-${status}`}>
      <header>
        <h4>{label}</h4>
        <span>{trendArrow(trendValues)}</span>
      </header>
      <strong>
        {Number.isInteger(value) ? value : value.toFixed(1)}
        {suffix ?? ''}
      </strong>
      <Sparkline values={trendValues} className="metric-spark" />
    </article>
  );
}

function RingGauge({ score }: { score: number }) {
  const normalized = clamp(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="ring-gauge-wrap">
      <svg viewBox="0 0 140 140" className="ring-gauge" role="img" aria-label="National Health Score ring gauge">
        <circle cx="70" cy="70" r="52" className="ring-track" />
        <circle cx="70" cy="70" r="52" className="ring-progress" style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
      </svg>
      <div className="ring-center">
        <span>{normalized}</span>
        <small>National Health</small>
      </div>
    </div>
  );
}

const provinceTone = (approval: number): 'good' | 'warn' | 'bad' => {
  if (approval >= 60) return 'good';
  if (approval >= 42) return 'warn';
  return 'bad';
};

export function Dashboard({ state }: DashboardProps) {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceApproval | null>(state.provinces[0] ?? null);

  const latestTrend: TrendPoint[] = state.trend.slice(-12);

  const healthScore = useMemo(() => {
    const economy = clamp(50 + state.metrics.economy.gdpGrowth * 4 - state.metrics.economy.inflation * 2 - state.metrics.economy.unemployment * 1.2);
    const politics = clamp((state.metrics.politics.coalitionStability + state.metrics.politics.mediaSentiment + state.metrics.politics.politicalCapital) / 3);
    const society = clamp(state.metrics.society.overallApproval);
    const environment = clamp((100 - state.metrics.environment.nitrogenEmissions + state.metrics.environment.climatePolicyScore + state.metrics.environment.renewableEnergy) / 3);
    return Math.round((economy + politics + society + environment) / 4);
  }, [state.metrics]);

  const trendApproval = latestTrend.map((point) => point.approval);
  const trendPolling = latestTrend.map((point) => point.polling);
  const trendHealth = latestTrend.map((point) => point.health);

  return (
    <aside className="dashboard-modern">
      <section className="intel-card dashboard-headline">
        <header className="intel-card-header">
          <h2>National Operations Dashboard</h2>
          <p>
            {state.currentDate.year}-{String(state.currentDate.month).padStart(2, '0')} · {state.phase}
          </p>
        </header>

        <div className="headline-grid">
          <RingGauge score={healthScore} />

          <div className="headline-metrics">
            <MetricCard
              label="Overall Approval"
              value={state.metrics.society.overallApproval}
              suffix="%"
              trendValues={trendApproval}
              status={provinceTone(state.metrics.society.overallApproval)}
            />
            <MetricCard
              label="Party Polling"
              value={state.metrics.politics.partyPolling}
              suffix="%"
              trendValues={trendPolling}
              status={provinceTone(state.metrics.politics.partyPolling)}
            />
            <MetricCard
              label="Political Capital"
              value={state.metrics.politics.politicalCapital}
              trendValues={trendHealth}
              status={provinceTone(state.metrics.politics.politicalCapital)}
            />
            <MetricCard
              label="Coalition Stability"
              value={state.metrics.politics.coalitionStability}
              suffix="%"
              trendValues={trendHealth}
              status={provinceTone(state.metrics.politics.coalitionStability)}
            />
          </div>
        </div>
      </section>

      <section className="intel-card metric-matrix">
        <header className="intel-card-header">
          <h3>Metric Intelligence Cards</h3>
          <p>Current values with trend direction and monthly sparkline context.</p>
        </header>

        <div className="matrix-grid">
          <MetricCard
            label="GDP Growth"
            value={state.metrics.economy.gdpGrowth}
            suffix="%"
            trendValues={latestTrend.map((point) => point.health - 45)}
            status={state.metrics.economy.gdpGrowth >= 1 ? 'good' : state.metrics.economy.gdpGrowth >= 0 ? 'warn' : 'bad'}
          />
          <MetricCard
            label="Inflation"
            value={state.metrics.economy.inflation}
            suffix="%"
            trendValues={latestTrend.map((point) => 100 - point.health)}
            status={state.metrics.economy.inflation <= 3 ? 'good' : state.metrics.economy.inflation <= 5 ? 'warn' : 'bad'}
          />
          <MetricCard
            label="Debt"
            value={state.metrics.economy.nationalDebt}
            suffix="%GDP"
            trendValues={latestTrend.map((point) => Math.min(100, point.health + 10))}
            status={state.metrics.economy.nationalDebt <= 60 ? 'good' : state.metrics.economy.nationalDebt <= 90 ? 'warn' : 'bad'}
          />
          <MetricCard
            label="Climate Policy"
            value={state.metrics.environment.climatePolicyScore}
            suffix="%"
            trendValues={latestTrend.map((point) => point.health)}
            status={provinceTone(state.metrics.environment.climatePolicyScore)}
          />
          <MetricCard
            label="Renewables"
            value={state.metrics.environment.renewableEnergy}
            suffix="%"
            trendValues={latestTrend.map((point) => point.health - 5)}
            status={provinceTone(state.metrics.environment.renewableEnergy)}
          />
          <MetricCard
            label="Media Sentiment"
            value={state.metrics.politics.mediaSentiment}
            suffix="%"
            trendValues={latestTrend.map((point) => point.approval)}
            status={provinceTone(state.metrics.politics.mediaSentiment)}
          />
        </div>
      </section>

      <section className="intel-card province-map-card">
        <header className="intel-card-header">
          <h3>Provincial Approval Map</h3>
          <p>Click a province cell for local breakdown.</p>
        </header>

        <div className="province-grid-map">
          {state.provinces.map((province) => (
            <button
              key={province.name}
              type="button"
              className={`province-cell province-${provinceTone(province.approval)} ${selectedProvince?.name === province.name ? 'selected' : ''}`}
              onClick={() => setSelectedProvince(province)}
            >
              <span>{province.name}</span>
              <strong>{province.approval}%</strong>
            </button>
          ))}
        </div>

        {selectedProvince ? (
          <div className="province-detail">
            <h4>{selectedProvince.name}</h4>
            <p>
              Approval: {selectedProvince.approval}% · Volatility proxy:{' '}
              {Math.max(5, Math.min(35, Math.round((100 - selectedProvince.approval) * 0.4)))}
            </p>
          </div>
        ) : null}
      </section>
    </aside>
  );
}
