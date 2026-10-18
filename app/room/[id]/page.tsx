"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [score, setScore] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://governanceroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'risk') {
        setRisks(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://governanceroom.devdynamo713.com/room/${params.id}/risks`);
      if (res.ok) setRisks(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addRisk = async () => {
    const scoreNum = parseInt(score);
    const riskLevel = scoreNum >= 80 ? 'critical' : scoreNum >= 60 ? 'high' : scoreNum >= 30 ? 'medium' : 'low';
    const data = { id: Date.now().toString(), title, category, score: scoreNum, riskLevel, mitigated: false };
    await fetch(`https://governanceroom.devdynamo713.com/room/${params.id}/risk`, { method: 'POST', body: JSON.stringify(data) });
    setTitle(''); setCategory(''); setScore('');
  };
  const colorMap: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#fbbf24', low: '#60a5fa' };
  const overallScore = risks.filter(r => !r.mitigated).length > 0 ? Math.round(risks.filter(r => !r.mitigated).reduce((sum, r) => sum + r.score, 0) / risks.filter(r => !r.mitigated).length) : 0;
  const overallLevel = overallScore >= 80 ? 'critical' : overallScore >= 60 ? 'high' : overallScore >= 30 ? 'medium' : 'low';
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>GovernanceRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, padding: 16, border: `1px solid ${colorMap[overallLevel]}`, borderRadius: 12, background: '#09090b' }}>
        <strong style={{ fontSize: 20 }}>Overall Risk Score: {overallScore}</strong>
        <div style={{ marginTop: 4, fontWeight: 'bold', color: colorMap[overallLevel], fontSize: 16 }}>{overallLevel.toUpperCase()}</div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="risk title" className="title-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="category" className="category-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={score} onChange={(e) => setScore(e.target.value)} placeholder="score (0-100)" className="score-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <button className="add-btn" onClick={addRisk} disabled={!title.trim() || !category.trim() || !score} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Risk</button>
      </div>
      <div className="risk-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {risks.map(r => (
          <div key={r.id} style={{ padding: 16, border: `1px solid ${colorMap[r.riskLevel] || '#27272a'}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: colorMap[r.riskLevel] }}>{r.title}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Category: {r.category}</div>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Score: {r.score}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: colorMap[r.riskLevel] }}>{r.riskLevel.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}