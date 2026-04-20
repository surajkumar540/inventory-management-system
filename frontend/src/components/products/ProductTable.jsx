import { useState } from "react";
import { deleteProduct } from "../../api/product";
import { Trash2, Package } from "lucide-react";
import { card, cardTitle, tableHead, tableRow, tableCell, tableCellPrimary, badge } from "../../styles/cn.js";

const ProductTable = ({ products, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0)  return <span className={`${badge.base} ${badge.danger}`}>Out of stock</span>;
    if (qty <= 10)  return <span className={`${badge.base} ${badge.warning}`}>Low ({qty})</span>;
    return              <span className={`${badge.base} ${badge.success}`}>In stock ({qty})</span>;
  };

  return (
    <div className={card}>
      {/* Card header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary-50 flex items-center justify-center">
            <Package size={14} className="text-primary-500" />
          </div>
          <p className={cardTitle}>All Products</p>
        </div>
        <span className="text-2xs font-medium bg-surface-muted text-ink-muted border border-border px-2 py-1 rounded-md">
          {products.length} item{products.length !== 1 ? "s" : ""}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-ink-faint">
          <Package size={32} className="mb-3 opacity-30" />
          <p className="text-sm">No products found</p>
          <p className="text-xs mt-1">Add your first product above</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableHead}>Image</th>
                <th className={tableHead}>Name</th>
                <th className={tableHead}>Price</th>
                <th className={tableHead}>Stock</th>
                <th className={`${tableHead} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={tableRow}>

                  {/* Image */}
                  <td className={tableCell}>
                    {p.image ? (
                      <img
                        src={encodeURI(p.image?.replace(/\\/g, "/"))}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-md border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-surface-muted border border-border flex items-center justify-center">
                        <Package size={14} className="text-ink-faint" />
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className={tableCellPrimary}>{p.name}</td>

                  {/* Price */}
                  <td className={`${tableCell} font-mono`}>₹{p.price?.toLocaleString("en-IN")}</td>

                  {/* Stock */}
                  <td className={tableCell}>{getStockBadge(p.quantity)}</td>

                  {/* Delete */}
                  <td className={`${tableCell} text-right`}>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-danger-600 bg-danger-50 border border-danger-100 rounded-md hover:bg-danger-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === p.id ? (
                        <div className="w-3 h-3 rounded-full border-2 border-danger-400 border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductTable;