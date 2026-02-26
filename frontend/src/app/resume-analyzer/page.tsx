"use client";
import { useState } from "react";

interface JobMatch {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
}

interface AnalysisResult {
  skills: string[];
  skill_score: number;
  ats_score: number;
  job_matches: Record<string, JobMatch>;
  suggestions: string[];
  contact: { email: string | null; phone: string | null };
  experience_years: number;
  word_count: number;
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to connect to ML service");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <main className="min-h-screen bg-[#020818] text-white px-6 py-28">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Powered by ML
          </div>
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Resume Analyzer
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your resume and get instant AI-powered insights including ATS score,
            skill analysis and job match predictions.
          </p>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="max-w-2xl mx-auto mb-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files[0];
                if (dropped && dropped.type === "application/pdf") {
                  setFile(dropped);
                } else {
                  setError("Only PDF files are supported");
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragging
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-white/20 hover:border-purple-500/50 bg-white/5"
              }`}
              onClick={() => document.getElementById("resume-input")?.click()}
            >
              <div className="text-5xl mb-4">📄</div>
              <p className="text-white font-semibold text-lg mb-2">
                {file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-gray-500 text-sm">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF files only · Click or drag to upload"}
              </p>
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) setFile(selected);
                }}
              />
            </div>

            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Resume...
                </span>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">

            {/* Analyze Another Button */}
            <div className="text-center">
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-semibold"
              >
                Analyze Another Resume
              </button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">ATS Score</p>
                <p className={`text-6xl font-black mb-2 ${getScoreColor(result.ats_score)}`}>
                  {result.ats_score}
                </p>
                <p className="text-gray-500 text-sm">out of 100</p>
                <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBg(result.ats_score)} transition-all duration-1000`}
                    style={{ width: `${result.ats_score}%` }}
                  />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">Skill Score</p>
                <p className={`text-6xl font-black mb-2 ${getScoreColor(result.skill_score)}`}>
                  {result.skill_score}
                </p>
                <p className="text-gray-500 text-sm">out of 100</p>
                <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBg(result.skill_score)} transition-all duration-1000`}
                    style={{ width: `${result.skill_score}%` }}
                  />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">Skills Detected</p>
                <p className="text-6xl font-black mb-2 text-blue-400">
                  {result.skills.length}
                </p>
                <p className="text-gray-500 text-sm">technical skills</p>
                <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${Math.min(result.skills.length * 3, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Job Matches */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Job Match Predictions</h2>
              <div className="space-y-5">
                {Object.entries(result.job_matches)
                  .sort((a, b) => b[1].score - a[1].score)
                  .map(([role, match]) => (
                    <div key={role}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">{role}</span>
                        <span className={`font-bold text-lg ${getScoreColor(match.score)}`}>
                          {match.score}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full ${getScoreBg(match.score)} transition-all duration-1000`}
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {match.matched_skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            {skill}
                          </span>
                        ))}
                        {match.missing_skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                            missing: {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Skills */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Detected Skills</h2>
              <div className="flex flex-wrap gap-3">
                {result.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Suggestions</h2>
              <ul className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-3 text-gray-300">
                    <span className="text-yellow-400 mt-1">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Extracted Contact Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center">
                  <span className="text-blue-400">📧</span>
                  <span className="text-gray-300">{result.contact.email || "Not found"}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-blue-400">📞</span>
                  <span className="text-gray-300">{result.contact.phone || "Not found"}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
