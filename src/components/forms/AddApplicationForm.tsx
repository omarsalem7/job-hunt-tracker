import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "../../lib/validation";
import { useCreateApplication } from "../../hooks/useApplications";
import { useTagsQuery } from "../../hooks/useTags";
import { useParseJob } from "../../hooks/useAi";
import { TagSelector } from "../tags/TagSelector";
import {
  BriefcaseIcon,
  XIcon,
  SparklesIcon,
  LoaderIcon,
  CheckIcon,
} from "../common/Icons";

export function AddApplicationForm({
  onDone,
  onOpenTagManager,
  initialShowAi = false,
}: {
  onDone: () => void;
  onOpenTagManager?: () => void;
  initialShowAi?: boolean;
}) {
  const { mutate: createApplication, isPending } = useCreateApplication();
  const { mutate: parseJob, isPending: isParsingAi } = useParseJob();
  const { data: allTags = [] } = useTagsQuery();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAiParser, setShowAiParser] = useState(initialShowAi);
  const [aiJobText, setAiJobText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { stage: "applied", tagIds: [] },
  });

  const tagIds = watch("tagIds") || [];

  const handleExtractWithAi = () => {
    const textToParse = aiJobText.trim();
    if (textToParse.length < 20) {
      setAiError(
        "Job description text is too short (minimum 20 characters required)."
      );
      return;
    }

    setAiError(null);
    setAiSuccess(null);

    parseJob(textToParse, {
      onSuccess: (data) => {
        if (data.company) {
          setValue("company", data.company, { shouldValidate: true });
        }
        if (data.role) {
          setValue("role", data.role, { shouldValidate: true });
        }
        if (data.stage) {
          setValue("stage", data.stage, { shouldValidate: true });
        }
        if (data.notes) {
          setValue("notes", data.notes, { shouldValidate: true });
        }
        if (!getValues("appliedDate")) {
          setValue(
            "appliedDate",
            new Date().toISOString().split("T")[0],
            { shouldValidate: true }
          );
        }

        // Auto-match user's existing tags mentioned in the parsed notes or posting
        if (allTags.length > 0) {
          const combined = `${data.company} ${data.role} ${data.notes || ""} ${textToParse}`.toLowerCase();
          const matched = allTags.filter((tag) => {
            const name = tag.name.toLowerCase().trim();
            if (!name) return false;
            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
            return pattern.test(combined);
          });

          if (matched.length > 0) {
            const currentTagIds = getValues("tagIds") || [];
            const merged = Array.from(new Set([...currentTagIds, ...matched.map((t) => t.id)]));
            setValue("tagIds", merged, { shouldValidate: true });
          }
        }

        setAiSuccess("Extracted successfully! Review the pre-filled fields below.");
      },
      onError: (err) => {
        setAiError(
          err instanceof Error
            ? err.message
            : "Failed to extract job details with AI."
        );
      },
    });
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAiJobText(text);
        setAiError(null);
      }
    } catch {
      // Clipboard read permission might be denied; ignore gracefully
    }
  };

  const onSubmit = (values: ApplicationFormValues) => {
    setSubmitError(null);
    createApplication(values, {
      onSuccess: () => {
        onDone();
      },
      onError: (err: unknown) => {
        setSubmitError(
          err instanceof Error ? err.message : "Failed to create application"
        );
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border) pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BriefcaseIcon size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-(--text)">Add Application</h2>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          title="Close"
        >
          <XIcon size={18} />
        </button>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
          {submitError}
        </div>
      )}

      {/* Form Fields (Scrollable if height constrained with breathing room for focus rings) */}
      <div className="flex-1 overflow-y-auto -m-2 p-2 flex flex-col gap-3.5">
        {/* AI Auto-fill Section */}
        <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-blue-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-blue-950/20 p-3.5 transition-all shadow-xs">
          {!showAiParser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                  <SparklesIcon size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                    Auto-fill with AI
                  </h3>
                  <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                    Paste a job description to extract company, role, requirements & notes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiParser(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <SparklesIcon size={12} className="text-indigo-500" />
                <span>Parse Job</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
                    <SparklesIcon size={12} />
                  </div>
                  <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                    AI Job Description Parser
                  </span>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    Gemini
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiParser(false)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Hide
                </button>
              </div>

              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                Paste the job posting below. Gemini will extract the company, official role, and structured markdown notes.
              </p>

              <div>
                <textarea
                  value={aiJobText}
                  onChange={(e) => {
                    setAiJobText(e.target.value);
                    if (aiError) setAiError(null);
                  }}
                  placeholder="Paste job posting text here (e.g. from LinkedIn, Indeed, Greenhouse, career page)..."
                  rows={4}
                  className="w-full rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-2.5 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
                  disabled={isParsingAi}
                />
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span
                    className={
                      aiJobText.length > 0 && aiJobText.trim().length < 20
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400"
                    }
                  >
                    {aiJobText.length} characters{" "}
                    {aiJobText.length > 0 && aiJobText.trim().length < 20 && "(min 20)"}
                  </span>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Paste from clipboard
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
                  {aiError}
                </div>
              )}

              {aiSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckIcon size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{aiSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {aiJobText && (
                  <button
                    type="button"
                    onClick={() => {
                      setAiJobText("");
                      setAiError(null);
                      setAiSuccess(null);
                    }}
                    disabled={isParsingAi}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer px-2 py-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExtractWithAi}
                  disabled={isParsingAi || aiJobText.trim().length < 20}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-colors"
                >
                  {isParsingAi ? (
                    <>
                      <LoaderIcon size={13} className="text-white" />
                      <span>Extracting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon size={13} />
                      <span>Extract Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              {...register("company")}
              placeholder="e.g. Google, Stripe"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isPending}
            />
            {errors.company && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.company.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              {...register("role")}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isPending}
            />
            {errors.role && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        {/* Stage & Applied Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Stage
            </label>
            <select
              {...register("stage")}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              disabled={isPending}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Applied Date
            </label>
            <input
              type="date"
              {...register("appliedDate")}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isPending}
            />
            {errors.appliedDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.appliedDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Tags Selector */}
        <div>
          <TagSelector
            selectedTagIds={tagIds}
            onChange={(ids) => setValue("tagIds", ids, { shouldValidate: true })}
            onOpenManager={onOpenTagManager}
            label="Tags"
            placeholder="Assign tags to this application..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Notes <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            {...register("notes")}
            placeholder="Key requirements, recruiter info, salary range, or notes..."
            rows={4}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-(--border) flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-(--border) px-4 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
        >
          {isPending ? "Adding..." : "Add Application"}
        </button>
      </div>
    </form>
  );
}
