"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Repo = Database["public"]["Tables"]["repositories"]["Row"];

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardStats {
  totalRepos: number;
  openTasks: number;
  completedTasks: number;
  anchors: number;
  newOpenSinceYesterday: number;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { count: repoCount } = await supabase
    .from("repositories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  const { data: allTasks } = await supabase
    .from("tasks")
    .select("status, file_path, created_at")
    .eq("user_id", session.user.id);

  const tasks = (allTasks || []) as Pick<
    Task,
    "status" | "file_path" | "created_at"
  >[];

  const openTasks = tasks.filter(
    (t) => t.status === "open" || t.status === "in_progress",
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const anchors = tasks.filter((t) => t.file_path).length;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newOpenSinceYesterday = tasks.filter(
    (t) =>
      new Date(t.created_at) > yesterday &&
      (t.status === "open" || t.status === "in_progress"),
  ).length;

  return {
    totalRepos: repoCount || 0,
    openTasks,
    completedTasks,
    anchors,
    newOpenSinceYesterday,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALL USER TASKS
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllUserTasks() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      repositories (
        id,
        name,
        full_name
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }

  return data || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK COUNTS PER REPOSITORY
// ═══════════════════════════════════════════════════════════════════════════

interface TaskCounts {
  total: number;
  open: number;
  completed: number;
}

export async function getTaskCountsByRepo(): Promise<
  Record<number, TaskCounts>
> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return {};

  const { data: reposData } = await supabase
    .from("repositories")
    .select("id, github_id")
    .eq("user_id", session.user.id);

  const repos = (reposData || []) as Pick<Repo, "id" | "github_id">[];
  if (repos.length === 0) return {};

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("repository_id, status")
    .eq("user_id", session.user.id);

  const tasks = (tasksData || []) as Pick<Task, "repository_id" | "status">[];
  const countMap: Record<number, TaskCounts> = {};

  const idToGithubId: Record<string, number> = {};
  repos.forEach((r) => {
    idToGithubId[r.id] = r.github_id;
  });

  tasks.forEach((t) => {
    const githubId = idToGithubId[t.repository_id];
    if (githubId) {
      if (!countMap[githubId]) {
        countMap[githubId] = { total: 0, open: 0, completed: 0 };
      }
      countMap[githubId].total++;
      if (t.status === "open" || t.status === "in_progress") {
        countMap[githubId].open++;
      } else if (t.status === "completed") {
        countMap[githubId].completed++;
      }
    }
  });

  return countMap;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE TASK PIN/STAR
// ═══════════════════════════════════════════════════════════════════════════

export async function toggleTaskStar(taskId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: taskData } = await supabase
    .from("tasks")
    .select("is_starred")
    .eq("id", taskId)
    .single();

  const task = taskData as Pick<Task, "is_starred"> | null;
  if (!task) throw new Error("Task not found");

  const newStarred = !task.is_starred;

  const { error } = await (supabase.from("tasks") as any)
    .update({ is_starred: newStarred })
    .eq("id", taskId);

  if (error) throw error;
  return newStarred;
}

// ═══════════════════════════════════════════════════════════════════════════
// PINNED REPOSITORIES
// ═══════════════════════════════════════════════════════════════════════════

export async function getPinnedRepos(): Promise<Repo[]> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return [];

  const { data, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_pinned", true)
    .limit(6);

  if (error) {
    console.error("Error fetching pinned repos:", error);
    return [];
  }

  return (data || []) as Repo[];
}

export async function toggleRepoPin(repoId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: repoData } = await supabase
    .from("repositories")
    .select("is_pinned")
    .eq("id", repoId)
    .single();

  const repo = repoData as Pick<Repo, "is_pinned"> | null;
  if (!repo) throw new Error("Repository not found");

  const newPinned = !repo.is_pinned;

  const { error } = await (supabase.from("repositories") as any)
    .update({ is_pinned: newPinned })
    .eq("id", repoId);

  if (error) throw error;
  return newPinned;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════════════════════════════════════════

export async function getRecentActivity() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return [];

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      type,
      status,
      created_at,
      updated_at,
      repositories (
        name,
        full_name
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  return recentTasks || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// USER SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export async function getUserSettings() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: user } = await supabase.auth.getUser();

  return {
    user: user?.user,
    theme: "light",
    notifications: true,
    defaultTaskType: "TODO",
    defaultPriority: "medium",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY SYNC
// ═══════════════════════════════════════════════════════════════════════════

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  private: boolean;
  language: string | null;
}

export async function ensureRepository(githubRepo: GitHubRepo): Promise<Repo> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Unauthorized");

  const { data: existingData } = await supabase
    .from("repositories")
    .select("*")
    .eq("github_id", githubRepo.id)
    .single();

  const existingRepo = existingData as Repo | null;
  if (existingRepo) {
    return existingRepo;
  }

  const { data: newRepoData, error } = await (
    supabase.from("repositories") as any
  )
    .insert({
      user_id: session.user.id,
      github_id: githubRepo.id,
      name: githubRepo.name,
      full_name: githubRepo.full_name,
      description: githubRepo.description,
      url: githubRepo.html_url,
      default_branch: githubRepo.default_branch,
      is_private: githubRepo.private,
      language: githubRepo.language,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating repo record:", error);
    throw new Error("Failed to sync repository");
  }

  return newRepoData as Repo;
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function getRepoTasks(repoId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("repository_id", repoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Task[];
}

interface TaskContext {
  file: string;
  sha: string;
  lineStart?: number;
  lineEnd?: number;
}

export async function createTask(
  repoId: string,
  content: string,
  type: Task["type"] = "TODO",
  priority: Task["priority"] = "medium",
  context?: TaskContext,
): Promise<Task> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { data, error } = await (supabase.from("tasks") as any)
    .insert({
      user_id: session.user.id,
      repository_id: repoId,
      title: content,
      type: type,
      priority: priority,
      status: "open",
      file_path: context?.file || null,
      commit_sha: context?.sha || null,
      line_start: context?.lineStart || null,
      line_end: context?.lineEnd || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(
  taskId: string,
  completed: boolean,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await (supabase.from("tasks") as any)
    .update({ status: completed ? "completed" : "open" })
    .eq("id", taskId);

  if (error) throw error;
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}
