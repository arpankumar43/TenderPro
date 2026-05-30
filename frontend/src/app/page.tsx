"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadTender, getTenders, TenderSummary } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTenders, setRecentTenders] = useState<TenderSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const data = await getTenders();
      setRecentTenders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setError(null);
    if (!file.type.includes("pdf") && !file.type.includes("text")) {
      setError("Please upload a PDF or text file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }
    setIsUploading(true);
    try {
      const result = await uploadTender(file);
      router.push(`/tender/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const filteredTenders = recentTenders.filter(t =>
    (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.issuingAuthority || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "Completed") return { bg: "#D6F5E3", color: "#1A7A42", dot: "#27AE60" };
    if (status === "Failed")    return { bg: "#FFE5E3", color: "#C0392B", dot: "#E74C3C" };
    return                             { bg: "#FFF3CC", color: "#B07D00", dot: "#F0A500" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* ─── Top Bar ───────────────────────────────────────── */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.25rem 2.5rem",
        background: "transparent",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "var(--bg-card-dark)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}>📋</div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>TenderPro</span>
        </div>

        {/* Search + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="search-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search tenders…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(5); }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Analyzing…" : "+ New Analysis"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 2rem 4rem" }}>

        {/* ─── Hero Section ──────────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{
            fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: "0.6rem",
          }}>
            Analyze RFPs,{" "}
            <span style={{
              background: "var(--bg-card-dark)",
              color: "var(--accent-yellow)",
              borderRadius: "12px",
              padding: "0 0.3em",
              display: "inline-block",
            }}>instantly.</span>
          </h1>
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            fontWeight: 400,
            maxWidth: 540,
          }}>
            Drop any government tender or RFP — AI extracts eligibility, deadlines,
            required documents, and builds your compliance checklist in seconds.
          </p>
        </div>

        {/* ─── Upload Zone ───────────────────────────────────── */}
        <div
          className={`upload-zone fade-up ${isDragging ? "dragging" : ""}`}
          style={{ animationDelay: "0.05s" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt"
            style={{ display: "none" }}
            disabled={isUploading}
          />

          {isUploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
              <div className="animate-spin" style={{
                width: 48, height: 48,
                border: "3px solid var(--border)",
                borderTopColor: "var(--bg-card-dark)",
                borderRadius: "50%",
              }} />
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.3rem" }}>Analyzing Document…</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  AI is extracting requirements and building your checklist.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "18px",
                background: "var(--bg-app)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem",
                marginBottom: "0.25rem",
              }}>📄</div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  Drop your RFP or tender document here
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Supports PDF &amp; TXT files up to 20 MB
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: "0.5rem" }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="fade-in" style={{
            marginTop: "1rem",
            padding: "0.9rem 1.25rem",
            background: "#FFE5E3",
            color: "#C0392B",
            borderRadius: "var(--radius-lg)",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ─── Recent Analysis ───────────────────────────────── */}
        {recentTenders.length > 0 && (
          <div className="fade-up" style={{ marginTop: "3rem", animationDelay: "0.12s" }}>

            {/* Section Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}>
              <div>
                <div className="section-label">Recent Analysis</div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Your Documents
                </h2>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>
                {filteredTenders.length} total
              </span>
            </div>

            {/* Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {filteredTenders.slice(0, visibleCount).map((t, idx) => {
                const sc = getStatusColor(t.status);
                return (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      cursor: "pointer",
                      padding: "1.4rem 1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                    onClick={() => router.push(`/tender/${t.id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Top row: icon + status + date */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "12px",
                        background: "var(--bg-app)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", flexShrink: 0,
                      }}>📑</div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          background: sc.bg, color: sc.color,
                          borderRadius: "var(--radius-pill)",
                          fontSize: "0.7rem", fontWeight: 700,
                          padding: "0.25rem 0.7rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {t.status}
                        </span>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                          {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "var(--text-primary)",
                        marginBottom: "0.3rem",
                      }}>
                        {t.title || "Untitled Tender"}
                      </h4>
                      {t.issuingAuthority && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span>🏢</span> {t.issuingAuthority}
                        </p>
                      )}
                    </div>

                    {/* Footer link */}
                    <div style={{
                      marginTop: "auto",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        View Analysis
                      </span>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "var(--bg-card-dark)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: "0.85rem",
                      }}>→</div>
                    </div>
                  </div>
                );
              })}

              {filteredTenders.length === 0 && (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-xl)",
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                }}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Load More */}
            {visibleCount < filteredTenders.length && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button
                  className="btn-outline"
                  onClick={() => setVisibleCount(prev => prev + 5)}
                >
                  Load More ↓
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
