"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Folder,
  FileCode,
  File,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Plus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  PieChart as PieChartIcon,
  Github,
  Star,
  ExternalLink,
  Code2,
  TextSelect,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchFileContent } from "@/lib/gitdata/actions";
import { Input } from "@/components/ui/input";
import { createTask, updateTaskStatus, deleteTask } from "@/lib/db/actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RepoManagerProps {
  repo: any;
  tree: any[];
  dbRepoId?: string;
  initialTasks?: any[];
}

interface Todo {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  context?: {
    file: string;
    sha: string;
  };
  file_path?: string; // DB field name
  line_start?: number;
  line_end?: number;
}

const TASK_TYPES = [
  "TODO",
  "FIXME",
  "BUG",
  "ALERT",
  "HACK",
  "NOTE",
  "OPTIMIZE",
  "SECURITY",
  "DEPRECATED",
  "REVIEW",
];

const PRIORITIES = ["low", "medium", "high", "critical"];

export default function RepoManager({
  repo,
  tree,
  dbRepoId,
  initialTasks = [],
}: RepoManagerProps) {
  const [fileTree] = useState(() => buildFileTree(tree));
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [showGraph, setShowGraph] = useState(false);

  const [todos, setTodos] = useState<any[]>(initialTasks);
  const [newTodo, setNewTodo] = useState("");
  const [taskType, setTaskType] = useState("TODO");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [isTaskLoading, setIsTaskLoading] = useState(false);

  // Selection state
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const handleFileClick = async (node: FileNode) => {
    if (node.type === "tree") return;
    setSelectedFile(node);
    setShowGraph(false);
    setSelectedRange(null); // Reset selection
    if (node.name.match(/\.(png|jpg|jpeg|gif|ico|svg)$/i)) {
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

  const handleCreateTask = async () => {
    if (!newTodo.trim()) return;
    if (!dbRepoId) {
      toast.error("Repository not synced with database.");
      return;
    }

    setIsTaskLoading(true);
    const context = selectedFile
      ? {
          file: selectedFile.path,
          sha: selectedFile.sha,
          lineStart: selectedRange?.start,
          lineEnd: selectedRange?.end,
        }
      : undefined;

    try {
      const newTask = await createTask(
        dbRepoId,
        newTodo,
        taskType as any,
        taskPriority as any,
        context,
      );
      if (newTask) {
        setTodos([newTask, ...todos]);
        setNewTodo("");
        toast.success("Task added");
        setSelectedRange(null); // Clear selection after adding
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create task");
    } finally {
      setIsTaskLoading(false);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const isCompleted = currentStatus === "completed";
    const newStatus = isCompleted ? "open" : "completed";
    setTodos(todos.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await updateTaskStatus(id, !isCompleted);
    } catch (e) {
      toast.error("Failed to update task");
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, status: currentStatus } : t)),
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    const oldTodos = [...todos];
    setTodos(todos.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
      toast.success("Task deleted");
    } catch (e) {
      toast.error("Failed to delete task");
      setTodos(oldTodos);
    }
  };

  // Selection Handling
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Check if selection is within code block
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer.parentElement;
    const endNode = range.endContainer.parentElement;

    // Find closest line number attributes
    const startLineEl = startNode?.closest("[data-line-number]");
    const endLineEl = endNode?.closest("[data-line-number]");

    if (startLineEl && endLineEl) {
      const start = parseInt(
        startLineEl.getAttribute("data-line-number") || "0",
      );
      const end = parseInt(endLineEl.getAttribute("data-line-number") || "0");

      if (start && end) {
        const low = Math.min(start, end);
        const high = Math.max(start, end);
        setSelectedRange({ start: low, end: high });

        // Auto-populate input with tag format if empty or appending
        const tag = ` [${selectedFile?.name}:${low}-${high}]`;
        // Only append if it's not already there
        if (!newTodo.includes(tag)) {
          // Optional: we can just use the context logic instead of text modification
          // But user asked for "tag (eg reedme.me[13:1-15:4])"
          // Let's rely on badge context display which is cleaner,
          // but we can append to Input if user wants to see it.
          // For now, let's keep it in "SelectedRange" state and show a UI indicator.
        }
      }
    } else {
      // Clicked outside code lines?
      // Keep selection if it was valid? Or clear?
      // User might select, then type. Clearing on mouseup might be annoying if they click input.
      // We only clear if they select text elsewhere that ISN'T code.
    }
  };

  // Scroll to Task Logic
  const handleTaskClick = async (task: Todo) => {
    // If task has file context, open that file
    if (task.file_path && task.file_path !== selectedFile?.path) {
      // Find node in tree? Since tree is flat-ish in FileTree helper but we have 'nodes' prop...
      // We might need to iterate.
      // For simplicity, we just need the 'node' object to call handleFileClick.
      // Since we don't have the node reference easily, checking the path match against loaded tree is complex.
      // BUT, we can try to find it in the flat "tree" prop passed to RepoManager.
      const node = tree.find((n: any) => n.path === task.file_path);
      if (node) {
        const fileNode: FileNode = {
          ...node,
          name: node.path.split("/").pop()!,
          children: [],
        };
        await handleFileClick(fileNode);

        // After loading, scroll to line
        // We need a slight delay or useLayoutEffect to wait for render.
        // Ideally we pass "initialScrollLine" to rendered view.
        if (task.line_start) {
          setTimeout(() => scrollToLine(task.line_start!), 500);
        }
      }
    } else if (task.file_path === selectedFile?.path && task.line_start) {
      scrollToLine(task.line_start);
    }
  };

  const scrollToLine = (line: number) => {
    const el = document.querySelector(`[data-line-number="${line}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight effect
      const highlightClass = "bg-yellow-100/30 dark:bg-yellow-900/40";
      // Find all lines in range if exists
      // For now just highlight start line container
      el.classList.add("bg-yellow-500/20"); // Permanent highlight? Or temporary?
      setTimeout(() => el.classList.remove("bg-yellow-500/20"), 2000);
    }
  };

  // Chart Data
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    TASK_TYPES.forEach((t) => (counts[t] = 0));
    todos.forEach((t) => {
      const type = t.type || "TODO";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      subject: type,
      A: count,
      fullMark: Math.max(...Object.values(counts), 10), // Scaling
    }));
  }, [todos]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background select-none">
      {/* BLACK RECT: Toolbar / Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            title="Toggle File Tree"
          >
            {isLeftSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <Github className="w-4 h-4" />
              {repo.full_name}
            </h1>
            <span className="text-[10px] text-muted-foreground">
              {repo.language} • {repo.default_branch}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showGraph ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowGraph(!showGraph)}
            className="flex items-center gap-2"
          >
            {showGraph ? (
              <Code2 className="w-4 h-4" />
            ) : (
              <PieChartIcon className="w-4 h-4" />
            )}
            {showGraph ? "Code" : "Stats"}
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="ghost" size="icon" title="View on GitHub" asChild>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            title="Toggle Task List"
          >
            {isRightSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: File Tree */}
        {isLeftSidebarOpen && (
          <div className="w-[280px] border-r bg-muted/10 flex flex-col shrink-0">
            <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-4 pt-4">
              Files
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
        )}

        {/* CENTER: Code or Graph */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {!showGraph ? (
            // CODE VIEW
            selectedFile ? (
              <>
                <div className="h-10 border-b flex items-center px-4 justify-between bg-muted/10 shrink-0">
                  <span className="text-sm font-medium flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 text-muted-foreground" />
                    {selectedFile.path}
                    {selectedFile.sha && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono h-5"
                      >
                        {selectedFile.sha.substring(0, 7)}
                      </Badge>
                    )}
                  </span>
                  {selectedRange && (
                    <Badge
                      variant="secondary"
                      className="text-xs animate-in fade-in zoom-in"
                    >
                      Lines {selectedRange.start}-{selectedRange.end} Selected
                    </Badge>
                  )}
                </div>
                <ScrollArea className="flex-1 w-full h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full p-10 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading content...
                    </div>
                  ) : (
                    <div
                      className="p-4 overflow-x-auto max-w-full"
                      onMouseUp={handleSelection} // Capture selection
                      ref={codeContainerRef}
                    >
                      {/* Improved Line Rendering for Selection */}
                      <div className="text-xs code-font tab-4 whitespace-pre select-text min-w-max">
                        {fileContent?.split("\n").map((line, i) => (
                          <div
                            key={i}
                            data-line-number={i + 1}
                            className="hover:bg-muted/50 px-2 -mx-2 rounded-sm border-l-2 border-transparent hover:border-muted-foreground/20"
                          >
                            <span className="inline-block w-8 text-muted-foreground/40 select-none text-right mr-4 text-[10px]">
                              {i + 1}
                            </span>
                            <span>{line || " "}</span>
                            {/* Empty space content to ensure line has height if empty */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              // EMPTY STATE
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="w-32 h-32 rounded-full bg-muted/20 flex items-center justify-center">
                  <PieChartIcon className="w-16 h-16 opacity-20" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-foreground">
                    No File Selected
                  </h3>
                  <p className="text-sm">
                    Select a file to view code or switch to Stats view.
                  </p>
                </div>
                <Button onClick={() => setShowGraph(true)} variant="outline">
                  View Project Stats
                </Button>
              </div>
            )
          ) : (
            // GRAPH VIEW (GREEN RECT)
            <div className="flex-1 flex flex-col">
              <div className="h-10 border-b flex items-center px-4 bg-muted/10 shrink-0">
                <span className="text-sm font-medium">
                  Project Health & Tech Debt
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="w-full max-w-2xl aspect-square max-h-[600px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={chartData}
                    >
                      <PolarGrid stroke="#1f1f1f20" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "currentColor", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, "auto"]}
                        stroke="transparent"
                      />
                      <Radar
                        name="Tasks"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        cursor={{ strokeOpacity: 0.2 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: TASKS (Red Rect) */}
        {isRightSidebarOpen && (
          <div className="w-[400px] border-l bg-muted/10 flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b bg-background flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Refactor Plan
              </h3>
              <Badge variant="secondary" className="text-xs">
                {todos.filter((t) => t.status !== "completed").length} open
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`group flex flex-col gap-2 p-3 rounded-lg border-2 bg-card hover:shadow-md transition-all relative
                      ${
                        todo.priority === "critical"
                          ? "border-red-400 bg-red-50/50 shadow-red-100"
                          : todo.priority === "high"
                            ? "border-orange-300 border-dashed bg-orange-50/30"
                            : todo.type === "BUG"
                              ? "border-red-200 bg-red-50/20"
                              : todo.type === "SECURITY"
                                ? "border-purple-200 bg-purple-50/20"
                                : "border-border"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={todo.status === "completed"}
                        onChange={() => handleToggleTask(todo.id, todo.status)}
                        className="mt-1.5 cursor-pointer"
                      />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleTaskClick(todo)}
                      >
                        <p
                          className={`text-sm font-medium ${
                            todo.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {todo.title}
                        </p>

                        {(todo.file_path || todo.context?.file) && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted p-1 rounded w-fit max-w-full">
                              <FileCode className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {todo.file_path || todo.context?.file}
                              </span>
                            </div>
                            {(todo.line_start || todo.context?.lineStart) && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-0.5 px-1.5 rounded">
                                <TextSelect className="w-3 h-3" />
                                <span>
                                  Lines{" "}
                                  {todo.line_start || todo.context?.lineStart}
                                  {todo.line_end &&
                                  todo.line_end !== todo.line_start
                                    ? `-${todo.line_end}`
                                    : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md text-muted-foreground"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 ml-6">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-5 font-normal
                            ${
                              todo.type === "BUG"
                                ? "border-red-200 text-red-600 bg-red-50"
                                : todo.type === "TODO"
                                  ? "border-blue-200 text-blue-600 bg-blue-50"
                                  : "border-slate-200 text-slate-600 bg-slate-50"
                            }
                        `}
                      >
                        {todo.type}
                      </Badge>
                      {todo.priority && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 font-normal capitalize
                                ${
                                  todo.priority === "high" ||
                                  todo.priority === "critical"
                                    ? "border-orange-200 text-orange-600 bg-orange-50"
                                    : "text-muted-foreground"
                                }
                             `}
                        >
                          {todo.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-sm">
                    No tasks yet. <br /> Use the form below to add one!
                  </div>
                )}

                {/* Spacer for bottom input */}
                <div className="h-10"></div>
              </div>
            </ScrollArea>

            {/* YELLOW RECT: COOLER INPUT AREA */}
            <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              <div className="space-y-3">
                <Input
                  placeholder="What needs to be done?"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                  disabled={!dbRepoId || isTaskLoading}
                  className="text-sm font-medium"
                />

                {selectedRange && (
                  <div className="text-[10px] flex items-center gap-2 text-muted-foreground bg-muted/50 p-1.5 rounded border border-dashed">
                    <TextSelect className="w-3 h-3" />
                    <span>
                      Attaching lines {selectedRange.start}-{selectedRange.end}{" "}
                      to this task
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-auto"
                      onClick={() => setSelectedRange(null)}
                    >
                      <span className="text-xs">×</span>
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select
                    value={taskType}
                    onValueChange={setTaskType}
                    disabled={!dbRepoId}
                  >
                    <SelectTrigger className="h-8 flex-1 text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={taskPriority}
                    onValueChange={setTaskPriority}
                    disabled={!dbRepoId}
                  >
                    <SelectTrigger className="h-8 w-[100px] text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="text-xs capitalize"
                        >
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleCreateTask}
                    disabled={!dbRepoId || isTaskLoading}
                  >
                    {isTaskLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
