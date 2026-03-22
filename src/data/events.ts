import type { GameEvent } from '../types/game';

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

// Event system extension point:
// - Add more events to this array.
// - Add trigger conditions and weighted random selection in a future event engine.
export const starterEvents: GameEvent[] = [
  {
    id: 'stikstof-001',
    title: 'Stikstof Deadlock in the Countryside',
    summary: 'Court pressure grows as permits freeze construction and farmers mobilize nationwide.',
    body: 'A fresh Raad van State ruling tightens nitrogen limits. Farmers demand relief, while urban voters demand rapid ecological compliance. Your cabinet needs a clear direction before permits for housing and infrastructure grind to a halt.',
    choices: [
      {
        label: 'Fast-track emission cuts with a farmer buyout fund',
        preview: ['+ Climate credibility', '+ Urban approval', '- Rural approval', '- Short-term debt'],
        apply: (metrics) => ({
          ...metrics,
          economy: {
            ...metrics.economy,
            nationalDebt: Number((metrics.economy.nationalDebt + 1.2).toFixed(1)),
            gdpGrowth: Number((metrics.economy.gdpGrowth - 0.3).toFixed(1)),
            housingAffordability: clamp(metrics.economy.housingAffordability + 3)
          },
          society: {
            ...metrics.society,
            overallApproval: clamp(metrics.society.overallApproval + 1),
            approvalByDemographic: {
              ...metrics.society.approvalByDemographic,
              'Randstad progressives': clamp(metrics.society.approvalByDemographic['Randstad progressives'] + 6),
              'Rural conservatives': clamp(metrics.society.approvalByDemographic['Rural conservatives'] - 8)
            }
          },
          politics: {
            ...metrics.politics,
            coalitionStability: clamp(metrics.politics.coalitionStability - 4),
            mediaSentiment: clamp(metrics.politics.mediaSentiment + 4)
          },
          environment: {
            ...metrics.environment,
            nitrogenEmissions: clamp(metrics.environment.nitrogenEmissions - 10),
            climatePolicyScore: clamp(metrics.environment.climatePolicyScore + 8),
            renewableEnergy: clamp(metrics.environment.renewableEnergy + 2)
          }
        })
      },
      {
        label: 'Delay enforcement and prioritize farmers\' operating space',
        preview: ['+ Rural support', '+ Coalition calm on the right', '- EU/legal pressure', '- Climate score'],
        apply: (metrics) => ({
          ...metrics,
          economy: {
            ...metrics.economy,
            gdpGrowth: Number((metrics.economy.gdpGrowth + 0.2).toFixed(1)),
            housingAffordability: clamp(metrics.economy.housingAffordability - 2)
          },
          society: {
            ...metrics.society,
            overallApproval: clamp(metrics.society.overallApproval - 1),
            approvalByDemographic: {
              ...metrics.society.approvalByDemographic,
              'Rural conservatives': clamp(metrics.society.approvalByDemographic['Rural conservatives'] + 7),
              'Young voters': clamp(metrics.society.approvalByDemographic['Young voters'] - 4)
            }
          },
          politics: {
            ...metrics.politics,
            coalitionStability: clamp(metrics.politics.coalitionStability + 3),
            mediaSentiment: clamp(metrics.politics.mediaSentiment - 5)
          },
          environment: {
            ...metrics.environment,
            nitrogenEmissions: clamp(metrics.environment.nitrogenEmissions + 6),
            climatePolicyScore: clamp(metrics.environment.climatePolicyScore - 9)
          }
        })
      },
      {
        label: 'Launch a regional transition pact (phased cuts + innovation grants)',
        preview: ['+ Balanced optics', '+ Coalition stability', '+ Long-term housing permits', '- Slower immediate impact'],
        apply: (metrics) => ({
          ...metrics,
          economy: {
            ...metrics.economy,
            nationalDebt: Number((metrics.economy.nationalDebt + 0.6).toFixed(1)),
            gdpGrowth: Number((metrics.economy.gdpGrowth + 0.1).toFixed(1)),
            housingAffordability: clamp(metrics.economy.housingAffordability + 4)
          },
          society: {
            ...metrics.society,
            overallApproval: clamp(metrics.society.overallApproval + 2),
            approvalByDemographic: {
              ...metrics.society.approvalByDemographic,
              'Randstad progressives': clamp(metrics.society.approvalByDemographic['Randstad progressives'] + 2),
              'Rural conservatives': clamp(metrics.society.approvalByDemographic['Rural conservatives'] + 2),
              Entrepreneurs: clamp(metrics.society.approvalByDemographic.Entrepreneurs + 3)
            }
          },
          politics: {
            ...metrics.politics,
            coalitionStability: clamp(metrics.politics.coalitionStability + 6),
            mediaSentiment: clamp(metrics.politics.mediaSentiment + 1)
          },
          environment: {
            ...metrics.environment,
            nitrogenEmissions: clamp(metrics.environment.nitrogenEmissions - 4),
            climatePolicyScore: clamp(metrics.environment.climatePolicyScore + 4),
            renewableEnergy: clamp(metrics.environment.renewableEnergy + 1)
          }
        })
      }
    ]
  }
];