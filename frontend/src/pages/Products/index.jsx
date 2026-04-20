import { useEffect, useState } from "react";
import { getProducts } from "../../api/product";
import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        <p className="text-sm text-ink-faint mt-1">Manage your product inventory</p>
      </div>

      {/* Add Product Form */}
      <ProductForm onSuccess={fetchProducts} />

      {/* Product Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <ProductTable products={products} onRefresh={fetchProducts} />
      )}
    </div>
  );
};

export default Products;