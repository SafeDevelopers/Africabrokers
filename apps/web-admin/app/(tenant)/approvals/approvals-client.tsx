"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Mail, UserX, Trash2, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";

interface ApprovalUser {
  id: string;
  email: string;
  role: "BROKER" | "TENANT_ADMIN" | "SUPER_ADMIN";
  enabled: boolean;
  emailVerified: boolean;
  createdAt?: string;
}

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export function ApprovalsClient() {
  const [users, setUsers] = useState<ApprovalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Show toast and hide after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mock data for now - in production, this would fetch from an API
  useEffect(() => {
    // TODO: Replace with actual API call to fetch users pending approval
    // For now, using empty array - users would be fetched from Keycloak or database
    setUsers([]);
    setLoading(false);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const handleApproveInvite = async (user: ApprovalUser, role: "broker" | "tenant-admin") => {
    setActionLoading(`approve-${user.id}`);
    try {
      let result;
      if (role === "broker") {
        result = await apiClient.inviteBroker(user.email);
      } else {
        result = await apiClient.inviteTenantAdmin(user.email);
      }
      showToast("success", result.message || `${role === "broker" ? "Broker" : "Tenant admin"} invitation sent successfully`);
      // Remove user from list after successful invite
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : `Failed to invite ${role}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisable = async (user: ApprovalUser) => {
    setActionLoading(`disable-${user.id}`);
    try {
      const result = await apiClient.toggleUserEnabled(user.id);
      showToast("success", result.message || `User ${result.enabled ? "enabled" : "disabled"} successfully`);
      // Update user in list
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, enabled: result.enabled } : u))
      );
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to toggle user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReinvite = async (user: ApprovalUser) => {
    setActionLoading(`reinvite-${user.id}`);
    try {
      const result = await apiClient.requestPasswordReset(user.email);
      showToast("success", result.message || "Re-invitation email sent successfully");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to send re-invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: ApprovalUser) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`delete-${user.id}`);
    try {
      const result = await apiClient.deleteUser(user.id);
      showToast("success", result.message || "User deleted successfully");
      // Remove user from list
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
          <p className="mt-2 text-gray-600">
            Manage user approvals and invitations
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending approvals</p>
            <p className="text-sm text-gray-500 mt-2">
              Users awaiting approval will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.enabled ? "Enabled" : "Disabled"}
                      </span>
                      {!user.emailVerified && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* Approve → Invite actions */}
                        {user.role === "BROKER" && (
                          <button
                            onClick={() => handleApproveInvite(user, "broker")}
                            disabled={actionLoading === `approve-${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve & Invite Broker"
                          >
                            {actionLoading === `approve-${user.id}` ? (
                              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Approve→Invite
                          </button>
                        )}
                        {user.role === "TENANT_ADMIN" && (
                          <button
                            onClick={() => handleApproveInvite(user, "tenant-admin")}
                            disabled={actionLoading === `approve-${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve & Invite Tenant Admin"
                          >
                            {actionLoading === `approve-${user.id}` ? (
                              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Approve→Invite
                          </button>
                        )}

                        {/* Disable */}
                        <button
                          onClick={() => handleDisable(user)}
                          disabled={actionLoading === `disable-${user.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.enabled ? "Disable User" : "Enable User"}
                        >
                          {actionLoading === `disable-${user.id}` ? (
                            <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {user.enabled ? "Disable" : "Enable"}
                        </button>

                        {/* Re-invite */}
                        <button
                          onClick={() => handleReinvite(user)}
                          disabled={actionLoading === `reinvite-${user.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Re-invite User"
                        >
                          {actionLoading === `reinvite-${user.id}` ? (
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Re-invite
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading === `delete-${user.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          {actionLoading === `delete-${user.id}` ? (
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

