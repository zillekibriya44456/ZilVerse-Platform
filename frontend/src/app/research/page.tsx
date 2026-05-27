"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const MOCK_PAPERS = [
  {
    id: "paper-1",
    title: "Decentralized Autonomous Escrow Systems in Global Gig Markets",
    authors: "Z. Kibriya, Dr. A. Neumann",
    abstract: "This paper introduces a novel cryptographic model for decentralized multi-signature escrow settlements, showing a 40% reduction in arbitration time compared to legacy centralized freelancer hubs.",
    pdfUrl: "https://arxiv.org/abs/2301.00001",
    category: "Decentralized Finance",
    upvotes: 142,
    createdAt: "2026-04-10"
  },
  {
    id: "paper-2",
    title: "Decentralized Latency Optimization for Distributed AI Model Inference",
    authors: "Sarah Jenkins, Leo Chen",
    abstract: "We evaluate the impact of glassmorphic edge server clusters in routing LLM prompts globally, proposing a novel routing protocol that reduces token time-to-first-byte down to 14ms.",
    pdfUrl: "https://arxiv.org/abs/2302.00002",
    category: "Artificial Intelligence",
    upvotes: 89,
    createdAt: "2026-05-02"
  },
  {
    id: "paper-3",
    title: "Proof of Skill: Mitigating Sybil Attacks in Decentralized Job Marketplaces",
    authors: "Marc Martinez, Emily White",
    abstract: "By leveraging zero-knowledge proofs (ZKPs), we present a mechanism for developers to prove skill proficiency without revealing identity or raw exam results, safeguarding platform reputation.",
    pdfUrl: "https://arxiv.org/abs/2303.00003",
    category: "Web3 Security",
    upvotes: 215,
    createdAt: "2026-05-18"
  }
];

