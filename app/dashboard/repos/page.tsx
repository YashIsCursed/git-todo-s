import { createClient } from "@/lib/supabase/server";
import { getUserRepos } from "@/lib/gitdata/getUserRepos";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AllReposPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  // The provider token (GitHub access token) is available in the session object
  const providerToken = session.provider_token;

  let repos = [];
  let error = null;

  if (providerToken) {
    try {
      repos = await getUserRepos(providerToken);
    } catch (e: any) {
      error = e.message;
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Repositories</h1>
        <span className="text-sm text-muted-foreground">
          {repos.length} repositories found
        </span>
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-muted/50 overflow-hidden">
        {providerToken ? (
          <h2 className="font-semibold">Valid GitHub OAuth</h2>
        ) : (
          <>
            <h2 className="font-semibold text-destructive">
              Invalid GitHub OAuth
            </h2>
            <p className="text-destructive p-2 rounded flex items-center">
              Its Prefered To Re-login
              <Link
                href="/signout"
                className="ml-2 p-2 bg-red-500/10 rounded text-bold border-yellow-500/30"
              >
                Sign out
              </Link>
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 border border-destructive/50 text-destructive rounded-lg mb-6">
          Error fetching repos: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(repos) &&
          repos.map((repo: any) => (
            <Link key={repo.id} href={`/dashboard/repos/${repo.id}`}>
              <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card text-card-foreground shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold hover:underline truncate mr-2">
                    {repo.name}
                  </p>
                  {repo.private ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                      Private
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                  {repo.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {repo.language || "Unknown"}
                  </span>
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
