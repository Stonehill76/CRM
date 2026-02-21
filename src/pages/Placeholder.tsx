import { Construction } from 'lucide-react';
import { Topbar } from '../components/Topbar';

export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar title={title} subtitle={subtitle} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Construction size={40} color="#334155" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#334155' }}>Coming in a future version</div>
        </div>
      </div>
    </div>
  );
}
