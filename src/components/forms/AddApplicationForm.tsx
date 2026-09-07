import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "../../lib/validation";
import { useAppStore } from "../../store/appStore";

export function AddApplicationForm({ onDone }: { onDone: () => void }) {
  const addApplication = useAppStore((s) => s.addApplication);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { stage: "applied" },
  });

  const onSubmit = (values: ApplicationFormValues) => {
    addApplication(values);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <input
          {...register("company")}
          placeholder="Company"
          className="w-full rounded border p-2"
        />
        {errors.company && (
          <p className="text-sm text-red-600">{errors.company.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("role")}
          placeholder="Role"
          className="w-full rounded border p-2"
        />
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <input
          type="date"
          {...register("appliedDate")}
          className="w-full rounded border p-2"
        />
        {errors.appliedDate && (
          <p className="text-sm text-red-600">{errors.appliedDate.message}</p>
        )}
      </div>

      <select {...register("stage")} className="w-full rounded border p-2">
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>

      <textarea
        {...register("notes")}
        placeholder="Notes (optional)"
        className="w-full rounded border p-2"
      />

      <button type="submit" className="rounded bg-(--text) py-2 text-(--bg)">
        Add application
      </button>
    </form>
  );
}
