export default function TermsPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem' }}>
          <span style={{ color: '#71717a', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last updated: May 2026</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.5rem 0 1rem 0' }}>Terms of Service</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Please read these Terms of Service carefully before utilizing the mock screening portal, escrow wallets, or freelancer marketplaces hosted under ZilVerse.
          </p>
        </div>

        <div style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Agreement to Terms</h3>
            <p style={{ margin: 0 }}>
              By registering an account on our platform, you confirm that you accept these terms in full. If you do not agree with any statement, you must immediately terminate platform access and close your account.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Account Creation & Verification</h3>
            <p style={{ margin: 0 }}>
              Users must provide accurate, complete information (legal name, email, credentials) when registering. You are solely responsible for maintaining credentials security. Multiple accounts representing duplicate freelancer profiles are subject to deletion.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Wallet & Escrow Safety Protocols</h3>
            <p style={{ margin: 0 }}>
              ZilVerse provides an Escrow mechanism to protect freelance payments. The client deposits project fees upon milestone creation. The funds remain locked until the client explicitly releases them, or an admin resolves a dispute. Users agree that decision actions made by platform moderators during disputes are final.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Disclaimer of Warranties</h3>
            <p style={{ margin: 0 }}>
              The platform, including all live mock interview results, scoring feedback, and code execution console outputs, is provided "as is" without representation or warranties of any kind, express or implied.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
