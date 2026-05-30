"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTender, toggleChecklistItem, TenderDetail } from "@/lib/api";

const formatDeadlineDate = (dateTime: string | null, dateTimeRaw: string) => {
  if (!dateTime) return dateTimeRaw;
  const dateObj = new Date(dateTime);
  if (isNaN(dateObj.getTime())) return dateTimeRaw;
  return dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TenderDashboard() {
  const params = useParams();
  const router = useRouter();
  const [tender, setTender] = useState<TenderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) fetchTender(params.id as string);
  }, [params.id]);

  const fetchTender = async (id: string) => {
    try {
      setLoading(true);
      const data = await getTender(id);
      setTender(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tender");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
    try {
      setTender(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: prev.checklistItems.map(item =>
            item.id === itemId ? { ...item, isCompleted: !currentStatus } : item
          ),
        };
      });
      await toggleChecklistItem(itemId, !currentStatus);
    } catch (err) {
      console.error(err);
      fetchTender(params.id as string);
    }
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        minHeight: "100vh", gap: "1.25rem",
        background: "var(--bg-app)",
      }}>
        <div className="animate-spin" style={{
          width: 48, height: 48,
          border: "3px solid var(--border)",
          borderTopColor: "var(--bg-card-dark)",
          borderRadius: "50%",
        }} />
        <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Loading analysis…</p>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error || !tender) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        minHeight: "100vh", gap: "1rem",
        background: "var(--bg-app)",
      }}>
        <div style={{ fontSize: "2.5rem" }}>⚠️</div>
        <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{error || "Tender not found"}</div>
        <button className="btn-primary" onClick={() => router.push("/")}>← Back to Home</button>
      </div>
    );
  }

  const completedCount = tender.checklistItems.filter(i => i.isCompleted).length;
  const progressPercent = tender.checklistItems.length > 0
    ? Math.round((completedCount / tender.checklistItems.length) * 100)
    : 0;

  const statCards = [
    { icon: "✓", label: "Eligibility Criteria", value: tender.requirementCount, sub: "Mandatory Requirements", accent: "#5B8DEF", bg: "#EEF3FF" },
    { icon: "📅", label: "Key Deadlines", value: tender.deadlineCount, sub: "Critical Dates Found", accent: "#FF7369", bg: "#FFF0EF" },
    { icon: "📄", label: "Required Documents", value: tender.documentCount, sub: "Submission Attachments", accent: "#4CAF50", bg: "#EDFBF0" },
    { icon: "☑", label: "Compliance Items", value: tender.checklistCount, sub: "Generated Action Items", accent: "#FFD147", bg: "#FFFBEC" },
  ];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>

      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "10px",
            background: "var(--bg-card-dark)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
          }}>📋</div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>TenderPro</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "#D6F5E3", color: "#1A7A42",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.72rem", fontWeight: 700,
            padding: "0.3rem 0.9rem",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#27AE60", display: "inline-block" }} />
            AI Engine Active
          </span>
          <button className="btn-outline" style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }} onClick={() => router.push("/")}>
            ← Upload New
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "1.75rem 2rem", display: "grid", gridTemplateColumns: "290px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ── Left Sidebar ───────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "sticky", top: "5rem" }}>

          {/* Dark Document Card */}
          <div className="card-dark fade-up" style={{ animationDelay: "0s" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>
              Current Document
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.4, color: "white", marginBottom: "0.4rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {tender.originalFileName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.75rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-yellow)", display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Extracted Successfully</span>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="card fade-up" style={{ animationDelay: "0.05s", padding: "1.4rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Quick Metadata
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Notice No.", value: tender.tenderNumber || "N/A" },
                { label: "Issuer", value: tender.issuingAuthority || "N/A" },
                { label: "Tasks", value: `${tender.checklistCount} Items`, highlight: true },
                { label: "Precision", value: "High Confidence", highlight: true },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
                  <span style={{
                    fontSize: "0.85rem", fontWeight: 700,
                    color: item.highlight ? "var(--bg-card-dark)" : "var(--text-primary)",
                    maxWidth: 340, textAlign: "start",
                    whiteSpace: "wrap", overflow: "visible", textOverflow: "ellipsis",
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div className="card fade-up" style={{ animationDelay: "0.1s", padding: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Compliance Progress
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.04em" }}>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.6rem", fontWeight: 500 }}>
              {completedCount} of {tender.checklistItems.length} tasks completed
            </div>
          </div>
        </aside>

        {/* ── Main Content ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Page Title */}
          <div className="fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="section-label">AI Analysis</div>
            <h1 style={{
              fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {tender.title || "Untitled Tender"}
            </h1>
          </div>

          {/* Stat Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }} className="fade-up">
            {statCards.map((s, i) => (
              <div key={i} className="card" style={{ padding: "1.3rem 1.4rem", animationDelay: `${0.08 + i * 0.04}s` }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: "10px",
                  background: s.bg, fontSize: "1rem", marginBottom: "0.75rem",
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Two-Col Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>

            {/* ── Extracted Insights ──────────────────────────── */}
            <div className="card fade-up" style={{ display: "flex", flexDirection: "column", gap: "2rem", animationDelay: "0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Extracted Insights</h2>
                <span style={{
                  background: "var(--bg-app)", color: "var(--text-secondary)",
                  borderRadius: "var(--radius-pill)", fontSize: "0.72rem",
                  fontWeight: 700, padding: "0.3rem 0.85rem",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  Automated
                </span>
              </div>

              {/* Project Scope */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                  <div style={{ width: 4, height: 18, background: "var(--accent-blue)", borderRadius: 4 }} />
                  <span style={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Project Scope</span>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <div className="section-label" style={{ marginBottom: "0.3rem" }}>Name of Work</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.5 }}>{tender.title}</div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: "0.4rem" }}>Executive Summary</div>
                  <div style={{
                    background: "var(--bg-app)",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                  }}>
                    {tender.executiveSummary || "No summary available."}
                  </div>
                </div>
              </div>

              {/* Key Deadlines */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                  <div style={{ width: 4, height: 18, background: "var(--accent-coral)", borderRadius: 4 }} />
                  <span style={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Key Deadlines</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {tender.deadlines.map(d => (
                    <div key={d.id} style={{
                      display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start",
                      padding: "0.8rem 1rem",
                      background: "var(--bg-app)",
                      borderRadius: "var(--radius-lg)",
                    }}>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{d.title}</span>
                        {d.isHardDeadline && (
                          <span style={{
                            background: "#FFE5E3", color: "#C0392B",
                            borderRadius: "var(--radius-pill)",
                            fontSize: "0.65rem", fontWeight: 700,
                            padding: "0.22rem 0.65rem",
                            textTransform: "uppercase", letterSpacing: "0.04em",
                          }}>Hard</span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{formatDeadlineDate(d.dateTime, d.dateTimeRaw)}</span>
                    </div>
                  ))}
                  {tender.deadlines.length === 0 && (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "0.5rem 0" }}>No deadlines found.</div>
                  )}
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                  <div style={{ width: 4, height: 18, background: "var(--accent-yellow)", borderRadius: 4 }} />
                  <span style={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Eligibility Criteria</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {tender.requirements.map(req => (
                    <div key={req.id} style={{
                      padding: "1rem 1.1rem",
                      background: "var(--bg-app)",
                      borderRadius: "var(--radius-lg)",
                      borderLeft: "3px solid var(--accent-yellow)",
                    }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
                        {req.category || "General"}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.4rem" }}>{req.title}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{req.plainEnglish}</div>
                    </div>
                  ))}
                  {tender.requirements.length === 0 && (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No requirements found.</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Compliance Checklist ─────────────────────────── */}
            <div className="card fade-up" style={{
              display: "flex", flexDirection: "column",
              position: "sticky", top: "5rem",
              animationDelay: "0.18s",
              padding: "1.5rem",
              maxHeight: "calc(100vh - 7rem)",
            }}>
              {/* Checklist Header */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Compliance Checklist</h2>
                  <span style={{
                    background: progressPercent === 100 ? "#D6F5E3" : "var(--bg-app)",
                    color: progressPercent === 100 ? "#1A7A42" : "var(--text-secondary)",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "0.75rem", fontWeight: 700,
                    padding: "0.28rem 0.7rem",
                  }}>
                    {completedCount}/{tender.checklistItems.length}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${progressPercent === 100 ? "green" : progressPercent > 50 ? "yellow" : ""}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", paddingRight: "0.25rem" }}>
                {tender.checklistItems.map(item => {
                  const priorityAccent = item.priority === "High" ? "#FF7369" : item.priority === "Medium" ? "#FFD147" : "#5B8DEF";
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.9rem 1rem",
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        background: item.isCompleted ? "#F0FDF4" : "var(--bg-app)",
                        border: `1.5px solid ${item.isCompleted ? "#BBF7D0" : "transparent"}`,
                        transition: "all 0.2s ease",
                        alignItems: "flex-start",
                      }}
                      onMouseOver={(e) => { if (!item.isCompleted) e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = item.isCompleted ? "#F0FDF4" : "var(--bg-app)"; }}
                    >
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                          border: `2px solid ${item.isCompleted ? "#27AE60" : "var(--border)"}`,
                          background: item.isCompleted ? "#27AE60" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onClick={() => handleToggleChecklist(item.id, item.isCompleted)}
                      >
                        {item.isCompleted && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" checked={item.isCompleted} onChange={() => handleToggleChecklist(item.id, item.isCompleted)} style={{ display: "none" }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: "0.84rem", lineHeight: 1.4,
                          color: item.isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: item.isCompleted ? "line-through" : "none",
                          marginBottom: "0.35rem",
                        }}>
                          {item.title}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{
                            background: `${priorityAccent}22`,
                            color: priorityAccent,
                            borderRadius: "var(--radius-pill)",
                            fontSize: "0.65rem", fontWeight: 700,
                            padding: "0.18rem 0.55rem",
                            textTransform: "uppercase", letterSpacing: "0.04em",
                          }}>
                            {item.priority}
                          </span>
                          {item.category && (
                            <span style={{
                              background: "var(--bg-card)",
                              color: "var(--text-muted)",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "0.65rem", fontWeight: 600,
                              padding: "0.18rem 0.55rem",
                              letterSpacing: "0.02em",
                            }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {tender.checklistItems.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", fontSize: "0.9rem" }}>
                    No checklist items generated.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
