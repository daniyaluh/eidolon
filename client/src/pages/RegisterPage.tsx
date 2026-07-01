import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { registerFormSchema } from "../lib/validation/auth";
import type { RegisterFormValues } from "../lib/validation/auth";
import { ApiError } from "../lib/apiClient";
import { FormField } from "../components/ui/FormField";
import { Spinner } from "../components/ui/Spinner";

export function RegisterPage() {
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values.email, values.password, values.displayName);
      // New users get the onboarding journey, which lands them on their profile.
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to register. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Create an account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Display name"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-zinc-400">
        Already have an account?{" "}
        <Link to="/login" className="text-white hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
