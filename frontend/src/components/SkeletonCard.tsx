/**
 * SkeletonCard — reusable loading placeholder using the global CSS skeleton system.
 * Usage:
 *   <SkeletonCard variant="freelancer" />
 *   <SkeletonCard variant="project" />
 *   <SkeletonCard variant="job" count={3} />
 *   <SkeletonCard variant="stat" count={4} />
 */
export type SkeletonVariant = "freelancer" | "project" | "job" | "stat" | "discussion" | "event";

interface SkeletonCardProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  grid: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  row: { display: "flex", alignItems: "center", gap: "0.75rem" },
  flex1: { flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" },
};

function FreelancerSkeleton() {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} />
        <div style={styles.flex1}>
          <div className="skeleton skeleton-text w-3/4" />
          <div className="skeleton skeleton-text w-1/2" />
        </div>
        <div className="skeleton" style={{ width: 56, height: 28, borderRadius: 8 }} />
      </div>
      <div className="skeleton skeleton-text w-full" />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ width: 60, height: 22, borderRadius: 99 }} />
        ))}
      </div>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div style={styles.card}>
      <div className="skeleton skeleton-img" style={{ height: 160 }} />
      <div className="skeleton skeleton-text w-3/4" />
      <div className="skeleton skeleton-text w-1/2" />
      <div style={{ ...styles.row, justifyContent: "space-between" }}>
        <div style={styles.row}>
          <div className="skeleton skeleton-avatar" style={{ width: 28, height: 28 }} />
          <div className="skeleton skeleton-text w-1/3" style={{ marginBottom: 0 }} />
        </div>
        <div className="skeleton" style={{ width: 64, height: 28, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function JobSkeleton() {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div style={styles.flex1}>
          <div className="skeleton skeleton-text w-3/4" />
          <div className="skeleton skeleton-text w-1/2" />
        </div>
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 99 }} />
      </div>
      <div className="skeleton skeleton-text w-full" />
      <div className="skeleton skeleton-text w-3/4" />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ width: 70, height: 22, borderRadius: 99 }} />
        ))}
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div style={styles.card}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
      <div className="skeleton skeleton-text w-1/2" />
      <div className="skeleton" style={{ height: "2rem", width: "70%", borderRadius: 8 }} />
      <div className="skeleton skeleton-text w-3/4" />
    </div>
  );
}

function DiscussionSkeleton() {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }} />
        <div style={styles.flex1}>
          <div className="skeleton skeleton-text w-3/4" />
          <div className="skeleton skeleton-text w-1/3" />
        </div>
      </div>
      <div className="skeleton skeleton-text w-full" />
      <div className="skeleton skeleton-text w-1/2" />
    </div>
  );
}

function EventSkeleton() {
  return (
    <div style={styles.card}>
      <div className="skeleton skeleton-img" style={{ height: 130 }} />
      <div className="skeleton skeleton-text w-1/3" />
      <div className="skeleton skeleton-text w-3/4" />
      <div className="skeleton skeleton-text w-1/2" />
      <div style={{ ...styles.row, justifyContent: "space-between" }}>
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 99 }} />
        <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
      </div>
    </div>
  );
}

const VARIANT_MAP: Record<SkeletonVariant, React.FC> = {
  freelancer: FreelancerSkeleton,
  project: ProjectSkeleton,
  job: JobSkeleton,
  stat: StatSkeleton,
  discussion: DiscussionSkeleton,
  event: EventSkeleton,
};

export default function SkeletonCard({ variant = "project", count = 1, className }: SkeletonCardProps) {
  const Card = VARIANT_MAP[variant];
  return (
    <div style={styles.grid} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}
