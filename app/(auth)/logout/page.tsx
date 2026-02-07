import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LogoutPage() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl mb-4 block">🍂</span>
        <p className="handwritten text-2xl text-[var(--organic-earth)]">
          Logging out...
        </p>
      </div>
    </div>
  );
}
