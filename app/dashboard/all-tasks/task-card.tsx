"use client";

import Link from "next/link";
import { updateTaskStatus, deleteTask, toggleTaskStar } from "@/lib/db/actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: any;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(task.status === "completed");
  const [isStarred, setIsStarred] = useState(task.is_starred || false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);

    startTransition(async () => {
      try {
        await updateTaskStatus(task.id, newStatus);
        toast.success(newStatus ? "Task completed! 🌸" : "Task reopened");
        router.refresh();
      } catch (e) {
        setIsCompleted(!newStatus);
        toast.error("Failed to update task");
      }
    });
  };

  const handleStar = () => {
    setIsStarred(!isStarred);

    startTransition(async () => {
      try {
        await toggleTaskStar(task.id);
        toast.success(isStarred ? "Unpinned task" : "Task pinned! ⭐");
        router.refresh();
      } catch (e) {
        setIsStarred(isStarred);
        toast.error("Failed to update task");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this task?")) return;

    setIsDeleted(true);
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        toast.success("Task deleted");
        router.refresh();
      } catch (e) {
        setIsDeleted(false);
        toast.error("Failed to delete task");
      }
    });
  };

  if (isDeleted) return null;

  // Priority-based card styling
  const getCardBorderClass = () => {
    if (task.priority === "critical") {
      return "border-2 border-red-400 bg-gradient-to-r from-red-50/50 to-white shadow-red-100";
    }
    if (task.priority === "high") {
      return "border-2 border-orange-300 border-dashed bg-gradient-to-r from-orange-50/30 to-white";
    }
    if (task.type === "BUG") {
      return "border-l-4 border-l-red-400";
    }
    if (task.type === "SECURITY") {
      return "border-l-4 border-l-purple-400";
    }
    if (task.type === "ALERT") {
      return "border-l-4 border-l-amber-400";
    }
    return "";
  };

  return (
    <div
      className={`organic-card p-4 transition-all duration-300 group ${getCardBorderClass()} ${
        isCompleted ? "opacity-60" : ""
      } ${isPending ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 shrink-0 ${
            isCompleted
              ? "bg-[var(--organic-sage)] border-[var(--organic-sage)]"
              : "border-[var(--organic-sage)] hover:border-[var(--organic-forest)]"
          }`}
        >
          {isCompleted && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p
              className={`text-sm font-medium text-[var(--organic-forest)] flex-1 ${
                isCompleted ? "line-through text-[var(--organic-earth)]" : ""
              }`}
            >
              {task.title}
            </p>

            {/* Star/Pin Button */}
            <button
              onClick={handleStar}
              disabled={isPending}
              className={`p-1 rounded transition-all ${
                isStarred
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-[var(--organic-sage)] hover:text-amber-500 opacity-0 group-hover:opacity-100"
              }`}
              title={isStarred ? "Unpin task" : "Pin task"}
            >
              <svg
                className="w-4 h-4"
                fill={isStarred ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>

          {/* Repository Link */}
          {task.repositories && (
            <Link
              href={`/dashboard/repos/${task.repositories.id}`}
              className="text-[10px] text-[var(--organic-sage)] hover:text-[var(--organic-terracotta)] mt-1 inline-flex items-center gap-1 transition-colors"
            >
              <span>🌿</span>
              {task.repositories.name}
            </Link>
          )}

          {/* File Path */}
          {task.file_path && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--organic-sage)]/10 text-[var(--organic-earth)] max-w-full truncate code-font">
                📄 {task.file_path}
                {task.line_start && `:${task.line_start}`}
                {task.line_end &&
                  task.line_end !== task.line_start &&
                  `-${task.line_end}`}
              </span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeStyles(task.type)}`}
            >
              {getTypeIcon(task.type)} {task.type}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityStyles(task.priority)}`}
            >
              {getPriorityIcon(task.priority)} {task.priority}
            </span>
          </div>

          {/* Timestamp */}
          <p className="text-[9px] text-[var(--organic-sage)] mt-2">
            Created {formatTimeAgo(task.created_at)}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg text-[var(--organic-earth)] transition-all"
          title="Delete task"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getTypeIcon(type: string): string {
  switch (type) {
    case "BUG":
      return "🐛";
    case "FIXME":
      return "🔧";
    case "SECURITY":
      return "🔒";
    case "OPTIMIZE":
      return "⚡";
    case "HACK":
      return "💡";
    case "DEPRECATED":
      return "🗑️";
    case "REVIEW":
      return "👀";
    case "NOTE":
      return "📝";
    case "ALERT":
      return "⚠️";
    case "TODO":
      return "📋";
    default:
      return "📋";
  }
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case "critical":
      return "🚨";
    case "high":
      return "🔥";
    case "medium":
      return "🌿";
    default:
      return "🌱";
  }
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

function getPriorityStyles(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-red-700 bg-red-100 border-red-300 font-semibold";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium":
      return "text-[var(--organic-earth)] bg-[var(--organic-sage)]/10 border-[var(--organic-sage)]/20";
    default:
      return "text-gray-500 bg-gray-50 border-gray-200";
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
