"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Repo = Database["public"]["Tables"]["repositories"]["Row"];

export async function ensureRepository(githubRepo: any) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Unauthorized");

  // Check if repo exists by github_id
  const { data: existingRepo } = await supabase
    .from("repositories")
    .select("*")
    .eq("github_id", githubRepo.id)
    .single();

  if (existingRepo) {
    return existingRepo;
  }

  // Insert if not exists
  const { data: newRepo, error } = await supabase
    .from("repositories")
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

  return newRepo;
}

export async function getRepoTasks(repoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("repository_id", repoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTask(
  repoId: string,
  content: string,
  type: Task["type"] = "TODO",
  priority: Task["priority"] = "medium",
  context?: { file: string; sha: string }
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: session.user.id,
      repository_id: repoId,
      title: content,
      type: type,
      priority: priority,
      status: "open",
      file_path: context?.file || null,
      commit_sha: context?.sha || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskStatus(taskId: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: completed ? "completed" : "open" })
    .eq("id", taskId);

  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}
