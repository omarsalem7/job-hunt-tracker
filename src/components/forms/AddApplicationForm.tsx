import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "../../lib/validation";
import { useCreateApplication } from "../../hooks/useApplications";
import { TagSelector } from "../tags/TagSelector";

export function AddApplicationForm({
  onDone,
  onOpenTagManager,
}: {
  onDone: () => void;
  onOpenTagManager?: () => void;
}) {
  const { mutate: createApplication, isPending } = useCreateApplication();

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
    createApplication(values, {
      onSuccess: () => {
        onDone();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-(--text) mb-1">Add Application</h2>

      <div>
        <input
          {...register("company")}
          placeholder="Company"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        {errors.company && (
          <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("role")}
          placeholder="Role"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        {errors.role && (
          <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <input
          type="date"
          {...register("appliedDate")}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        {errors.appliedDate && (
          <p className="mt-1 text-xs text-red-600">{errors.appliedDate.message}</p>
        )}
      </div>

      <select
        {...register("stage")}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isPending}
      >
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Tags Selector */}
      <TagSelector
        selectedTagIds={tagIds}
        onChange={(ids) => setValue("tagIds", ids, { shouldValidate: true })}
        onOpenManager={onOpenTagManager}
        label="Tags"
        placeholder="Assign tags to this application..."
      />

      <textarea
        {...register("notes")}
        placeholder="Notes (optional)"
        rows={3}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
      >
        {isPending ? "Adding..." : "Add application"}
      </button>
    </form>
  );
}
