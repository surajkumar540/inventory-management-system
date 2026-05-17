import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { getBranches } from "../../api/branches";
import useAuthStore from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  X,
  Check,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";

const ROLES_BY_CALLER = {
  SUPER_ADMIN: ["ADMIN", "BRANCH_ADMIN", "STAFF"],
  ADMIN: ["BRANCH_ADMIN", "STAFF"],
  BRANCH_ADMIN: ["STAFF"],
};

const EMPTY = { name: "", email: "", password: "", role: "STAFF", branchId: "" };

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: "Super Admin", cls: "bg-purple-50 text-purple-700 border-purple-100" },
  ADMIN:       { label: "Admin",       cls: "bg-blue-50 text-blue-700 border-blue-100" },
  BRANCH_ADMIN:{ label: "Branch Admin",cls: "bg-amber-50 text-amber-700 border-amber-100" },
  STAFF:       { label: "Staff",       cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.STAFF;
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

/* ── Avatar ── */
const Avatar = ({ name }) => {
  const initials = name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  const colors = [
    "from-violet-400 to-purple-500",
    "from-blue-400 to-indigo-500",
    "from-teal-400 to-emerald-500",
    "from-rose-400 to-pink-500",
    "from-amber-400 to-orange-500",
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0`}>
      {initials}
    </div>
  );
};

/* ── User Modal ── */
const UserModal = ({ editing, form, setForm, onSave, onClose, isPending, error, roles, branches, myRole }) => {
  const [showPw, setShowPw] = useState(false);

  const inputClass =
    "w-full h-11 px-3.5 text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all placeholder:text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Users size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800">
                {editing ? "Edit User" : "Add User"}
              </p>
              <p className="text-[11px] text-slate-400">
                {editing ? "Update user details" : "Create a new team member"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Full Name <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Riya Sharma"
              className={inputClass}
            />
          </div>

          {!editing && (
            <>
              <div>
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Email <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@company.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Password <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Role */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Role <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={`${inputClass} cursor-pointer`}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_CONFIG[r]?.label || r}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          {myRole !== "BRANCH_ADMIN" && (
            <div>
              <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Branch
              </label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">— No branch —</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl"
              >
                <ShieldAlert size={13} className="text-red-500 shrink-0" />
                <p className="text-[12px] font-semibold text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50/60 border-t border-slate-100">
          <button
            onClick={onClose}
            className="h-10 px-5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isPending}
            className="flex items-center gap-2 h-10 px-6 text-[13px] font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl shadow-md shadow-violet-200/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isPending ? "Saving…" : editing ? "Save Changes" : "Add User"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main ── */
export default function UsersTab() {
  const { user: me } = useAuthStore();
  const navigate = useNavigate();
  const ROLES = ROLES_BY_CALLER[me?.role] || ["STAFF"];
  const isReadOnly = me?.role === "STAFF";

  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers().then((r) => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches().then((r) => r.data.data),
    enabled: me?.role !== "STAFF",
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
    onSettled: () => setDeletingId(null),
  });

  const openCreate = () => { setForm({ ...EMPTY, role: ROLES[0] }); setEditing(null); setError(""); setModal(true); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, branchId: u.branch?.id || "" });
    setEditing(u.id);
    setError("");
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = () => {
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!editing && !form.email.trim()) return setError("Email is required");
    if (!editing && !form.password.trim()) return setError("Password is required");
    if (!form.role) return setError("Role is required");
    save.mutate();
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    remove.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-slate-500">
          {isLoading ? "—" : users?.length ?? 0} user{(users?.length ?? 0) !== 1 ? "s" : ""}
        </p>
        {!isReadOnly && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-9 px-4 text-[12px] font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl shadow-sm shadow-violet-200/60 transition-all"
          >
            <Plus size={13} />
            Add User
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
            <p className="text-[12px] font-medium text-slate-400">Loading users…</p>
          </div>
        ) : !users?.length ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <Users size={20} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">No users yet</p>
            <p className="text-[11px] text-slate-300 mt-1">Add your first team member</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {["User", "Email", "Role", "Branch", "Verified", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest py-3 px-4 ${i === 0 ? "pl-6" : ""} ${i === 5 ? "text-right pr-6" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* User */}
                      <td className="py-3 pl-6 pr-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} />
                          <p className="text-[13px] font-bold text-slate-700 leading-tight capitalize">
                            {u.name}
                            {u.id === me?.id && (
                              <span className="ml-1.5 text-[9px] font-bold text-violet-500 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <span className="text-[12px] text-slate-500">{u.email}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-4">
                        {u.branch?.name ? (
                          <span className="text-[12px] font-medium text-slate-600">{u.branch.name}</span>
                        ) : (
                          <span className="text-[12px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Verified */}
                      <td className="py-3 px-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                            <ShieldCheck size={10} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-wide">
                            <ShieldAlert size={10} />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 transition-opacity">
                          {u.id !== me?.id && (
                            <button
                              onClick={() => navigate(`/chat?userId=${u.id}`)}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 flex items-center justify-center text-slate-500 transition-all"
                              title="Open chat"
                            >
                              <MessageCircle size={12} />
                            </button>
                          )}
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => openEdit(u)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 flex items-center justify-center text-slate-500 transition-all"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(u.id)}
                                disabled={deletingId === u.id}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 flex items-center justify-center text-slate-500 transition-all disabled:opacity-40"
                              >
                                {deletingId === u.id ? (
                                  <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <UserModal
            editing={editing}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={closeModal}
            isPending={save.isPending}
            error={error}
            roles={ROLES}
            branches={branches}
            myRole={me?.role}
          />
        )}
      </AnimatePresence>
    </div>
  );
}