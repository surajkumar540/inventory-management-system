import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { getBranches } from "../../api/branches";
import useAuthStore from "../../stores/useAuthStore";

const ROLES_BY_CALLER = {
  SUPER_ADMIN:  ["ADMIN", "BRANCH_ADMIN", "STAFF"],
  ADMIN:        ["BRANCH_ADMIN", "STAFF"],
  BRANCH_ADMIN: ["STAFF"],
};

const EMPTY = { name: "", email: "", password: "", role: "STAFF", branchId: "" };

const ROLE_COLORS = {
  SUPER_ADMIN:  "bg-purple-100 text-purple-700",
  ADMIN:        "bg-blue-100 text-blue-700",
  BRANCH_ADMIN: "bg-amber-100 text-amber-700",
  STAFF:        "bg-gray-100 text-gray-600",
};

export default function UsersTab() {
  const { user: me } = useAuthStore();
  const ROLES = ROLES_BY_CALLER[me?.role] || ["STAFF"];

  const qc = useQueryClient();
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError]     = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers().then((r) => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches().then((r) => r.data.data),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, branchId: form.branchId || null };
      if (editing) {
        const { password, email, ...rest } = payload;
        return updateUser(editing, rest);
      }
      return createUser(payload);
    },
    onSuccess: () => { qc.invalidateQueries(["users"]); closeModal(); },
    onError: (err) => setError(err?.response?.data?.message || "Something went wrong"),
  });

  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries(["users"]),
  });

  const openCreate = () => {
    setForm({ ...EMPTY, role: ROLES[0] });
    setEditing(null);
    setError("");
    setModal(true);
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, branchId: u.branch?.id || "" });
    setEditing(u.id);
    setError("");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY);
    setError("");
  };

  const handleSave = () => {
    setError("");
    if (!form.name.trim())               return setError("Name is required");
    if (!editing && !form.email.trim())  return setError("Email is required");
    if (!editing && !form.password.trim()) return setError("Password is required");
    if (!form.role)                      return setError("Role is required");
    save.mutate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{users?.length || 0} users</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Branch</th>
              <th className="pb-2 font-medium">Verified</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{u.name}</td>
                <td className="py-3 text-gray-500">{u.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ""}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 text-gray-600">{u.branch?.name || "—"}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                    {u.isVerified ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-blue-500 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove.mutate(u.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit User" : "Add User"}
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name <span className="text-red-400">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editing && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email <span className="text-red-400">*</span></label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Password <span className="text-red-400">*</span></label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role <span className="text-red-400">*</span></label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {me?.role !== "BRANCH_ADMIN" && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Branch</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— No branch —</option>
                    {branches?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-3">{error}</p>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={save.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {save.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}