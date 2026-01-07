export async function getRepoById(token: string, id: string) {
  const res = await fetch(`https://api.github.com/repositories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repo: ${res.statusText}`);
  }

  return res.json();
}

export async function getRepoContents(
  token: string,
  fullName: string,
  path: string = ""
) {
  // GitHub API for contents: /repos/{owner}/{repo}/contents/{path}
  const url = `https://api.github.com/repos/${fullName}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch contents: ${res.statusText}`);
  }

  return res.json();
}

export async function getFileContent(token: string, url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch file content: ${res.statusText}`);
  }

  // The content might be base64 returned by the contents API,
  // or raw if we use the download_url which is better for reading.
  // The 'url' passed here should ideally be the 'download_url' or we handle the blob.
  // For 'contents' API, github returns { content: "base64...", encoding: "base64" }
  // If we fetch the blob url, we get raw text.
  // Let's assume this helper expects the 'url' from the tree structure which might be the blob API or raw.
  // Safe approach: generic fetch, caller handles parsing if json or text.

  return res.text();
}

export async function getRepoTree(
  token: string,
  fullName: string,
  branch: string
) {
  // https://api.github.com/repos/OWNER/REPO/git/trees/SHA?recursive=1
  // We can often pass the branch name as the SHA/ref
  const url = `https://api.github.com/repos/${fullName}/git/trees/${branch}?recursive=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tree: ${res.statusText}`);
  }

  return res.json();
}
