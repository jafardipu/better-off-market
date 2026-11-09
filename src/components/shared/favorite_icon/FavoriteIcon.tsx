"use client";
import { cn } from "@/lib/utils";
import {
  useCreateFavoriteMutation,
  useDeleteFavoriteMutation,
  useGetFavoritesQuery,
} from "@/redux/api/favoriteApi";
import { useAppSelector } from "@/redux/hooks";
import { Heart, Loader } from "lucide-react";
import { AppDialog } from "../dialog/AppDialog";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ISavePropertiesResponse } from "@/types";
import { toast } from "sonner";

export default function FavoriteIcon({
  id,
  isBtnType = false,
}: {
  id: string;
  isBtnType?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const [createFavorite, { isLoading }] = useCreateFavoriteMutation();
  const router = useRouter();
  const pathName = usePathname();
  const { data: savePropertiesData, isLoading: isLoadingProperties } =
    useGetFavoritesQuery(undefined, { skip: !user });

  const saveProperties: ISavePropertiesResponse[] =
    savePropertiesData?.data?.data || [];

  const [deletedFavorite, { isLoading: isDeleting }] =
    useDeleteFavoriteMutation();

  const favoriteEntry = saveProperties?.find(
    (property) => property?.property?._id === id,
  );

  const favored = Boolean(favoriteEntry);

  const handleFavoriteClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (isLoading || isDeleting || isLoadingProperties) return;
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setOpen(true);
      return;
    }

    try {
      if (favored && favoriteEntry) {
        toast.loading("Removing saved property...", { id: "remove" });
        await deletedFavorite(favoriteEntry._id).unwrap();
        toast.success("Property removed from saved!", { id: "remove" });
      } else {
        toast.loading("Saving property...", { id: "save" });
        await createFavorite({ property: id }).unwrap();
        toast.success("Property saved!", { id: "save" });
      }
    } catch (error) {
      console.error("Error creating favorite:", error);
    }
  };
  return (
    <>
      {isBtnType ? (
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "group/favorite w-full flex-1  border-2 border-primary-gray hover:border-gray-400  text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 duration-500 cursor-pointer hover:bg-red-500 hover:border-none group hover:text-white",
            favored && "bg-red-500 border-none text-white",
          )}
        >
          {isLoading || isDeleting || isLoadingProperties ? (
            <Loader size={20} className="animate-spin text-white" />
          ) : (
            <Heart
              size={20}
              className={cn("group-hover/favorite:text-white group-hover:fill-white duration-500 transition-colors", favored && "fill-white text-white group-hover/favorite:fill-transparent")}
            />
          )}
          Save
        </button>
      ) : (
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "group/favorite absolute top-3 right-3 rounded-full bg-black/10 backdrop-blur-[2px] p-2 hover:bg-red-500 transition-colors shadow-sm cursor-pointer duration-300 ease-in-out",
            favored && "bg-red-500 hover:bg-black/10 hover:backdrop-blur-[2px]",
          )}
          aria-label="Add to favorites"
        >
          {isLoading || isDeleting || isLoadingProperties ? (
            <Loader size={20} className="animate-spin text-white" />
          ) : (
            <Heart
              size={20}
              className={
                // favorited ? 'fill-red-500 text-red-500' :
                cn(
                  "text-white  group-hover/favorite:text-white transition-colors duration-500 ease-in-out",
                  favored &&
                    "fill-white text-white group-hover/favorite:text-white",
                )
              }
            />
          )}
        </button>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <AppDialog
          open={open}
          onOpenChange={setOpen}
          title="Sign in to continue"
          description="Login your account to Save this property."
          actions={[
            {
              label: "Cancel",
              variant: "outline",
              onClick: () => setOpen(false),
            },
            {
              label: "Login",
              onClick: () => router.push(`/login?callbackUrl=${pathName}`),
            },
          ]}
        />
      </div>
    </>
  );
}
