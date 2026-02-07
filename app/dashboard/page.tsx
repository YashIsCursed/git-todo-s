import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getPinnedRepos,
  getRecentActivity,
} from "@/lib/db/actions";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch all dashboard data
  const [stats, pinnedRepos, recentActivity] = await Promise.all([
    getDashboardStats(),
    getPinnedRepos(),
    getRecentActivity(),
  ]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in_progress":
        return "🔄";
      default:
        return "📋";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BUG":
        return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900";
      case "FIXME":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900";
      case "SECURITY":
        return "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900";
      case "OPTIMIZE":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900";
      default:
        return "text-[var(--organic-forest)] bg-[var(--organic-sage)]/20 border-[var(--organic-sage)]/30";
    }
  };

  // Calculate completion percentage
  const totalTasks = (stats?.openTasks || 0) + (stats?.completedTasks || 0);
  const completionRate =
    totalTasks > 0
      ? Math.round(((stats?.completedTasks || 0) / totalTasks) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section - Refined Typography */}
      <div className="mb-2">
        <span className="handwritten text-xl text-[var(--organic-terracotta)] tracking-wide">
          welcome back to your
        </span>
        <h1 className="display-font text-5xl text-[var(--organic-forest)] mt-1 tracking-tight">
          Garden Dashboard
        </h1>
      </div>

      {/* Stats Section - Premium Grid Layout */}
      <div className="grid gap-1 md:grid-cols-4">
        {/* Main Stats Container */}
        <div className="md:col-span-4 organic-card p-0 overflow-hidden">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--organic-sage)]/10">
            {/* Repositories */}
            <div className="p-6 group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--organic-sage)]">
                  Repositories
                </span>
                <span className="w-8 h-8 rounded-lg bg-[var(--organic-sage)]/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  🌿
                </span>
              </div>
              <div className="display-font text-5xl text-[var(--organic-forest)] tabular-nums">
                {stats?.totalRepos || 0}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-[var(--organic-sage)]"></span>
                <span className="text-xs text-[var(--organic-earth)]">
                  Connected via GitHub
                </span>
              </div>
            </div>

            {/* Open Tasks */}
            <div className="p-6 group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--organic-sage)]">
                  Open Tasks
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  ☀️
                </span>
              </div>
              <div className="display-font text-5xl text-[var(--organic-forest)] tabular-nums">
                {stats?.openTasks || 0}
              </div>
              <div className="flex items-center gap-2 mt-3">
                {stats?.newOpenSinceYesterday ? (
                  <>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      +{stats.newOpenSinceYesterday} new
                    </span>
                    <span className="text-xs text-[var(--organic-earth)]">
                      since yesterday
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-[var(--organic-earth)]">
                      All caught up
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Completed */}
            <div className="p-6 group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--organic-sage)]">
                  Completed
                </span>
                <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  🌸
                </span>
              </div>
              <div className="display-font text-5xl text-[var(--organic-forest)] tabular-nums">
                {stats?.completedTasks || 0}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1.5 bg-[var(--organic-sage)]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--organic-sage)] to-[var(--organic-forest)] rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--organic-earth)] tabular-nums">
                  {completionRate}%
                </span>
              </div>
            </div>

            {/* Anchors */}
            <div className="p-6 group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--organic-sage)]">
                  Code Anchors
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  📍
                </span>
              </div>
              <div className="display-font text-5xl text-[var(--organic-forest)] tabular-nums">
                {stats?.anchors || 0}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-[var(--organic-terracotta)]"></span>
                <span className="text-xs text-[var(--organic-earth)]">
                  File references
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity - Wider */}
        <div className="organic-card p-6 lg:col-span-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--organic-sage)]/10 flex items-center justify-center text-xl">
                📊
              </span>
              <div>
                <h2 className="display-font text-xl text-[var(--organic-forest)]">
                  Recent Activity
                </h2>
                <p className="text-xs text-[var(--organic-sage)]">
                  Latest task updates
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/all-tasks"
              className="text-xs text-[var(--organic-sage)] hover:text-[var(--organic-forest)] transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {recentActivity.map((activity: any, index: number) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--organic-sage)]/5 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--organic-sage)]/10 flex items-center justify-center text-base shrink-0">
                    {getStatusEmoji(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--organic-forest)] truncate group-hover:text-[var(--organic-terracotta)] transition-colors">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(activity.type)}`}
                      >
                        {activity.type}
                      </span>
                      {activity.repositories && (
                        <span className="text-[10px] text-[var(--organic-sage)]">
                          {activity.repositories.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--organic-sage)] whitespace-nowrap tabular-nums">
                    {formatTimeAgo(activity.updated_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--organic-sage)]/10 flex items-center justify-center text-3xl mb-4">
                🌱
              </div>
              <p className="text-[var(--organic-earth)] font-medium">
                No recent activity yet
              </p>
              <p className="text-sm text-[var(--organic-sage)] mt-1">
                Start by adding tasks to your repositories
              </p>
              <Link
                href="/dashboard/repos"
                className="organic-btn text-sm mt-5 py-2 px-5"
              >
                Browse Repos
              </Link>
            </div>
          )}
        </div>

        {/* Pinned Repos - Narrower */}
        <div className="organic-card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--organic-terracotta)]/10 flex items-center justify-center text-xl">
                📌
              </span>
              <div>
                <h2 className="display-font text-xl text-[var(--organic-forest)]">
                  Pinned Repos
                </h2>
                <p className="text-xs text-[var(--organic-sage)]">
                  Quick access
                </p>
              </div>
            </div>
          </div>

          {pinnedRepos && pinnedRepos.length > 0 ? (
            <div className="space-y-2">
              {pinnedRepos.map((repo: any) => (
                <Link
                  key={repo.id}
                  href={`/dashboard/repos/${repo.github_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--organic-sage)]/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--organic-sage)]/10 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                    🌿
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--organic-forest)] truncate">
                      {repo.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--organic-sage)]">
                        {repo.language || "Unknown"}
                      </span>
                      <span className="text-[10px] text-[var(--organic-sage)]">
                        •
                      </span>
                      <span className="text-[10px] text-[var(--organic-sage)]">
                        {repo.is_private ? "🔒 Private" : "Public"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--organic-sage)] group-hover:text-[var(--organic-forest)] group-hover:translate-x-1 transition-all text-lg">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--organic-sage)]/10 flex items-center justify-center text-3xl mb-4">
                🌲
              </div>
              <p className="text-[var(--organic-earth)] font-medium">
                No pinned repositories
              </p>
              <p className="text-sm text-[var(--organic-sage)] mt-1">
                Pin your favorites for quick access
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Refined */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/repos"
          className="organic-card p-5 flex items-center gap-4 group hover:scale-[1.01] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--organic-sage)]/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            🌿
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--organic-forest)]">
              Explore Repositories
            </h3>
            <p className="text-xs text-[var(--organic-sage)] mt-0.5">
              Browse and manage your repos
            </p>
          </div>
          <span className="text-[var(--organic-sage)] group-hover:text-[var(--organic-forest)] group-hover:translate-x-1 transition-all">
            →
          </span>
        </Link>

        <Link
          href="/dashboard/all-tasks"
          className="organic-card p-5 flex items-center gap-4 group hover:scale-[1.01] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            ☀️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--organic-forest)]">
              All Tasks
            </h3>
            <p className="text-xs text-[var(--organic-sage)] mt-0.5">
              View tasks across all repos
            </p>
          </div>
          <span className="text-[var(--organic-sage)] group-hover:text-[var(--organic-forest)] group-hover:translate-x-1 transition-all">
            →
          </span>
        </Link>

        <Link
          href="/dashboard/settings"
          className="organic-card p-5 flex items-center gap-4 group hover:scale-[1.01] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--organic-earth)]/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            ⚙️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--organic-forest)]">
              Settings
            </h3>
            <p className="text-xs text-[var(--organic-sage)] mt-0.5">
              Customize your experience
            </p>
          </div>
          <span className="text-[var(--organic-sage)] group-hover:text-[var(--organic-forest)] group-hover:translate-x-1 transition-all">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
