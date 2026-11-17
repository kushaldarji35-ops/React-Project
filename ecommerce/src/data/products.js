import { fetchDbProducts, purgeLegacyProducts } from "../services/productService";

// All static product data removed. Products are retrieved live from MySQL Database.
export const initialProducts = [];

// Kick off initial fetch from database on application startup
if (typeof window !== "undefined") {
  fetchDbProducts().catch(() => {});
}

export const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    verified: true,
    comment:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
  },
  {
    id: 2,
    name: "Alex K.",
    rating: 5,
    verified: true,
    comment:
      "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
  },
  {
    id: 3,
    name: "James L.",
    rating: 5,
    verified: true,
    comment:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
  {
    id: 4,
    name: "Moana K.",
    rating: 5,
    verified: true,
    comment:
      "I've been a loyal Shop.co customer for a while now and I'm always blown away by their quality and customer service. The clothes look exactly like the photos and fit perfectly.",
  },
  {
    id: 5,
    name: "Samantha D.",
    rating: 5,
    verified: true,
    comment:
      "I absolutely love the modern vibe and effortless style of the pieces from Shop.co. Everything from casual tees to formal wear fits like a glove and feels ultra-luxurious.",
  },
];

// Helper to retrieve live product list synced with database
export const getStoredProducts = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return purgeLegacyProducts();
  }
  return initialProducts;
};

// Dynamic products export that delegates to current stored database products
export const products = new Proxy([], {
  get(target, prop) {
    const list = getStoredProducts();
    const val = Reflect.get(list, prop);
    if (typeof val === "function") {
      return val.bind(list);
    }
    return val;
  },
  set(target, prop, value) {
    const list = getStoredProducts();
    const result = Reflect.set(list, prop, value);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("admin_products_data", JSON.stringify(list));
      window.dispatchEvent(new Event("products_updated"));
    }
    return result;
  },
  has(target, prop) {
    return Reflect.has(getStoredProducts(), prop);
  },
  ownKeys(target) {
    return Reflect.ownKeys(getStoredProducts());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getStoredProducts(), prop);
  },
});

export const getProductById = (id) =>
  getStoredProducts().find((p) => String(p.id) === String(id));

export const getProductsByCategory = (category) =>
  getStoredProducts().filter(
    (p) => (p.category || "").toLowerCase() === (category || "").toLowerCase()
  );

export const getNewArrivals = (all = false) => {
  const list = getStoredProducts().filter((p) => p.isNewArrival !== false);
  return all ? list : list.slice(0, 4);
};

export const getTopSelling = (all = false) => {
  const list = getStoredProducts().filter((p) => p.isTopSelling);
  return all ? list : list.slice(0, 4);
};

export const getRelatedProducts = (id, limit = 4) => {
  const allProds = getStoredProducts();
  const currentId = String(id);
  const available = allProds.filter(
    (p) => String(p.id) !== currentId && p.images && p.images.length > 0
  );
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};
