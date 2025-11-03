"use client";

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

type TaskStatus = "completed" | "pending" | "urgent";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
}

interface TasksListProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
}

export function TasksList({ tasks, onTaskComplete }: TasksListProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    urgent: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No pending tasks. You're all caught up! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const config = statusConfig[task.status];
        const Icon = config.icon;

        return (
          <div
            key={task.id}
            className={`flex items-start gap-4 rounded-xl border ${config.bg} p-4`}
          >
            <Icon className={`mt-0.5 w-5 h-5 flex-shrink-0 ${config.color}`} />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{task.title}</p>
              {task.description && (
                <p className="mt-1 text-xs text-slate-600">{task.description}</p>
              )}
              {task.dueDate && (
                <p className="mt-1 text-xs text-slate-500">Due: {task.dueDate}</p>
              )}
            </div>
            {task.status !== "completed" && onTaskComplete && (
              <button
                onClick={() => onTaskComplete(task.id)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Mark done
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

