import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, createBranch, updateBranch, deleteBranch } from "../../api/branches";

const EMPTY = { name: "", city: "", address: "" };

export default function BranchesTab() {
  const qc = useQueryClient();
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches().then((r) => r.data.data),
  });

  const save = useMutation({
    mutationFn: () => editing
      ? updateBranch(editing, form)
      : createBranch(form),
    onSuccess: () => { qc.invalidateQueries(["branches"]); closeModal(); },
  });

  const remove = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => qc.invalidateQueries(["branches"]),
  });

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit   = (b) => { setForm({ name: b.name, city: b.city, address: b.address || "" }); setEditing(b.id); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{data?.length || 0} branches</p>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + Add Branch
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">City</th>
              <th className="pb-2 font-medium">Address</th>
              <th className="pb-2 font-medium">Users</th>
              <th className="pb-2 font-medium">Products</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{b.name}</td>
                <td className="py-3 text-gray-600">{b.city}</td>
                <td className="py-3 text-gray-500">{b.address || "—"}</td>
                <td className="py-3 text-gray-600">{b._count?.users ?? 0}</td>
                <td className="py-3 text-gray-600">{b._count?.products ?? 0}</td>
                <td className="py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(b)} className="text-blue-500 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove.mutate(b.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Branch" : "Add Branch"}</h2>
            <div className="flex flex-col gap-3">
              {[["name","Name"],["city","City"],["address","Address (optional)"]].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                onClick={() => save.mutate()}
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