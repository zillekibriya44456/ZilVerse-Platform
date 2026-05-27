export default function CookiesPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem' }}>
          <span style={{ color: '#71717a', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last updated: May 2026</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.5rem 0 1rem 0' }}>Cookie Policy</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Our platform uses cookies and browser local storage to maintain session states and store preferences.
          </p>
        </div>

        <div style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. What Are Cookies?</h3>
            <p style={{ margin: 0 }}>
              Cookies are small data packets placed on your computer or device by your web browser. Local Storage is a similar mechanism allowing the browser to cache session data across restarts.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. How We Use Them</h3>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
              <li><strong>Essential Auth Cookies:</strong> To confirm session logins and persist authentication across navigation transitions.</li>
              <li><strong>Preference Cache:</strong> Stores UI preferences (such as dark mode states, selected target roles, or recruiter selections).</li>
            </ul>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. How to Manage Cookies</h3>
            <p style={{ margin: 0 }}>
              You can disable or delete cookies using your browser settings. Note that disabling essential cookies will prevent successful login sessions or payment operations.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
