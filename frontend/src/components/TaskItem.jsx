import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  Calendar,
  Flag,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  User,
  Archive,
} from "lucide-react";

const TaskItem = ({ task, onEdit, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          text: "Completed",
        };
      case "in-progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Clock className="h-4 w-4 text-blue-600" />,
          text: "In Progress",
        };
      default:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          text: "Pending",
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return {
          color: "text-red-500",
          icon: <Flag className="h-4 w-4 text-red-500 fill-red-500" />,
          text: "High Priority",
        };
      case "medium":
        return {
          color: "text-yellow-500",
          icon: <Flag className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
          text: "Medium Priority",
        };
      default:
        return {
          color: "text-green-500",
          icon: <Flag className="h-4 w-4 text-green-500 fill-green-500" />,
          text: "Low Priority",
        };
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await onUpdate(task._id, { status: newStatus });
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(task._id);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(task._id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";
  const isDueSoon =
    task.dueDate &&
    !isOverdue &&
    new Date(task.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) &&
    task.status !== "completed";

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="p-6 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 group">
      <div className="flex items-start justify-between">
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Title and Badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${statusConfig.color} border`}>
                {statusConfig.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-lg font-semibold truncate ${
                    task.status === "completed"
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} border`}
                  >
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.text}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {priorityConfig.icon}
                    <span className="ml-1 capitalize">
                      {task.priority} Priority
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {/* Priority */}
            <div className="flex items-center gap-1.5">
              {priorityConfig.icon}
              <span className="capitalize font-medium">{task.priority}</span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-1.5 ${
                  isOverdue
                    ? "text-red-600 font-semibold"
                    : isDueSoon
                    ? "text-orange-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    Overdue
                  </span>
                )}
                {isDueSoon && !isOverdue && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                    Due Soon
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-xs text-gray-400 px-1">
                      +{task.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-xs">
                Created {formatDate(task.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus:opacity-100"
            disabled={isDeleting || isUpdating}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  {/* Status Section */}
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Change Status
                    </div>
                    {[
                      {
                        value: "pending",
                        label: "Mark as Pending",
                        icon: AlertCircle,
                      },
                      {
                        value: "in-progress",
                        label: "Mark as In Progress",
                        icon: Clock,
                      },
                      {
                        value: "completed",
                        label: "Mark as Completed",
                        icon: CheckCircle,
                      },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleStatusChange(value)}
                        disabled={isUpdating || task.status === value}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                        {task.status === value && (
                          <span className="ml-auto text-xs text-green-600 font-medium">
                            Current
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Actions Section */}
                  <div>
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Task
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete Task"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {/* Status Quick Actions */}
        <div className="flex flex-wrap gap-2 flex-1">
          {task.status !== "pending" && (
            <button
              onClick={() => handleStatusChange("pending")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <AlertCircle className="h-3 w-3" />
              {isUpdating ? "Updating..." : "Mark Pending"}
            </button>
          )}
          {task.status !== "in-progress" && (
            <button
              onClick={() => handleStatusChange("in-progress")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Clock className="h-3 w-3" />
              {isUpdating ? "Updating..." : "In Progress"}
            </button>
          )}
          {task.status !== "completed" && (
            <button
              onClick={() => handleStatusChange("completed")}
              disabled={isUpdating}
              className="btn btn-primary text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle className="h-3 w-3" />
              {isUpdating ? "Updating..." : "Complete"}
            </button>
          )}
        </div>

        {/* Delete Quick Action */}
        <button
          onClick={handleQuickDelete}
          disabled={isDeleting}
          className="btn btn-danger text-xs flex items-center gap-1 disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Loading Overlay */}
      {(isDeleting || isUpdating) && (
        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            {isDeleting ? "Deleting task..." : "Updating task..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
