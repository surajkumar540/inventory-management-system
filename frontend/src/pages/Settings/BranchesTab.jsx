import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, createBranch, updateBranch, deleteBranch } from "../../api/branches";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  Users,
  Package,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

const EMPTY = { name: "", city: "", address: "" };

const StatChip = ({ icon: Icon, value, label }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
    <Icon size={10} className="text-slate-400" />
    {value} {label}
  </span>
);

/* ── Modal ── */
const BranchModal = ({ editing, form, setForm, onSave, onClose, isPending }) => {
  const fields = [
    { key: "name", label: "Branch Name", placeholder: "e.g. Downtown HQ", required: true },
    { key: "city", label: "City", placeholder: "e.g. Mumbai", required: true },
    { key: "address", label: "Address", placeholder: "Street address (optional)", required: false },
  ];

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
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
              <GitBranch size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800">
                {editing ? "Edit Branch" : "Add Branch"}
              </p>
              <p className="text-[11px] text-slate-400">
                {editing ? "Update branch details" : "Create a new branch location"}
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

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
              </label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full h-11 px-3.5 text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          ))}
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
            className="flex items-center gap-2 h-10 px-6 text-[13px] font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-xl shadow-md shadow-teal-200/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isPending ? "Saving…" : editing ? "Save Changes" : "Add Branch"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main ── */
export default function BranchesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches().then((r) => r.data.data),
  });

  const save = useMutation({
    mutationFn: () => editing ? updateBranch(editing, form) : createBranch(form),
    onSuccess: () => { qc.invalidateQueries(["branches"]); closeModal(); },
  });

  const remove = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => { qc.invalidateQueries(["branches"]); setDeletingId(null); },
    onSettled: () => setDeletingId(null),
  });

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (b) => {
    setForm({ name: b.name, city: b.city, address: b.address || "" });
    setEditing(b.id);
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const handleDelete = (id) => {
    setDeletingId(id);
    remove.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-slate-500">
            {isLoading ? "—" : data?.length ?? 0} branch{(data?.length ?? 0) !== 1 ? "es" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-9 px-4 text-[12px] font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-xl shadow-sm shadow-teal-200/60 transition-all"
        >
          <Plus size={13} />
          Add Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent animate-spin rounded-full" />
            <p className="text-[12px] font-medium text-slate-400">Loading branches…</p>
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <Building2 size={20} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">No branches yet</p>
            <p className="text-[11px] text-slate-300 mt-1">Add your first branch location</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                {["Branch", "City", "Address", "Users", "Products", ""].map((h, i) => (
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
                {data.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center shrink-0">
                          <GitBranch size={13} className="text-teal-500" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-700">{b.name}</p>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-300" />
                        <span className="text-[13px] font-medium text-slate-600">{b.city}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4">
                      <span className="text-[12px] text-slate-400">{b.address || "—"}</span>
                    </td>

                    {/* Users */}
                    <td className="py-3.5 px-4">
                      <StatChip icon={Users} value={b._count?.users ?? 0} label="users" />
                    </td>

                    {/* Products */}
                    <td className="py-3.5 px-4">
                      <StatChip icon={Package} value={b._count?.products ?? 0} label="products" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(b)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 flex items-center justify-center text-slate-500 transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 flex items-center justify-center text-slate-500 transition-all disabled:opacity-40"
                        >
                          {deletingId === b.id ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <BranchModal
            editing={editing}
            form={form}
            setForm={setForm}
            onSave={() => save.mutate()}
            onClose={closeModal}
            isPending={save.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}