"use server";

import { createClient } from "@/lib/supabase/server";
import { getFileContent } from "./functions";

export async function fetchFileContent(url: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.provider_token) {
    throw new Error("Unauthorized");
  }

  // url here should be the 'url' provided by the tree API for the blob,
  // BUT the tree API returns a blob URL "https://api.github.com/repos/.../git/blobs/SHA"
  // which returns json { content: "base64", encoding: "base64" }.
  // The 'raw' content is often easier from the raw.githubusercontent.com if public,
  // or via the 'media type' header on the blob API.
  // Let's use the blob API and decode base64.

  // Note: getFileContent in functions.ts is a simple fetch.
  // We need to handle the specific blob response here.

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github.raw+json",
      // Using raw+json to just get the raw data directly if possible,
      // or standard json and decode.
      // GitHub API for blobs generally returns JSON with base64 without the raw header.
      // But let's try raw media type.
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch file content");
  }

  // If we used application/vnd.github.raw+json, we get the raw content text directly.
  return res.text();
}
