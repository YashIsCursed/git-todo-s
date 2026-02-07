import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect("/");
  }

  const signIn = async () => {
    "use server";

    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: "repo read:user",
      },
    });

    if (error) {
      console.error(error);
      return redirect("/login?error=Could not authenticate user");
    }

    if (data.url) {
      return redirect(data.url);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div
        className="blob w-80 h-80 bg-[var(--organic-sage)]"
        style={{ top: "20%", left: "10%" }}
      />
      <div
        className="blob w-64 h-64 bg-[var(--organic-sky)]"
        style={{ bottom: "20%", right: "15%", animationDelay: "-7s" }}
      />

      {/* Doodle */}
      <div
        className="doodle-circle w-24 h-24"
        style={{ top: "30%", right: "25%" }}
      />

      {/* Main Card */}
      <div className="organic-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <span className="handwritten text-2xl text-[var(--organic-terracotta)]">
            🌱 welcome back
          </span>
          <h1 className="display-font text-4xl mt-2 text-[var(--organic-forest)]">
            Login
          </h1>
          <p className="text-[var(--organic-earth)] mt-2">
            Sign in to nurture your projects
          </p>
        </div>

        <form action={signIn} className="flex flex-col gap-4">
          <button type="submit" className="organic-btn w-full justify-center">
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </button>

          {params?.error && (
            <p className="text-center text-sm font-medium text-[var(--organic-terracotta)] mt-2">
              {params.error}
            </p>
          )}
        </form>

        <p className="text-center mt-6 text-sm text-[var(--organic-earth)] opacity-60">
          We only access your public repositories 🌿
        </p>
      </div>

      {/* Floating elements */}
      <div
        className="fixed bottom-8 right-8 text-3xl float"
        style={{ animationDelay: "-2s" }}
      >
        🍃
      </div>
    </div>
  );
}