export default function ResearchPage() {
  const { user } = useAuth();
  const [dbPapers, setDbPapers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Publish Paper modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPaper, setNewPaper] = useState({
    title: "",
    authors: "",
    abstract: "",
    pdfUrl: "",
    category: "Artificial Intelligence"
  });
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchPapers = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/research");
      setDbPapers(res.data);
    } catch (err) {
      console.error("Failed to load research papers", err);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleUpvote = async (id: string) => {
    // If it's a mock paper, we can simulate local upvote increment
    if (id.startsWith("paper-")) {
      setDbPapers(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
      // update state on Mock papers
      const index = MOCK_PAPERS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PAPERS[index].upvotes += 1;
      }
      setToastMessage("Upvote recorded!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      await axios.post(`http://localhost:5002/api/research/${id}/upvote`);
      fetchPapers();
      setToastMessage("Upvoted successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to register upvote.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await axios.post("http://localhost:5002/api/research/create", {
        ...newPaper,
        userId: user?.id
      });
      setIsModalOpen(false);
      setNewPaper({
        title: "",
        authors: "",
        abstract: "",
        pdfUrl: "",
        category: "Artificial Intelligence"
      });
      fetchPapers();
      setToastMessage("Whitepaper published to vault!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to publish whitepaper.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  // Format DB papers
  const formattedDbPapers = dbPapers.map(p => ({
    id: p.id,
    title: p.title,
    authors: p.authors || "Anonymous Creator",
    abstract: p.abstract || "",
    pdfUrl: p.pdfUrl || "#",
    category: p.category || "General Tech",
    upvotes: p.upvotes || 0,
    createdAt: new Date(p.createdAt).toLocaleDateString()
  }));

  const PAPERS = [...formattedDbPapers, ...MOCK_PAPERS];

  // Derive unique categories for the filters
  const uniqueCategories = Array.from(new Set(PAPERS.map(p => p.category)));

  const filtered = PAPERS.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  return (
    <main style={{ paddingTop: "120px", minHeight: "100vh", padding: "120px 2rem 4rem" }}>
      {toastMessage && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#ec4899", color: "#fff", padding: "1rem 1.5rem", borderRadius: "10px", zIndex: 9999999, fontWeight: 600, boxShadow: "0 10px 20px rgba(236,72,153,0.3)" }}>
          {toastMessage}
        </div>
      )}

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header section */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            background: "rgba(236, 72, 153, 0.1)",
            color: "#f472b6",
            borderRadius: "99px",
            fontWeight: "700",
            fontSize: "0.85rem",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            border: "1px solid rgba(236, 72, 153, 0.2)",
            marginBottom: "1.5rem"
          }}>
            🔬 Global Research Hub
          </div>
          
          <h1 style={{ fontSize: "3.5rem", fontWeight: "800", marginBottom: "1.5rem", color: "#fff", background: "linear-gradient(90deg, #fff, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Deep-Dive Whitepapers & Insights
          </h1>
          
          <p style={{ color: "#a1a1aa", lineHeight: "1.8", fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto 3rem" }}>
            Explore cutting-edge peer-reviewed research on Artificial Intelligence, Web3 infrastructures, and decentralized work networks.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", maxWidth: "600px", margin: "0 auto", marginBottom: "2rem" }}>
            <input
              type="text"
              placeholder="Search papers, authors, abstracts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "0.8rem 1.2rem",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                borderRadius: "8px",
                outline: "none"
              }}
            />
            <button className="btn btn-primary" style={{ background: "#ec4899", borderColor: "#db2777" }} onClick={() => setIsModalOpen(true)}>
              Publish Paper
            </button>
          </div>

          {/* Categories select row */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setCategoryFilter("All")}
              className={`btn ${categoryFilter === "All" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", background: categoryFilter === "All" ? "#ec4899" : "" }}
            >
              All Topics
            </button>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn ${categoryFilter === cat ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", background: categoryFilter === cat ? "#ec4899" : "" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
              <p style={{ color: "#a1a1aa" }}>No whitepapers match your criteria. Be the first to publish one!</p>
            </div>
          ) : (
            filtered.map(paper => (
              <div
                key={paper.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "2rem",
                  transition: "all 0.3s",
                  border: "1px solid rgba(236, 72, 153, 0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#ec4899", background: "rgba(236,72,153,0.1)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: "bold" }}>
                      {paper.category}
                    </span>
                    <h3 style={{ fontSize: "1.4rem", color: "#fff", marginTop: "0.5rem", fontWeight: "700" }}>{paper.title}</h3>
                    <p style={{ color: "#a1a1aa", fontSize: "0.9rem", margin: "0.25rem 0" }}>By {paper.authors}</p>
                  </div>
                  <button
                    onClick={() => handleUpvote(paper.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    <span>▲</span>
                    <span style={{ fontWeight: "bold" }}>{paper.upvotes}</span>
                  </button>
                </div>

                <p style={{ color: "#d4d4d8", lineHeight: "1.6", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                  {paper.abstract}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.2rem" }}>
                  <span style={{ color: "#71717a", fontSize: "0.85rem" }}>Published: {paper.createdAt}</span>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <span>📄</span> Read Document
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PUBLISH WHITE-PAPER MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Publish Technical Whitepaper</h2>
            <input 
              type="text" 
              placeholder="Paper Title" 
              value={newPaper.title}
              onChange={(e) => setNewPaper({...newPaper, title: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <input 
              type="text" 
              placeholder="Authors (e.g. Jane Doe, John Smith)" 
              value={newPaper.authors}
              onChange={(e) => setNewPaper({...newPaper, authors: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <select
                value={newPaper.category}
                onChange={(e) => setNewPaper({...newPaper, category: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              >
                <option>Artificial Intelligence</option>
                <option>Decentralized Finance</option>
                <option>Web3 Security</option>
                <option>Full Stack Systems</option>
                <option>Distributed Computing</option>
              </select>
              <input 
                type="text" 
                placeholder="PDF Link / DOI URL" 
                value={newPaper.pdfUrl}
                onChange={(e) => setNewPaper({...newPaper, pdfUrl: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
            </div>
            <textarea 
              placeholder="Paper Abstract / Summary of research findings" 
              value={newPaper.abstract}
              onChange={(e) => setNewPaper({...newPaper, abstract: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px", minHeight: "100px" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "0.8rem", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handlePublish} disabled={isPublishing} style={{ flex: 1, padding: "0.8rem", background: "#ec4899", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {isPublishing ? "Publishing..." : "Publish Whitepaper"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
