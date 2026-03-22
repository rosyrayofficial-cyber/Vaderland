import type { GameMetrics, TrendHistory } from '../types/game';

interface DashboardProps {
  metrics: GameMetrics;
  year: number;
  month: number;
  trends: TrendHistory;
}

const tone = (value: number, inverse = false): string => {
  const normalized = inverse ? 100 - value : value;
  if (normalized >= 67) return 'good';
  if (normalized >= 40) return 'warn';
  return 'bad';
};

function MetricRow({ label, value, suffix = '', inverse = false }: { label: string; value: number; suffix?: string; inverse?: boolean }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="metric-row">
      <div className="metric-label-line">
        <span>{label}</span>
        <strong className={tone(value, inverse)}>
          {value}
          {suffix}
        </strong>
      </div>
      <div className="meter-track">
        <div className={`meter-fill ${tone(value, inverse)}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function Dashboard({ metrics, year, month, trends }: DashboardProps) {
  const demographicRows = Object.entries(metrics.society.approvalByDemographic) as Array<[string, number]>;

  const renderTrend = (values: number[], className: string) => (
    <div className="trend-row">
      {values.map((point, idx) => (
        <span key={`${className}-${idx}`} className={className} style={{ height: `${Math.max(6, point)}%` }} />
      ))}
    </div>
  );

  return (
    <aside className="dashboard">
      <header>
        <h2>Cabinet Dashboard</h2>
        <p>
          {year}-{String(month).padStart(2, '0')}
        </p>
      </header>

      <section>
        <h3>Economy</h3>
        <MetricRow label="GDP Growth" value={Math.round((metrics.economy.gdpGrowth + 5) * 10)} suffix="‰" />
        <MetricRow label="Unemployment" value={Math.round(metrics.economy.unemployment * 10)} suffix="‰" inverse />
        <MetricRow label="National Debt" value={Math.round(metrics.economy.nationalDebt)} suffix="%" inverse />
        <MetricRow label="Inflation" value={Math.round(metrics.economy.inflation * 20)} suffix="‰" inverse />
        <MetricRow label="Housing Affordability" value={metrics.economy.housingAffordability} />
      </section>

      <section>
        <h3>Society</h3>
        <MetricRow label="Overall Approval" value={metrics.society.overallApproval} suffix="%" />
        <MetricRow label="Immigration Sentiment" value={metrics.society.immigrationSentiment} suffix="%" />
        <MetricRow label="Healthcare Satisfaction" value={metrics.society.healthcareSatisfaction} suffix="%" />
        <MetricRow label="Education Score" value={metrics.society.educationScore} suffix="%" />
        {demographicRows.map(([group, score]) => (
          <div key={group}>
            <MetricRow label={group} value={score} suffix="%" />
          </div>
        ))}
      </section>

      <section>
        <h3>Politics</h3>
        <MetricRow label="Coalition Stability" value={metrics.politics.coalitionStability} suffix="%" />
        <MetricRow label="Party Polling" value={metrics.politics.partyPolling} suffix="%" />
        <MetricRow label="Seats in Tweede Kamer" value={Math.round((metrics.politics.seatsInParliament / 150) * 100)} suffix="%" />
        <MetricRow label="Days to Election" value={Math.round((metrics.politics.daysUntilElection / 1460) * 100)} suffix="%" inverse />
        <MetricRow label="Media Sentiment" value={metrics.politics.mediaSentiment} suffix="%" />
      </section>

      <section>
        <h3>Environment</h3>
        <MetricRow label="Nitrogen Emissions" value={metrics.environment.nitrogenEmissions} suffix="%" inverse />
        <MetricRow label="Climate Policy" value={metrics.environment.climatePolicyScore} suffix="%" />
        <MetricRow label="Renewable Energy" value={metrics.environment.renewableEnergy} suffix="%" />
      </section>

      <section>
        <h3>Trends</h3>
        <p className="trend-label">Party polling</p>
        {renderTrend(trends.polling, 'trend-poll')}
        <p className="trend-label">Public approval</p>
        {renderTrend(trends.approval, 'trend-approval')}
      </section>
    </aside>
  );
}