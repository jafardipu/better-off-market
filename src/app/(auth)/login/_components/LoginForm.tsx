"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import logo from "@/assets/images/logo_blue.png";
import Image from "next/image";
import { useAppDispatch } from "@/redux/hooks";
import { useSearchParams } from "next/navigation";
import { setUser } from "@/redux/features/authSlice";
import { jwtDecode } from "jwt-decode";
import { useLoginMutation } from "@/redux/api/authApi";
import { toast } from "sonner";
import { errorModification } from "@/lib/errors/errorModification";
import { LoaderIcon } from "@/icons";
import useFcmToken from "@/hooks/useFcmToken";

// Zod validation schema
const loginSchema = z.object({
  // userType: z.enum(["Buyer", "Seller"] as const, "Please select a user type"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { requestFcmToken } = useFcmToken();

  const callbackUrl = useSearchParams().get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      // userType: "Buyer",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData & { fcmToken?: string }) => {
    try {
      // Try FCM, but never block login for long. FirebaseProvider also syncs
      // the token after auth is restored on the next page load.
      const fcmToken = await Promise.race([
        requestFcmToken(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);

      if (fcmToken) data.fcmToken = fcmToken;

      const res = await login(data).unwrap();

      dispatch(
        setUser({
          user: jwtDecode(res?.data?.accessToken),
          token: res?.data?.accessToken,
        }),
      );
      toast.success("Login successful!");
      setError(null);

      // Hard navigation so proxy/middleware re-reads the cookie. Client
      // router.push can reuse a cached redirect from the earlier
      // unauthenticated visit to /submit-offer and leave the user stuck.

      const destination =
        callbackUrl &&
          callbackUrl.startsWith("/") &&
          !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/";
      window.location.assign(destination);
    } catch (err: any) {
      const error = errorModification(err);
      toast.error(error);
      setError(error);
    }
  };

  return (
    <div className="w-full xl:max-w-4xl md:max-w-xl mx-auto rounded-lg bg-white p-8 shadow-lg">
      {/* Logo */}
      <div className="mb-1 text-center">
        <div className="inline-flex flex-col items-center">
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              width={1200}
              height={1200}
              className="w-32"
            />
          </Link>
        </div>
      </div>

      {/* Title and Subtitle */}
      <h1 className="mb-2 text-center lg:text-3xl md:text-2xl text-xl font-bold text-gray-900">
        Welcome Back
      </h1>
      <p className="mb-6 text-center">Sign in to your account</p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* User Type Dropdown */}
        {/* <div>
          <label
            htmlFor="userType"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Select User
          </label>
          <div className="relative">
            <select
              id="userType"
              {...register("userType")}
              className="w-full appearance-none rounded-lg border border-[#3D3D3D] bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.userType && (
            <p className="mt-1 text-xs text-red-600">
              {errors.userType.message}
            </p>
          )}
        </div> */}

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            {...register("email")}
            className="w-full rounded-lg border border-[#3D3D3D] px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-lg border border-[#3D3D3D] px-4 py-2.5 pr-10 text-gray-900 placeholder-gray-400 transition focus:border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="rememberMe"
            className="flex items-center gap-2 text-sm text-primary-black cursor-pointer"
          >
            <input
              id="rememberMe"
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 transition focus:ring-blue-500 accent-primary-color"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#2563EB] hover:text-blue-700"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign Up Link */}
        <p className="mb-4 text-center text-sm text-gray-700">
          Don&apos;t have Account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#2563EB] hover:text-blue-700"
          >
            Sign Up
          </Link>
        </p>

        {/* Continue without Sign In */}
        <div>
          <Link href="/">
            <button
              type="button"
              className="w-full text-center  font-medium text-[#0095FF] hover:text-blue-700 cursor-pointer"
            >
              Continue without Sign In
            </button>
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[#2A2A2A] cursor-pointer px-4 py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoaderIcon className="-ml-1 mr-3" />
              <span>Signing in...</span>
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}
