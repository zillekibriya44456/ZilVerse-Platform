export default function PrivacyPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem' }}>
          <span style={{ color: '#71717a', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last updated: May 2026</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.5rem 0 1rem 0' }}>Privacy Policy</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.6' }}>
            At ZilVerse, we respect candidate and client privacy. This policy covers what information is parsed, stored, and verified during your platform interaction.
          </p>
        </div>

        <div style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Information We Collect</h3>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
              <li><strong>Profile Data:</strong> Name, Email address, social login details (Google, GitHub) when using OAuth.</li>
              <li><strong>Resume Metadata:</strong> Skills text, portfolio URLs, education, and credentials analyzed during mock rounds.</li>
              <li><strong>Audio & Video Streams:</strong> Camera feeds are rendered locally in your browser. Audio transcripts generated during live screenings are stored to calculate communication ratings.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. How We Use Information</h3>
            <p style={{ margin: 0 }}>
              All data is strictly utilized to provide mock screening reports, update profile ranks, coordinate wallet transaction balances, and notify users of platform messages. We do NOT sell or distribute your data to third-party advertisers.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Data Retention</h3>
            <p style={{ margin: 0 }}>
              Your profile records and past interview results remain stored securely in our SQLite database until you request deletion. You can delete your account by contacting support at any time.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
