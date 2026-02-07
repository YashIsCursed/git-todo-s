import { createClient } from "@/lib/supabase/server";
import { getRepoById, getRepoTree } from "@/lib/gitdata/functions";
import RepoManager from "@/components/dashboard/repo-manager";
import { redirect } from "next/navigation";
import { ensureRepository, getRepoTasks } from "@/lib/db/actions";
import { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export default async function RepoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const token = session.provider_token;
  if (!token) {
    return (
      <div className="p-8 text-center">
        <div className="organic-card p-8 max-w-md mx-auto">
          <span className="text-4xl block mb-4">🔐</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)] mb-2">
            Session Expired
          </h2>
          <p className="text-[var(--organic-earth)] text-sm">
            Your GitHub access token has expired. Please sign out and sign in
            again.
          </p>
        </div>
      </div>
    );
  }

  // Fetch Repo Details from GitHub
  let repo;
  try {
    repo = await getRepoById(token, id);
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <div className="organic-card p-8 max-w-md mx-auto">
          <span className="text-4xl block mb-4">🌿</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)] mb-2">
            Repository Not Found
          </h2>
          <p className="text-[var(--organic-earth)] text-sm">
            Could not load repository with ID: {id}
          </p>
        </div>
      </div>
    );
  }

  // Sync with internal DB
  let dbRepo;
  let tasks: Task[] = [];
  try {
    dbRepo = await ensureRepository(repo);
    tasks = await getRepoTasks(dbRepo.id);
  } catch (e) {
    console.error("Failed to sync repo or fetch tasks", e);
    // Continue without DB features if failing
  }

  // Fetch File Tree
  let treeRequestData;
  try {
    treeRequestData = await getRepoTree(
      token,
      repo.full_name,
      repo.default_branch,
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <div className="organic-card p-8 max-w-md mx-auto">
          <span className="text-4xl block mb-4">📂</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)] mb-2">
            Could Not Load Files
          </h2>
          <p className="text-[var(--organic-earth)] text-sm">
            Is the repository empty or inaccessible?
          </p>
        </div>
      </div>
    );
  }

  const tree = treeRequestData.tree;

  return (
    <RepoManager
      repo={repo}
      dbRepoId={dbRepo?.id}
      tree={tree}
      initialTasks={tasks}
    />
  );
}
