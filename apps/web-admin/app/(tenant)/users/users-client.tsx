"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface User {
  id: string;
  tenantId: string;
  authProviderId: string;
  role: 'admin' | 'broker' | 'inspector' | 'individual_seller' | 'public_viewer';
  phoneHash?: string;
  emailHash?: string;
  kycStatus?: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'pending_verification';
  broker?: {
    id: string;
    status: string;
    licenseDocs: {
      businessName: string;
    };
  };
}

type UsersClientProps = {
  initialUsers: User[];
};

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    role: "public_viewer" as User['role'],
    status: "active" as User['status'],
    mfaEnabled: false,
    businessName: ""
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.authProviderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.broker?.licenseDocs.businessName?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => ({
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    broker: users.filter(u => u.role === 'broker').length,
    inspector: users.filter(u => u.role === 'inspector').length,
    individual_seller: users.filter(u => u.role === 'individual_seller').length,
    public_viewer: users.filter(u => u.role === 'public_viewer').length,
  }), [users]);

  const statusCounts = useMemo(() => ({
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending_verification: users.filter(u => u.status === 'pending_verification').length,
  }), [users]);

  const handleAddUser = () => {
    if (!newUserForm.email) {
      alert("Please enter an email address");
      return;
    }

    if (users.some(u => u.authProviderId === newUserForm.email)) {
      alert("User with this email already exists");
      return;
    }

    alert(`User creation would be handled via API. Email: ${newUserForm.email}`);
    setShowAddUserModal(false);
    setNewUserForm({
      email: "",
      role: "public_viewer",
      status: "active",
      mfaEnabled: false,
      businessName: ""
    });
  };

  const resetForm = () => {
    setNewUserForm({
      email: "",
      role: "public_viewer",
      status: "active", 
      mfaEnabled: false,
      businessName: ""
    });
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">
                Manage user accounts, roles, and platform access
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                onClick={() => alert("Export functionality would download CSV/Excel file")}
              >
                Export Users
              </button>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                onClick={() => setShowAddUserModal(true)}
              >
                + Add User
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Users</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{statusCounts.active}</p>
                <p className="text-sm text-gray-600 mt-1">Active Users</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{roleCounts.broker}</p>
                <p className="text-sm text-gray-600 mt-1">Brokers</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(u => u.mfaEnabled).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">MFA Enabled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by email or business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="broker">Broker</option>
                  <option value="inspector">Inspector</option>
                  <option value="individual_seller">Individual Seller</option>
                  <option value="public_viewer">Public Viewer</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending_verification">Pending Verification</option>
                </select>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''} Found
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No users found matching your criteria.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Role *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as User['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="public_viewer">Public Viewer</option>
                    <option value="individual_seller">Individual Seller</option>
                    <option value="broker">Broker</option>
                    <option value="inspector">Inspector</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {newUserForm.role === 'broker' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={newUserForm.businessName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter business name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as User['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mfaEnabled"
                    checked={newUserForm.mfaEnabled}
                    onChange={(e) => setNewUserForm({ ...newUserForm, mfaEnabled: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mfaEnabled" className="ml-2 block text-sm text-gray-700">
                    Enable Multi-Factor Authentication
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const roleColors = {
    admin: "bg-red-100 text-red-800",
    broker: "bg-blue-100 text-blue-800",
    inspector: "bg-green-100 text-green-800",
    individual_seller: "bg-purple-100 text-purple-800",
    public_viewer: "bg-gray-100 text-gray-800"
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    pending_verification: "bg-yellow-100 text-yellow-800"
  };

  const roleIcons = {
    admin: "👨‍💼",
    broker: "🏢",
    inspector: "🔍",
    individual_seller: "👤",
    public_viewer: "👁️"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleToggleStatus = () => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    alert(`User status would be changed to: ${newStatus} via API`);
  };

  const handleToggleMFA = () => {
    const newMFA = !user.mfaEnabled;
    alert(`MFA would be ${newMFA ? 'enabled' : 'disabled'} for this user via API`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">{roleIcons[user.role]}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {user.broker?.licenseDocs.businessName || user.authProviderId}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                  {user.role.toUpperCase().replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[user.status]}`}>
                  {user.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <span>📧 {user.authProviderId}</span>
                {user.phoneHash && <span>📱 Phone verified</span>}
                <span>📅 Joined {formatDate(user.createdAt)}</span>
                {user.lastLogin && (
                  <span>👤 Last login {formatDate(user.lastLogin)}</span>
                )}
              </div>

              <div className="mt-2 flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${user.kycStatus === 'verified' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  <span className="text-gray-600">KYC: {user.kycStatus || 'Not set'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${user.mfaEnabled ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className="text-gray-600">MFA: {user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                {user.broker && (
                  <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${user.broker.status === 'approved' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                    <span className="text-gray-600">Broker: {user.broker.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleMFA}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              user.mfaEnabled
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              user.status === 'active'
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <Link
            href={`/users/${user.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

