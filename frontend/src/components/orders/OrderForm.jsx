import { useEffect, useState } from "react";
import { getProducts } from "../../api/product";
import { createOrder } from "../../api/order";

const OrderForm = ({ onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQty = (index, qty) => {
    const updated = [...cart];
    updated[index].quantity = qty;
    setCart(updated);
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    await createOrder({ items });
    setCart([]);
    onSuccess();
  };

  return (
    <div className="space-y-4 border p-4 rounded">

      {/* Product List */}
      <div className="flex gap-2 flex-wrap">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => addToCart(p)}
            className="border px-2 py-1"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Cart */}
      <div>
        {cart.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span>{item.name}</span>

            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQty(i, Number(e.target.value))}
              className="w-16 border"
            />

            <button onClick={() => removeItem(i)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2"
      >
        Create Order
      </button>
    </div>
  );
};

export default OrderForm;