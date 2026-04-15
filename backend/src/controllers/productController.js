import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, sku, price, quantity } = req.body;

    const product = await prisma.product.create({
      data: { name, sku, price, quantity }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: req.body
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};