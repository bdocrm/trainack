'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', displayName: '', role: 'user' });

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', password: '', displayName: '', role: 'user' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', displayName: user.displayName, role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Update
      const body: Record<string, string> = {};
      if (form.username !== editingUser.username) body.username = form.username;
      if (form.displayName !== editingUser.displayName) body.displayName = form.displayName;
      if (form.role !== editingUser.role) body.role = form.role;
      if (form.password) body.password = form.password;

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('User updated');
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update user');
      }
    } else {
      // Create
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('User created');
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create user');
      }
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.displayName}"?`)) return;

    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('User deleted');
      fetchUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to delete user');
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#160D76] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] font-[Sora]">User Management</h2>
          <p className="text-sm text-[#64748B]">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#160D76] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1E1199] transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#160D76] to-[#4094d9] flex items-center justify-center text-white text-sm font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A]">{user.displayName}</p>
                      <p className="text-xs text-[#94A3B8]">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleStatus(user)}
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {user.status}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 text-[#94A3B8] hover:text-[#160D76] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0F172A] font-[Sora]">
                {editingUser ? 'Edit User' : 'Create User'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Display Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]/20 focus:border-[#160D76]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]/20 focus:border-[#160D76]"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  Password {editingUser && <span className="text-[#94A3B8] font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]/20 focus:border-[#160D76]"
                  placeholder={editingUser ? '••••••••' : 'Enter password'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]/20 focus:border-[#160D76] bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#E2E8F0] text-[#64748B] py-2.5 rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#160D76] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1E1199] transition-colors"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
