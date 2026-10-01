import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "../../lib/validation";
import { useCreateApplication } from "../../hooks/useApplications";
import { TagSelector } from "../tags/TagSelector";
import { BriefcaseIcon, XIcon } from "../common/Icons";

export function AddApplicationForm({
  onDone,
  onOpenTagManager,
}: {
  onDone: () => void;
  onOpenTagManager?: () => void;
}) {
  const { mutate: createApplication, isPending } = useCreateApplication();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { stage: "applied", tagIds: [] },
  });

  const tagIds = watch("tagIds") || [];

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
            rows={3}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
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
