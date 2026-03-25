import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types";
import { PRODUCTS_API_URL } from "../endpoints/endpoints";
import { apiRequest } from "../api/request";

type LoadState = "idle" | "loading" | "success" | "error";

const normalizeProduct = (product: Record<string, unknown>): Product => {
  const color =
    (product.color as string) ||
    (product.colour as string) ||
    (product.colour as string) ||
    "";
  const image =
    (product.imageURL as string) ||
    (product.imageUrl as string) ||
    (product.image as string) ||
    "";
  const currency = (product.currency as string) || "USD";

  const fallbackId = () =>
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id:
      (product.id as string | number) ??
      globalThis.crypto?.randomUUID?.() ??
      fallbackId(),
    name: String(product.name ?? ""),
    price: Number(product.price ?? 0),
    currency,
    image,
    type: String(product.type ?? ""),
    gender: String(product.gender ?? ""),
    color: String(color),
    quantity: Number(product.quantity ?? 0),
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setStatus("loading");
        const data = await apiRequest<Record<string, unknown>[]>(
          PRODUCTS_API_URL,
          { signal: controller.signal },
        );
        setProducts(data.map(normalizeProduct));
        setStatus("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    };
    load();
    return () => {
      controller.abort();
    };
  }, []);

  const sortedProducts = useMemo(
    () => products.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  return { products: sortedProducts, status, error };
};
