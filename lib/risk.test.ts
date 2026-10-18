import { describe, it, expect } from 'vitest';
import { riskScoreToLevel, overallRisk, formatRisk } from './risk';
describe('risk', () => {
  it('score 90 → critical', () => { expect(riskScoreToLevel(90)).toBe('critical'); });
  it('score 70 → high', () => { expect(riskScoreToLevel(70)).toBe('high'); });
  it('score 40 → medium', () => { expect(riskScoreToLevel(40)).toBe('medium'); });
  it('score 10 → low', () => { expect(riskScoreToLevel(10)).toBe('low'); });
  it('overallRisk empty', () => { expect(overallRisk([])).toBe(0); });
  it('overallRisk all mitigated', () => {
    const items = [{ id: '1', title: 't', category: 'c', riskLevel: 'high', score: 80, mitigated: true }];
    expect(overallRisk(items)).toBe(0);
  });
  it('overallRisk average of active', () => {
    const items = [
      { id: '1', title: 't1', category: 'c', riskLevel: 'high', score: 60, mitigated: false },
      { id: '2', title: 't2', category: 'c', riskLevel: 'medium', score: 40, mitigated: false }
    ];
    expect(overallRisk(items)).toBe(50);
  });
  it('formats correctly', () => {
    const r = { id: '1', title: 'Data breach', category: 'security', riskLevel: 'critical', score: 95, mitigated: false };
    expect(formatRisk(r)).toBe('Data breach [security] score:95 (critical) mitigated:false');
  });
});