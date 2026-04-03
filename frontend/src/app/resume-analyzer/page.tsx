"use client";
import { useState, useRef } from "react";

const THEME = {
  violet: "#7400b8",
  indigo: "#6930c3",
  slate: "#5e60ce",
  blue: "#5390d9",
  cyan: "#48bfe3",
  turquoise: "#72efdd",
  aquamarine: "#80ffdb",
};

interface ATSBreakdown {
  formatting: number;
  keywords: number;
  experience: number;
  skills: number;
}

interface AISuggestion {
  priority: "High" | "Medium" | "Low";
  category: string;
  suggestion: string;
  example: string | null;
}

interface RewriteSuggestion {
  original: string;
  improved: string;
}

interface SectionFeedback {
  summary_objective: string | null;
  experience: string;
  skills: string;
  education: string;
  overall_structure: string;
}

interface AIAnalysis {
  ats_score: number;
  jd_match_score: number | null;
  overall_rating: string;
  summary: string;
  ats_breakdown: ATSBreakdown;
  matched_keywords: string[];
  missing_keywords: string[];
  skill_gap: string[];
  strengths: string[];
  weaknesses: string[];
  section_feedback: SectionFeedback;
  ai_suggestions: AISuggestion[];
  rewrite_suggestions: RewriteSuggestion[];
  interview_likelihood: string;
  recommendation: string;
}

interface AnalysisResult {
  ai_analysis: AIAnalysis;
  basic_info: {
    skills: string[];
    email: string | null;
    phone: string | null;
    experience_years: number;
    word_count: number;
    has_jd: boolean;
  };
}

function ScoreRing({ score, label, color, size = 120 }: { score: number; label: string; color: string; size?: number }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease", filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-400 text-center">{label}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    High: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
    Medium: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308" },
    Low: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e" },
  };
  const c = colors[priority as keyof typeof colors] || colors.Low;
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {priority}
    </span>
  );
}

