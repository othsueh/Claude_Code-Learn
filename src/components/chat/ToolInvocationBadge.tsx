"use client";

import {
  FilePlus,
  FileEdit,
  Trash2,
  Move,
  Eye,
  Loader2,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    state: "partial-call" | "call" | "result";
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result?: any;
  };
  className?: string;
}

type IconType = typeof FilePlus;

interface FormattedInvocation {
  message: string;
  icon: IconType;
}

function getFilename(path: string): string {
  if (!path) return "Unknown file";
  return path.split(/[\\/]/).pop() || "Unknown file";
}

function formatToolInvocation(
  toolName: string,
  args: Record<string, any>
): FormattedInvocation {
  const command = args.command as string | undefined;
  const path = args.path as string | undefined;
  const newPath = args.new_path as string | undefined;

  // Handle str_replace_editor tool
  if (toolName === "str_replace_editor") {
    const filename = getFilename(path);

    switch (command) {
      case "create":
        return {
          message: `Created ${filename}`,
          icon: FilePlus,
        };
      case "str_replace":
      case "insert":
        return {
          message: `Updated ${filename}`,
          icon: FileEdit,
        };
      case "view":
        return {
          message: `Viewing ${filename}`,
          icon: Eye,
        };
      case "undo_edit":
        return {
          message: `Reverted ${filename}`,
          icon: FileEdit,
        };
      default:
        return {
          message: `Edited ${filename}`,
          icon: FileEdit,
        };
    }
  }

  // Handle file_manager tool
  if (toolName === "file_manager") {
    const filename = getFilename(path);
    const newFilename = getFilename(newPath);

    switch (command) {
      case "delete":
        return {
          message: `Deleted ${filename}`,
          icon: Trash2,
        };
      case "rename":
        if (!newPath) {
          return {
            message: `Renamed ${filename}`,
            icon: Move,
          };
        }
        return {
          message: `Renamed ${filename} to ${newFilename}`,
          icon: Move,
        };
      default:
        return {
          message: `Modified ${filename}`,
          icon: Settings,
        };
    }
  }

  // Fallback for unknown tools
  return {
    message: toolName,
    icon: Settings,
  };
}

export function ToolInvocationBadge({
  toolInvocation,
  className,
}: ToolInvocationBadgeProps) {
  const isInProgress =
    toolInvocation.state === "partial-call" || toolInvocation.state === "call";

  const { message, icon: IconComponent } = formatToolInvocation(
    toolInvocation.toolName,
    toolInvocation.args
  );

  const fullPath = toolInvocation.args.path || "";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border",
        isInProgress
          ? "border-blue-200 text-blue-700"
          : "border-neutral-200 text-neutral-700",
        className
      )}
      title={fullPath}
      role={isInProgress ? "status" : undefined}
      aria-label={
        isInProgress
          ? `In progress: ${message}`
          : `Completed: ${message}`
      }
    >
      {isInProgress ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      ) : (
        <IconComponent className="w-3 h-3 text-emerald-600 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
