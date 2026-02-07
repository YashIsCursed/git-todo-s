import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getAllUserTasks,
  updateTaskStatus,
  deleteTask,
} from "@/lib/db/actions";
import Link from "next/link";
import { TaskCard } from "./task-card";

export default async function AllTasks() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const tasks = await getAllUserTasks();

  const openTasks = tasks.filter(
    (t: any) => t.status === "open" || t.status === "in_progress",
  );
  const completedTasks = tasks.filter((t: any) => t.status === "completed");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="handwritten text-xl text-[var(--organic-terracotta)]">
            ☀️ all your growing
          </span>
          <h1 className="display-font text-3xl text-[var(--organic-forest)]">
            Tasks
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="organic-tag">
            <span>📋</span>
            <span>{openTasks.length} open</span>
          </div>
          <div className="organic-tag">
            <span>✅</span>
            <span>{completedTasks.length} done</span>
          </div>
        </div>
      </div>

      {/* Task Filters Legend */}
      <div className="flex flex-wrap gap-2">
        {["TODO", "FIXME", "BUG", "SECURITY", "OPTIMIZE", "NOTE"].map(
          (type) => {
            const count = tasks.filter((t: any) => t.type === type).length;
            if (count === 0) return null;
            return (
              <span
                key={type}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-default ${getTypeStyles(
                  type,
                )}`}
              >
                {type} ({count})
              </span>
            );
          },
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-6">
          {/* Open Tasks Section */}
          {openTasks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌱</span>
                <h2 className="display-font text-xl text-[var(--organic-forest)]">
                  In Progress
                </h2>
                <span className="text-sm text-[var(--organic-sage)]">
                  ({openTasks.length})
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {openTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌸</span>
                <h2 className="display-font text-xl text-[var(--organic-forest)]">
                  Completed
                </h2>
                <span className="text-sm text-[var(--organic-sage)]">
                  ({completedTasks.length})
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                {completedTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        // Empty State
        <div className="organic-card p-16 text-center">
          <span className="text-6xl mb-6 block float">☀️</span>
          <h2 className="display-font text-2xl text-[var(--organic-forest)] mb-3">
            No tasks yet
          </h2>
          <p className="text-[var(--organic-earth)] max-w-md mx-auto">
            Tasks from all your repositories will bloom here. Start by selecting
            a repository and creating your first task!
          </p>
          <Link
            href="/dashboard/repos"
            className="organic-btn inline-flex mt-6"
          >
            Browse Repositories 🌿
          </Link>
        </div>
      )}
    </div>
  );
}

function getTypeStyles(type: string): string {
  switch (type) {
    case "BUG":
      return "text-red-600 bg-red-50 border-red-200";
    case "FIXME":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "SECURITY":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "OPTIMIZE":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "HACK":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "DEPRECATED":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "REVIEW":
      return "text-pink-600 bg-pink-50 border-pink-200";
    case "NOTE":
      return "text-cyan-600 bg-cyan-50 border-cyan-200";
    case "ALERT":
      return "text-amber-600 bg-amber-50 border-amber-200";
    default:
      return "text-[var(--organic-forest)] bg-[var(--organic-sage)]/20 border-[var(--organic-sage)]/30";
  }
}