function LikelihoodBadge({ value }: { value: string }) {
  const colors = {
    High: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", icon: "🟢" },
    Medium: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", icon: "🟡" },
    Low: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", icon: "🔴" },
  };
  const c = colors[value as keyof typeof colors] || colors.Medium;
  return (
    <span className="px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {c.icon} {value} Likelihood
    </span>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    Excellent: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e" },
    Good: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#3b82f6" },
    Average: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308" },
    "Needs Work": { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
  };
  const c = colors[rating] || colors["Average"];
  return (
    <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {rating}
    </span>
  );
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jd.trim()) formData.append("job_description", jd.trim());

      const res = await fetch(`${process.env.NEXT_PUBLIC_ML_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setActiveTab("overview");
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to connect to ML service. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "jd_match", label: "JD Match", show: result?.basic_info.has_jd },
    { id: "suggestions", label: "AI Suggestions" },
    { id: "rewrite", label: "Rewrites" },
    { id: "feedback", label: "Section Feedback" },
    { id: "skills", label: "Skills" },
  ].filter(t => t.show !== false);

  const analysis = result?.ai_analysis;
  const basicInfo = result?.basic_info;

  return (
    <main className="min-h-screen bg-[#06020f] text-white px-4 md:px-6 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-6"
            style={{ background: "rgba(116,0,184,0.1)", border: "1px solid rgba(116,0,184,0.3)", color: THEME.turquoise }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: THEME.turquoise }} />
            Powered by AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${THEME.slate}, ${THEME.turquoise})` }}>
              AI Resume Analyzer
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Upload your resume and optionally paste a job description for a detailed AI-powered analysis with real ATS scoring, skill gap analysis and personalized suggestions.
          </p>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* File Upload */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files[0];
                if (dropped?.type === "application/pdf") setFile(dropped);
                else setError("Only PDF files are supported");
              }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer"
              style={{
                border: `2px dashed ${dragging ? THEME.turquoise : "rgba(255,255,255,0.1)"}`,
                background: dragging ? "rgba(114,239,221,0.05)" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="text-5xl mb-4">📄</div>
              <p className="text-white font-semibold text-lg mb-1">
                {file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-gray-600 text-sm">
                {file ? `${(file.size / 1024).toFixed(1)} KB · PDF` : "PDF only · Click or drag to upload"}
              </p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
            </div>

            {/* JD Input */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-white">Job Description</span>
                <span className="px-2 py-0.5 rounded-md text-xs" style={{ background: "rgba(114,239,221,0.1)", color: THEME.turquoise, border: `1px solid rgba(114,239,221,0.2)` }}>Optional but recommended</span>
              </div>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here to get JD-specific ATS score, keyword matching and tailored suggestions..."
                className="w-full bg-transparent text-gray-300 text-sm placeholder-gray-700 resize-none focus:outline-none leading-relaxed"
                rows={6}
              />
              {jd && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">{jd.split(" ").length} words · JD analysis enabled</span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${THEME.violet}, ${THEME.slate}, ${THEME.cyan})` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 40px rgba(116,0,184,0.4)`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI is analyzing your resume...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✨ Analyze with AI
                </span>
              )}
            </button>

            {loading && (
              <div className="text-center">
                <p className="text-gray-600 text-sm animate-pulse">This takes 10-15 seconds. AI is reviewing your resume carefully...</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && analysis && basicInfo && (
          <div className="space-y-6">

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 flex-wrap">
                <RatingBadge rating={analysis.overall_rating} />
                <LikelihoodBadge value={analysis.interview_likelihood} />
                {basicInfo.has_jd && (
                  <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(114,239,221,0.1)", border: "1px solid rgba(114,239,221,0.2)", color: THEME.turquoise }}>
                    JD Analysis Enabled
                  </span>
                )}
              </div>
              <button
                onClick={() => { setResult(null); setFile(null); setJd(""); setError(""); }}
                className="text-sm text-gray-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Analyze Another
              </button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1 flex justify-center p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ScoreRing score={analysis.ats_score} label="ATS Score" color={THEME.violet} />
              </div>
              {analysis.jd_match_score !== null && (
                <div className="col-span-2 md:col-span-1 flex justify-center p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ScoreRing score={analysis.jd_match_score} label="JD Match Score" color={THEME.turquoise} />
                </div>
              )}
              {/* ATS Breakdown */}
              <div className={`${analysis.jd_match_score !== null ? "col-span-2" : "col-span-2"} p-6 rounded-2xl`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-4">ATS Breakdown</p>
                <div className="space-y-3">
                  {Object.entries(analysis.ats_breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400 capitalize">{key}</span>
                        <span className="text-xs font-mono" style={{ color: THEME.turquoise }}>{val}/25</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(val / 25) * 100}%`, background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.turquoise})` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-6 rounded-2xl" style={{ background: `linear-gradient(135deg, rgba(116,0,184,0.08), rgba(94,96,206,0.05))`, border: `1px solid rgba(116,0,184,0.2)` }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: THEME.slate }}>✨ AI Summary</p>
              <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: activeTab === tab.id ? `rgba(116,0,184,0.2)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeTab === tab.id ? "rgba(116,0,184,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: activeTab === tab.id ? "#ffffff" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-4 text-green-500">💪 Strengths</p>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="text-green-400 shrink-0 mt-0.5">▹</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-4 text-red-400">⚠️ Areas to Improve</p>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="text-red-400 shrink-0 mt-0.5">▹</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="md:col-span-2 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-3 text-gray-600">🎯 AI Recommendation</p>
                    <p className="text-gray-300 leading-relaxed text-sm">{analysis.recommendation}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="md:col-span-2 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-4 text-gray-600">📋 Extracted Info</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Email</p>
                        <p className="text-gray-300">{basicInfo.email || "Not found"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Phone</p>
                        <p className="text-gray-300">{basicInfo.phone || "Not found"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Word Count</p>
                        <p className="text-gray-300">{basicInfo.word_count} words</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Skills Found</p>
                        <p className="text-gray-300">{basicInfo.skills.length} skills</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* JD MATCH TAB */}
              {activeTab === "jd_match" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched Keywords */}
                    <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
                      <p className="text-xs font-mono uppercase tracking-widest mb-4 text-green-500">✅ Matched Keywords ({analysis.matched_keywords.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.matched_keywords.length > 0 ? analysis.matched_keywords.map((kw) => (
                          <span key={kw} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                            {kw}
                          </span>
                        )) : <p className="text-gray-600 text-sm">No matched keywords found</p>}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="p-6 rounded-2xl" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
                      <p className="text-xs font-mono uppercase tracking-widest mb-4 text-red-400">❌ Missing Keywords ({analysis.missing_keywords.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missing_keywords.length > 0 ? analysis.missing_keywords.map((kw) => (
                          <span key={kw} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                            {kw}
                          </span>
                        )) : <p className="text-gray-600 text-sm">No missing keywords</p>}
                      </div>
                    </div>
                  </div>

                  {/* Skill Gap */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.1)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-4 text-yellow-500">🔧 Skill Gap</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skill_gap.length > 0 ? analysis.skill_gap.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#eab308" }}>
                          {skill}
                        </span>
                      )) : <p className="text-gray-600 text-sm">No skill gaps identified</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* AI SUGGESTIONS TAB */}
              {activeTab === "suggestions" && (
                <div className="space-y-3">
                  {analysis.ai_suggestions.map((s, i) => (
                    <div key={i} className="p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <PriorityBadge priority={s.priority} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(94,96,206,0.1)", color: THEME.slate, border: `1px solid rgba(94,96,206,0.2)` }}>
                              {s.category}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-2">{s.suggestion}</p>
                          {s.example && (
                            <div className="p-3 rounded-lg mt-2" style={{ background: "rgba(114,239,221,0.05)", border: "1px solid rgba(114,239,221,0.1)" }}>
                              <p className="text-xs font-mono text-gray-600 mb-1">Example:</p>
                              <p className="text-xs text-gray-400 leading-relaxed">{s.example}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* REWRITE TAB */}
              {activeTab === "rewrite" && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">AI has rewritten these bullet points to be more impactful with metrics and stronger language.</p>
                  {analysis.rewrite_suggestions.map((r, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="p-4" style={{ background: "rgba(239,68,68,0.05)", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
                        <p className="text-xs font-mono text-red-400 mb-2">BEFORE</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{r.original}</p>
                      </div>
                      <div className="p-4" style={{ background: "rgba(34,197,94,0.05)" }}>
                        <p className="text-xs font-mono text-green-400 mb-2">AFTER (AI Improved)</p>
                        <p className="text-gray-200 text-sm leading-relaxed">{r.improved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION FEEDBACK TAB */}
              {activeTab === "feedback" && (
                <div className="space-y-3">
                  {Object.entries(analysis.section_feedback).map(([section, feedback]) => {
                    if (!feedback) return null;
                    return (
                      <div key={section} className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: THEME.slate }}>
                          {section.replace(/_/g, " ")}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">{feedback}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-mono uppercase tracking-widest mb-4 text-gray-600">🛠️ Detected Skills ({basicInfo.skills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {basicInfo.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-105"
                          style={{ background: `rgba(116,0,184,0.1)`, border: `1px solid rgba(116,0,184,0.2)`, color: THEME.slate }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.skill_gap.length > 0 && (
                    <div className="p-6 rounded-2xl" style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.1)" }}>
                      <p className="text-xs font-mono uppercase tracking-widest mb-4 text-yellow-500">🔧 Skills to Add</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skill_gap.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-mono"
                            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#eab308" }}>
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
