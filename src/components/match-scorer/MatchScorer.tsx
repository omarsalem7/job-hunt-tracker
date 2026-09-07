import { useState } from "react";
import { useMatchScore } from "../../hooks/useMatchScore";

export function MatchScorer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { status, data, error, scoreMatch } = useMatchScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) return;
    scoreMatch(resumeText, jobDescription);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text..."
          className="h-32 w-full rounded border p-2 text-sm"
        />
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
          className="h-32 w-full rounded border p-2 text-sm"
        />
        <button
          type="submit"
          disabled={
            status === "loading" || !resumeText.trim() || !jobDescription.trim()
          }
          className="rounded disabled:cursor-not-allowed bg-(--text) py-2 text-(--bg) disabled:opacity-50"
        >
          {status === "loading" ? "Scoring..." : "Score match"}
        </button>
      </form>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      {status === "success" && data && (
        <div className="rounded-xl border border-(--border) p-4">
          <p className="text-2xl font-semibold text-(--text)">
            {data.score}% match
          </p>
          <div className="mt-3">
            <p className="text-sm font-medium text-(--text)">
              Matched keywords
            </p>
            <p className="text-sm text-gray-600">
              {data.matchedKeywords.join(", ") || "None"}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-sm font-medium text-red-700">Missing keywords</p>
            <p className="text-sm text-gray-600">
              {data.missingKeywords.join(", ") || "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
