import { createClient } from "@/lib/supabase/server";
import { getUserRepos } from "@/lib/gitdata/getUserRepos";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTaskCountsByRepo } from "@/lib/db/actions";

export default async function AllReposPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/login");
  }

  const providerToken = session.provider_token;

  let repos: any[] = [];
  let error = null;

  if (providerToken) {
    try {
      repos = await getUserRepos(providerToken);
    } catch (e: any) {
      error = e.message;
    }
  }

  // Get task counts for each repo
  const taskCounts = await getTaskCountsByRepo();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="handwritten text-xl text-[var(--organic-terracotta)]">
            🌿 your garden of
          </span>
          <h1 className="display-font text-3xl text-[var(--organic-forest)]">
            Repositories
          </h1>
        </div>
        <div className="organic-tag">
          <span>🌱</span>
          <span>{repos.length} repos</span>
        </div>
      </div>

      {/* OAuth Status */}
      {!providerToken && (
        <div className="organic-card p-4 border-l-4 border-[var(--organic-terracotta)]">
          <h2 className="font-semibold text-[var(--organic-terracotta)] flex items-center gap-2">
            <span>⚠️</span> GitHub OAuth Expired
          </h2>
          <p className="text-[var(--organic-earth)] text-sm mt-1">
            Please re-login to refresh your access.
            <Link
              href="/logout"
              className="ml-2 underline text-[var(--organic-terracotta)] hover:opacity-80"
            >
              Sign out →
            </Link>
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="organic-card p-4 border-l-4 border-[var(--organic-terracotta)]">
          <p className="text-[var(--organic-terracotta)]">
            🍂 Error fetching repos: {error}
          </p>
        </div>
      )}

      {/* Repos Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(repos) && repos.length > 0 ? (
          repos.map((repo: any) => {
            const counts = taskCounts[repo.id] || {
              total: 0,
              open: 0,
              completed: 0,
            };
            return (
              <Link key={repo.id} href={`/dashboard/repos/${repo.id}`}>
                <div className="organic-card p-5 h-full hover:scale-[1.02] transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-semibold text-[var(--organic-forest)] truncate mr-2 flex items-center gap-2">
                      <span className="group-hover:scale-110 transition-transform">
                        🌿
                      </span>
                      {repo.name}
                    </p>
                    {repo.private ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--organic-terracotta)]/10 text-[var(--organic-terracotta)] border border-[var(--organic-terracotta)]/20 shrink-0">
                        Private
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--organic-sage)]/20 text-[var(--organic-forest)] border border-[var(--organic-sage)]/30 shrink-0">
                        Public
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--organic-earth)] line-clamp-2 h-10 mb-4">
                    {repo.description || "No description provided"}
                  </p>

                  {/* Task Stats */}
                  <div className="flex items-center gap-2 mb-3">
                    {counts.total > 0 ? (
                      <>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--organic-sage)]/20 text-[var(--organic-forest)] flex items-center gap-1">
                          <span>📋</span>
                          {counts.total} task{counts.total !== 1 ? "s" : ""}
                        </span>
                        {counts.open > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                            <span>☀️</span>
                            {counts.open} open
                          </span>
                        )}
                        {counts.completed > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                            <span>✅</span>
                            {counts.completed}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-[var(--organic-sage)] italic">
                        No tasks yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--organic-sage)]">
                    <span className="flex items-center gap-1">
                      🔤 {repo.language || "Unknown"}
                    </span>
                    <span>⭐ {repo.stargazers_count}</span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full organic-card p-12 text-center">
            <span className="text-5xl mb-4 block">🌱</span>
            <h3 className="display-font text-xl text-[var(--organic-forest)] mb-2">
              No repositories yet
            </h3>
            <p className="text-[var(--organic-earth)]">
              Your garden is waiting to be planted!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
