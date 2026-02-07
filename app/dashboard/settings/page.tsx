import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Get user metadata
  const userMeta = user.user_metadata;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="handwritten text-xl text-[var(--organic-terracotta)]">
          ⚙️ customize your
        </span>
        <h1 className="display-font text-3xl text-[var(--organic-forest)]">
          Settings
        </h1>
      </div>

      <SettingsContent user={user} userMeta={userMeta} />
    </div>
  );
}
