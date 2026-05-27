import Link from "next/link";

export default function CertificationsPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '80vh', padding: '120px 2rem 4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '0.5rem 1rem', 
          background: 'rgba(234,179,8,0.1)', 
          color: '#eab308', 
          borderRadius: '99px',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          🏆 Verified Credentials
        </div>
        
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#fff', fontWeight: '800', lineHeight: 1.2 }}>
          Global Industry Certifications
        </h1>
        
        <p style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
          Prove your expertise with blockchain-verified certificates recognized by top tech enterprises worldwide. Complete Academy tracks or Global Internships to earn yours.
        </p>

        {/* Sample Certificates Display */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '3rem',
          textAlign: 'left'
        }}>
          
          {/* Certificate 1: Academy Completion */}
          <div style={{ 
            background: 'linear-gradient(145deg, #18181b, #09090b)', 
            border: '1px solid rgba(79,70,229,0.3)', 
            borderRadius: '16px', 
            padding: '3rem 2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(79,70,229,0.2)', filter: 'blur(40px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#fff' }}>Zil<span style={{ color: '#4f46e5' }}>Verse</span></div>
              <div style={{ background: 'rgba(79,70,229,0.2)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>VERIFIED ✓</div>
            </div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontFamily: 'serif' }}>Certificate of Mastery</h3>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This certifies that the recipient has successfully completed</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '2rem' }}>
              Advanced Full-Stack AI Engineering
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase' }}>Issued By</div>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>ZilVerse Academy</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase' }}>Credential ID</div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }}>ZLV-8849-ACAD</div>
              </div>
            </div>
          </div>

          {/* Certificate 2: Internship */}
          <div style={{ 
            background: 'linear-gradient(145deg, #18181b, #09090b)', 
            border: '1px solid rgba(14,165,233,0.3)', 
            borderRadius: '16px', 
            padding: '3rem 2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(14,165,233,0.2)', filter: 'blur(40px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#fff' }}>Zil<span style={{ color: '#0ea5e9' }}>Verse</span></div>
              <div style={{ background: 'rgba(14,165,233,0.2)', color: '#bae6fd', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>VERIFIED ✓</div>
            </div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontFamily: 'serif' }}>Certificate of Internship</h3>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This certifies the successful global placement and completion of</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '2rem' }}>
              Global Startup Engineering Internship
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase' }}>Issued By</div>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>ZilVerse Global Partners</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase' }}>Credential ID</div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }}>ZLV-3211-INTN</div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '5rem' }}>
          <Link href="/academy" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            Start Earning Certificates
          </Link>
        </div>
      </div>
    </main>
  );
}
