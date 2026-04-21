import { useState } from "react";

const OrderTable = ({ orders, onDelete }) => {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">

        {/* HEADER */}
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="text-left p-3">Order</th>
            <th className="text-left p-3">Date</th>
            <th className="text-right p-3">Items</th>
            <th className="text-right p-3">Amount</th>
            <th className="text-right p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => {
            const total = o.items.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );

            return (
              <>
                {/* MAIN ROW */}
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(o.id)}
                >
                  <td className="p-3 font-medium text-gray-700">
                    #ORD-{String(o.id).padStart(3, "0")}
                  </td>

                  <td className="p-3 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="p-3 text-right">
                    {o.items.length}
                  </td>

                  <td className="p-3 text-right font-semibold">
                    ₹{total.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent row toggle
                        onDelete(o.id);
                      }}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW */}
                {openRow === o.id && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="p-4">
                      <div className="space-y-2">

                        {o.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm border-b pb-2"
                          >
                            <div>
                              <p className="font-medium text-gray-700">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>

                            <p className="font-mono text-gray-600">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}

                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;