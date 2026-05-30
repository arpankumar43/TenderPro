const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TenderSummary {
  id: string;
  title: string;
  tenderNumber: string;
  issuingAuthority: string;
  tenderType: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  originalFileName: string;
  overallComplexity: "Low" | "Medium" | "High";
  createdAt: string;
  processedAt: string | null;
  requirementCount: number;
  deadlineCount: number;
  documentCount: number;
  checklistCount: number;
}

export interface Requirement {
  id: string;
  type: string;
  title: string;
  description: string;
  plainEnglish: string;
  isMandatory: boolean;
  sourcePage: number | null;
  category: string;
}

export interface Deadline {
  id: string;
  title: string;
  dateTime: string | null;
  dateTimeRaw: string;
  description: string;
  isHardDeadline: boolean;
  daysRemaining: number | null;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  acceptedFormats: string;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  isCompleted: boolean;
  priority: "High" | "Medium" | "Low";
  linkedRequirementId: string | null;
  linkedDeadlineId: string | null;
}

export interface TenderDetail extends TenderSummary {
  executiveSummary: string;
  eligibilitySummary: string;
  errorMessage: string | null;
  requirements: Requirement[];
  deadlines: Deadline[];
  requiredDocuments: RequiredDocument[];
  checklistItems: ChecklistItem[];
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function uploadTender(file: File): Promise<TenderDetail> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/tenders/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getTenders(): Promise<TenderSummary[]> {
  const res = await fetch(`${API_BASE}/tenders`);
  if (!res.ok) throw new Error("Failed to fetch tenders");
  return res.json();
}

export async function getTender(id: string): Promise<TenderDetail> {
  const res = await fetch(`${API_BASE}/tenders/${id}`);
  if (!res.ok) throw new Error(`Tender not found: ${id}`);
  return res.json();
}

export async function deleteTender(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tenders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete tender");
}

export async function toggleChecklistItem(
  id: string,
  isCompleted: boolean
): Promise<ChecklistItem> {
  const res = await fetch(`${API_BASE}/checklist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isCompleted }),
  });
  if (!res.ok) throw new Error("Failed to update checklist item");
  return res.json();
}
