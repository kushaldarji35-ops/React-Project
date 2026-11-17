import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const normalizeProduct = (p) => {
  if (!p) return null;
  const price = Number(p.current_price ?? p.price ?? 0);
  const originalPrice =
    p.original_price != null
      ? Number(p.original_price)
      : p.originalPrice != null
      ? Number(p.originalPrice)
      : null;
  const discountPercent =
    p.discount_percent != null
      ? Number(p.discount_percent)
      : p.discountPercent != null
      ? Number(p.discountPercent)
      : null;

  let parsedImages = [];
  if (Array.isArray(p.images)) {
    parsedImages = p.images;
  } else if (typeof p.images === "string" && p.images.trim()) {
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed)) parsedImages = parsed;
    } catch {
      parsedImages = p.images.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const rawImg = p.image || p.imageUrl || (parsedImages[0] || "");
  const images = parsedImages.length > 0 ? parsedImages : (rawImg ? [rawImg] : []);

  return {
    ...p,
    id: p.id,
    name: p.name || "Untitled Product",
    price,
    originalPrice,
    discountPercent,
    rating:
      p.rating != null && !isNaN(Number(p.rating))
        ? Number(p.rating)
        : 0,
    reviewCount:
      p.review_count != null && !isNaN(Number(p.review_count))
        ? Number(p.review_count)
        : p.reviewCount != null && !isNaN(Number(p.reviewCount))
        ? Number(p.reviewCount)
        : 0,
    category: (p.category_name || p.category || "casual").toLowerCase(),
    subcategory: (p.subcategory || "").toLowerCase(),
    stockStatus: p.status === "active" ? "In Stock" : p.stockStatus || "In Stock",
    description: p.description || "",
    images,
    colors: (() => {
      if (Array.isArray(p.colors)) return p.colors;
      if (typeof p.colors === "string" && p.colors.trim()) {
        try {
          const parsed = JSON.parse(p.colors);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          const split = p.colors.split(",").map((c) => c.trim()).filter(Boolean);
          if (split.length > 0) return split;
        }
      }
      return [];
    })(),
    sizes: (() => {
      if (Array.isArray(p.sizes)) return p.sizes;
      if (typeof p.sizes === "string" && p.sizes.trim()) {
        try {
          const parsed = JSON.parse(p.sizes);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          const split = p.sizes.split(",").map((s) => s.trim()).filter(Boolean);
          if (split.length > 0) return split;
        }
      }
      return [];
    })(),
    isNewArrival: p.isNewArrival ?? true,
    isTopSelling: p.isTopSelling ?? false,
  };
};

// Clean legacy mock products from localStorage
export const purgeLegacyProducts = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  const saved = localStorage.getItem("admin_products_data");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const legacyNames = [
      "T-shirt with Tape Details",
      "Skinny Fit Jeans",
      "Checkered Shirt",
      "Sleeve Striped T-Shirt",
      "One Life Graphic T-shirt",
      "Courage Cartoon Graphic T-shirt",
      "Loose Fit Bermuda Shorts",
      "Faded Skinny Jeans",
      "Classic Polo Shirt",
      "Casual Linen Shirt",
      "Relaxed Fit Cargo Pants",
      "Tailored Slim Blazer",
      "Classic Oxford Dress Shirt",
      "Slim Fit Wool Trousers",
      "Sequin Cocktail Dress",
      "Velvet Tuxedo Jacket",
      "Metallic Shimmer Top",
      "Performance Tech Tee",
      "Dry-Fit Training Shorts",
      "Zip-Up Training Hoodie",
    ];
    const cleaned = parsed.filter((p) => !legacyNames.includes(p.name));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem("admin_products_data", JSON.stringify(cleaned));
      window.dispatchEvent(new Event("products_updated"));
    }
    return cleaned;
  } catch {
    return [];
  }
};

// Immediately purge on module evaluation
if (typeof window !== "undefined") {
  purgeLegacyProducts();
}

// Fetch all products from MySQL database
export const fetchDbProducts = async () => {
  try {
    const res = await axios.get(`${API_URL}/products`);
    const data = Array.isArray(res.data) ? res.data : [];
    const normalized = data.map(normalizeProduct);
    localStorage.setItem("admin_products_data", JSON.stringify(normalized));
    window.dispatchEvent(new Event("products_updated"));
    return normalized;
  } catch (err) {
    console.error("Failed to fetch products from database:", err);
    return purgeLegacyProducts();
  }
};

// Create product in MySQL database
export const createDbProduct = async (productData) => {
  const token = localStorage.getItem("token");
  const allImages = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : productData.imageUrl
    ? [productData.imageUrl, ...(productData.subImages || [])].filter(Boolean)
    : (productData.subImages || []);

  const payload = {
    name: productData.name,
    category: productData.category || "casual",
    subcategory: productData.subcategory || null,
    price: Number(productData.price),
    current_price: Number(productData.price),
    original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
    discount_percent: productData.discountPercent ? Number(productData.discountPercent) : null,
    rating: Number(productData.rating) || 0.0,
    description: productData.description || "",
    image: allImages[0] || productData.imageUrl || "",
    images: allImages,
    status: productData.stockStatus === "Out of Stock" ? "inactive" : "active",
    sizes: productData.sizes || [],
    colors: productData.colors || [],
  };

  const res = await axios.post(`${API_URL}/products`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update product in MySQL database
export const updateDbProduct = async (id, productData) => {
  const token = localStorage.getItem("token");
  const allImages = Array.isArray(productData.images)
    ? productData.images
    : (productData.imageUrl !== undefined || productData.subImages !== undefined)
    ? [productData.imageUrl, ...(productData.subImages || [])].filter(Boolean)
    : undefined;

  const payload = {
    name: productData.name,
    category: productData.category,
    subcategory: productData.subcategory ?? "",
    price: Number(productData.price),
    current_price: Number(productData.price),
    original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
    discount_percent: productData.discountPercent ? Number(productData.discountPercent) : null,
    rating: Number(productData.rating),
    description: productData.description,
    image: allImages ? (allImages[0] || "") : (productData.imageUrl || undefined),
    images: allImages,
    status: productData.stockStatus === "Out of Stock" ? "inactive" : "active",
    sizes: productData.sizes !== undefined ? productData.sizes : undefined,
    colors: productData.colors !== undefined ? productData.colors : undefined,
  };

  const res = await axios.put(`${API_URL}/products/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete product in MySQL database
export const deleteDbProduct = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
