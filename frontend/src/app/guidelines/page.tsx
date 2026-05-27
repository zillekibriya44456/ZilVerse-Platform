import { ShieldAlert, UserCheck, MessageSquare, Handshake } from "lucide-react";

export default function CommunityGuidelinesPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.8rem' }}>Community Guidelines</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Our mission is to foster a professional, trusted, and high-performance ecosystem for global tech collaborations. All members must adhere to these standards.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Rule 1 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Handshake size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Professionalism & Billing Integrity</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Freelancers and clients must respect scopes, deliver agreed quality milestones, and process all service payments under secure escrow protection. Off-platform billing bypass attempts will lead to suspension.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Respectful Collaboration</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Harassment, hate speech, spamming workspace channels, or unauthorized credential sharing is strictly prohibited. Keep discussions professional and focused on project outcomes.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Fair Screening Practices</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                During live mock screening rooms, candidates must use their actual name, camera feed, and answer questions honestly. Using external screens, transcription assistance tools, or prompt generators violates fair-play logic.
              </p>
            </div>
          </div>

          {/* Violation warning */}
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', margin: '0 0 0.4rem 0' }}>Consequences of Guidelines Violations</h4>
              <p style={{ color: '#fca5a5', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                Violations of these standards are reviewed by platform admins. Actions can include warning logs, escrow freezing, temporary lockouts, or permanent IP/OAuth blacklist suspension depending on severity.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
