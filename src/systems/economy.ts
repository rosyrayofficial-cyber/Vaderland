import type { EconomyState, GameState } from '../types/game';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Economy system: tax/spending/budget/debt/credit feedback model. */
export const calculateBudgetBalance = (economy: EconomyState): number => {
  const totalSpend =
    economy.spending.zorg +
    economy.spending.onderwijs +
    economy.spending.defensie +
    economy.spending.infrastructuur +
    economy.spending.socialeZekerheid;

  const taxBase =
    economy.taxes.incomeLow * 0.35 +
    economy.taxes.incomeMid * 0.55 +
    economy.taxes.incomeHigh * 0.6 +
    economy.taxes.corporate * 0.5 +
    economy.taxes.wealth * 0.2;

  return Number((taxBase - totalSpend).toFixed(1));
};

const updateCreditRating = (state: GameState): number => {
  const economy = state.metrics.economy;
  const stress =
    economy.nationalDebt * 0.45 +
    Math.max(0, -economy.budgetBalance) * 1.8 +
    Math.max(0, economy.inflation - 3) * 6;

  return clamp(Math.round(100 - stress), 15, 98);
};

export const runMonthlyEconomyTick = (state: GameState): GameState => {
  const current = state.metrics.economy;
  const budgetBalance = calculateBudgetBalance(current);
  const debtDrift = budgetBalance < 0 ? Math.abs(budgetBalance) * 0.16 : -Math.abs(budgetBalance) * 0.08;
  const growthFromInfra = (current.spending.infrastructuur - 14) * 0.03;
  const inflationFromDeficit = budgetBalance < 0 ? Math.abs(budgetBalance) * 0.05 : -0.05;

  const nextEconomy: EconomyState = {
    ...current,
    budgetBalance,
    nationalDebt: clamp(Number((current.nationalDebt + debtDrift).toFixed(1)), 0, 180),
    gdpGrowth: clamp(Number((current.gdpGrowth + growthFromInfra - inflationFromDeficit * 0.08).toFixed(2)), -8, 8),
    inflation: clamp(Number((current.inflation + inflationFromDeficit).toFixed(2)), -1, 15),
    unemployment: clamp(Number((current.unemployment - growthFromInfra * 0.3).toFixed(2)), 2, 20)
  };

  const provisionalState: GameState = {
    ...state,
    metrics: {
      ...state.metrics,
      economy: nextEconomy
    }
  };

  return {
    ...provisionalState,
    metrics: {
      ...provisionalState.metrics,
      economy: {
        ...provisionalState.metrics.economy,
        creditRating: updateCreditRating(provisionalState)
      }
    }
  };
};

export const runPrinsjesdag = (state: GameState): GameState => {
  const adjusted: EconomyState = {
    ...state.metrics.economy,
    spending: {
      ...state.metrics.economy.spending,
      zorg: clamp(state.metrics.economy.spending.zorg + 0.6, 8, 28),
      onderwijs: clamp(state.metrics.economy.spending.onderwijs + 0.4, 6, 20),
      infrastructuur: clamp(state.metrics.economy.spending.infrastructuur + 0.3, 5, 20)
    },
    taxes: {
      ...state.metrics.economy.taxes,
      incomeHigh: clamp(state.metrics.economy.taxes.incomeHigh + 0.2, 20, 65)
    }
  };

  return {
    ...state,
    metrics: {
      ...state.metrics,
      economy: {
        ...adjusted,
        budgetBalance: calculateBudgetBalance(adjusted)
      }
    },
    timeline: [
      {
        id: `timeline-prinsjesdag-${state.currentDate.monthIndex}`,
        monthIndex: state.currentDate.monthIndex,
        title: 'Prinsjesdag Budget Memorandum',
        detail: 'Government sets next-year spending and tax envelope.',
        impact: 'Budget balance and long-run debt trajectory adjusted.'
      },
      ...state.timeline
    ]
  };
};
