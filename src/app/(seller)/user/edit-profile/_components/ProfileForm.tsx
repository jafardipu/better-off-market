"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Camera, SquarePen } from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/profileApi";
import { toast } from "sonner";
import { revalidateProperties } from "@/lib/actions/revalidate";

// Zod validation schema — aligned to IUser (name, phoneNumber, etc.)
const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().default(""),
  location: z.string().optional().default(""),
  company: z.string().optional().default(""),
  bio: z.string().optional().default(""),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ProfileFormInput = z.input<typeof profileSchema>;

const DEFAULT_IMAGE = "/default_user_profile.png";

export default function ProfileEditForm() {
  const { data, isLoading: isProfileLoading } = useGetMyProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const profile = data?.data;

  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_IMAGE);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, any, ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      location: "",
      company: "",
      bio: "",
    },
  });

  // Populate form + image preview once profile data arrives
  useEffect(() => {
    if (!profile) return;

    reset({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      location: profile.location ?? "",
      company: profile.company ?? "",
      bio: profile.bio ?? "",
    });

    setImagePreview(profile.profile || DEFAULT_IMAGE);
  }, [profile, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmitForm = async (formValues: ProfileFormData) => {
    try {
      const formData = new FormData();

      formData.append("data", JSON.stringify(formValues));

      if (selectedImage) {
        formData.append("profile", selectedImage);
      }

      await updateProfile(formData).unwrap();

      reset(formValues);
      setSelectedImage(null);
      toast.success("Profile updated successfully!");
      await revalidateProperties();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save changes");
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        location: profile.location ?? "",
        company: profile.company ?? "",
        bio: profile.bio ?? "",
      });
      setImagePreview(profile.profile || DEFAULT_IMAGE);
    }
    setSelectedImage(null);
  };

  const isSaving = isUpdating;
  const hasChanges = isDirty || selectedImage !== null;
  const fullName = profile?.name || "Your Name";

  if (isProfileLoading) {
    return (
      <div className="w-full bg-white rounded-lg space-y-8 animate-pulse">
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-96 rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-6 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] border border-[#ECEEF0] rounded-xl">
        <div className="relative">
          <div className="size-24 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={imagePreview}
              alt={fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("image-input")?.click()}
            className="absolute -bottom-1 -right-1 bg-primary-color hover:bg-slate-800 text-white rounded-full p-2 transition-colors"
            title="Change profile image"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            aria-label="Upload profile image"
          />
        </div>
        <div>
          <h2 className="md:text-3xl text-2xl font-semibold text-primary-black">
            {fullName}
          </h2>
        </div>
      </div>

      {/* Form Section */}
      <div className="p-6 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] border border-[#ECEEF0] rounded-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 text-slate-900">
            <SquarePen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-primary-black">
            Edit personal information
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-100"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <button
              disabled
              {...register("email")}
              className={`w-full px-4 py-2 text-start bg-gray-100  border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-not-allowed`}
            >
              {profile?.email}{" "}
            </button>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone
            </label>
            <input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber")}
              className={`w-full px-4 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors ${
                errors.phoneNumber ? "border-red-500" : "border-gray-100"
              }`}
              placeholder="+1 (555) 000-0000"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              {...register("location")}
              className={`w-full px-4 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors ${
                errors.location ? "border-red-500" : "border-gray-100"
              }`}
              placeholder="City, State"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company
            </label>
            <input
              id="company"
              type="text"
              {...register("company")}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
              placeholder="Enter company Name"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              {...register("bio")}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors resize-none"
              rows={4}
              placeholder="Enter a short bio about yourself and/or your company"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="px-8 py-2 bg-primary-color hover:bg-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium rounded-md transition-colors cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving || !hasChanges}
              className="px-8 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 text-primary-black font-medium border border-primary-border-color rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
