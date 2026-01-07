"use client";

import React, { useState, useMemo } from "react";
import {
  Folder,
  FileCode,
  File,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Plus,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchFileContent } from "@/lib/gitdata/actions";
import { Input } from "@/components/ui/input";

interface RepoManagerProps {
  repo: any;
  tree: any[];
}

interface FileNode {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
  children?: FileNode[];
  name: string;
}

// Helper to build tree from flat paths
function buildTree(items: any[]): FileNode[] {
  const root: FileNode[] = [];
  const map: Record<string, FileNode[]> = {};

  // Sort items so folders come first (optional but good UI)
  const sorted = [...items].sort((a, b) => {
    if (a.type === b.type) return a.path.localeCompare(b.path);
    return a.type === "tree" ? -1 : 1;
  });

  items.forEach((item) => {
    const parts = item.path.split("/");
    const name = parts.pop(); // filename
    const dirPath = parts.join("/"); // parent path

    const node: FileNode = { ...item, name, children: [] };

    if (!dirPath) {
      root.push(node);
    } else {
      // Find parent or create placeholder if needed (though recursive tree usually gives all)
      // Actually, building a real object tree from flat path list is best done recursively or with a map
      // For simplicity in this 'flat list' from git, we can just filter by logic or basic nesting.
      // Simpler approach for flat Git tree data:
      // The Git API returns ALL files. We can just list them and use indentation or build a proper tree.
      // Let's build a proper tree map.
    }
  });

  return root; // This naive implementation is incomplete.
}

// Better Tree Builder
function buildFileTree(items: any[]) {
  const root: FileNode[] = [];
  const cache: Record<string, FileNode> = {};

  items.forEach((item) => {
    const node: FileNode = {
      ...item,
      name: item.path.split("/").pop(),
      children: [],
    };
    cache[item.path] = node;
  });

  items.forEach((item) => {
    const parts = item.path.split("/");
    const name = parts.pop();
    const parentPath = parts.join("/");

    if (parentPath === "") {
      root.push(cache[item.path]);
    } else {
      if (cache[parentPath]) {
        cache[parentPath].children?.push(cache[item.path]);
      } else {
        // Parent folder listed after child or missing?
        // Git recursive tree should contain the tree objects too.
      }
    }
  });

  // Sort
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "tree" ? -1 : 1;
    });
    nodes.forEach((n) => n.children && sortNodes(n.children));
  };

  sortNodes(root);
  return root;
}

interface Todo {
  id: number;
  text: string;
  type: string;
  completed: boolean;
  context?: {
    file: string;
    sha: string;
  };
}

export default function RepoManager({ repo, tree }: RepoManagerProps) {
  const [fileTree, setFileTree] = useState(() => buildFileTree(tree));
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Repo Todos mock state
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Fix authentication bug", type: "BUG", completed: false },
    {
      id: 2,
      text: "Refactor file tree component",
      type: "TODO",
      completed: true,
    },
    { id: 3, text: "Add test cases for API", type: "TEST", completed: false },
  ]);

  const [newTodo, setNewTodo] = useState("");

  const handleFileClick = async (node: FileNode) => {
    if (node.type === "tree") {
      // Toggle expand/collapse logic would go here if we had local state for it
      // For now, we'll assume the TreeView handles its own expansion state
      return;
    }

    setSelectedFile(node);

    // Check if it's a displayable text file
    if (node.name.match(/\.(png|jpg|jpeg|gif|ico)$/)) {
      setFileContent("Image preview not supported yet.");
      return;
    }

    setIsLoading(true);
    setFileContent(null);
    try {
      const content = await fetchFileContent(node.url);
      setFileContent(content);
    } catch (e) {
      setFileContent("Failed to load content.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;

    // Auto-detect link if a file is selected
    const context = selectedFile
      ? {
          file: selectedFile.path,
          sha: selectedFile.sha,
        }
      : undefined;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        type: "TODO",
        completed: false,
        context, // Add context to todo
      },
    ]);
    setNewTodo("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden border-t">
      {/* LEFT SIDEBAR: FILES */}
      <div className="w-[300px] border-r bg-muted/10 flex flex-col">
        <div className="p-3 border-b bg-background">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Folder className="w-4 h-4" />
            {repo.name}
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <FileTree
              nodes={fileTree}
              onFileClick={handleFileClick}
              selectedPath={selectedFile?.path}
            />
          </div>
        </ScrollArea>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {selectedFile ? (
          <>
            <div className="h-10 border-b flex items-center px-4 justify-between bg-muted/10">
              <span className="text-sm font-medium flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                {selectedFile.path}
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedFile.sha.substring(0, 7)}
              </Badge>
            </div>
            <ScrollArea className="flex-1 w-full h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full p-10 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                </div>
              ) : (
                <pre className="p-4 text-xs font-mono tab-4 overflow-auto">
                  <code>{fileContent}</code>
                </pre>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileCode className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Select a file to view content</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: TODOS */}
      <div className="w-[350px] border-l bg-muted/10 flex flex-col">
        <div className="p-3 border-b bg-background flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Refactor Plan
          </h3>
          <Badge variant="secondary" className="text-xs">
            {todos.filter((t) => !t.completed).length} open
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-start gap-2 p-3 rounded-lg border bg-card hover:shadow-sm transition-all"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {
                    const newTodos = todos.map((t) =>
                      t.id === todo.id ? { ...t, completed: !t.completed } : t
                    );
                    setTodos(newTodos);
                  }}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.text}
                  </p>
                  {todo.context && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground bg-muted p-1 rounded w-fit max-w-full">
                      <FileCode className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{todo.context.file}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        todo.type === "BUG"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                          : todo.type === "TODO"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      {todo.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Add new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8 w-8 p-0" onClick={addTodo}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Recursive File Tree Item
function FileTree({
  nodes,
  onFileClick,
  selectedPath,
}: {
  nodes: FileNode[];
  onFileClick: (n: FileNode) => void;
  selectedPath?: string;
}) {
  if (!nodes) return null;
  return (
    <ul className="pl-1">
      {nodes.map((node, i) => (
        <TreeItem
          key={node.path + i}
          node={node}
          onFileClick={onFileClick}
          selectedPath={selectedPath}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  onFileClick,
  selectedPath,
}: {
  node: FileNode;
  onFileClick: (n: FileNode) => void;
  selectedPath?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "tree";
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileClick(node);
    }
  };

  return (
    <li>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer text-sm select-none transition-colors ${
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
        } ${isFolder ? "font-medium" : "text-muted-foreground"}`}
        onClick={handleClick}
      >
        <span className="opacity-50">
          {isFolder ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : (
            <File className="w-3.5 h-3.5" />
          )}
        </span>
        {isFolder && (
          <Folder
            className={`w-3.5 h-3.5 ${
              isOpen ? "text-blue-500" : "text-blue-400"
            }`}
          />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div className="pl-3 border-l ml-2.5 border-muted">
          <FileTree
            nodes={node.children || []}
            onFileClick={onFileClick}
            selectedPath={selectedPath}
          />
        </div>
      )}
    </li>
  );
}
