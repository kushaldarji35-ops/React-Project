import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getDbCart,
  addToDbCart,
  updateDbCartQuantity,
  removeFromDbCart,
  clearDbCart,
} from "../services/authService";

const CartContext = createContext();

// Helper to normalize cart item fields
export const normalizeCartItem = (item) => {
  if (!item) return null;
  const rawPrice = Number(
    item.price != null
      ? item.price
      : item.current_price != null
      ? item.current_price
      : 0
  );
  const safeQty = Math.min(99, Math.max(1, Number(item.quantity) || 1));
  const size =
    item.selectedSize || item.selected_size || item.size || "Standard";
  const color =
    item.selectedColor || item.selected_color || item.color || "Default";
  const prodId = item.productId || item.product_id || item.id || 0;
  const cartItemId =
    item.cartItemId || item.dbId || item.id || `${prodId}-${size}-${color}`;

  let itemImage = item.image || "";
  if (!itemImage && item.images) {
    if (Array.isArray(item.images)) itemImage = item.images[0] || "";
    else if (typeof item.images === "string") {
      try {
        const parsed = JSON.parse(item.images);
        if (Array.isArray(parsed)) itemImage = parsed[0] || "";
      } catch {
        itemImage = item.images.split(",")[0] || "";
      }
    }
  }

  return {
    ...item,
    id: prodId,
    productId: prodId,
    cartItemId,
    dbId: item.dbId || (typeof cartItemId === "number" ? cartItemId : null),
    name: item.name || "Product",
    price: rawPrice,
    current_price: rawPrice,
    originalPrice:
      item.originalPrice != null
        ? Number(item.originalPrice)
        : item.original_price != null
        ? Number(item.original_price)
        : null,
    discountPercent:
      item.discountPercent != null
        ? Number(item.discountPercent)
        : item.discount_percent != null
        ? Number(item.discount_percent)
        : null,
    image: itemImage,
    selectedSize: size,
    selectedColor: color,
    selected_size: size,
    selected_color: color,
    quantity: safeQty,
  };
};

// Helper to deduplicate cart items by product + size + color
export const deduplicateCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  const map = new Map();
  items.forEach((raw) => {
    const item = normalizeCartItem(raw);
    if (!item) return;
    const key = `${item.id || item.productId}_${(
      item.selectedSize || "Standard"
    ).toLowerCase()}_${(item.selectedColor || "Default").toLowerCase()}`;

    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
};

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return deduplicateCartItems(action.payload);

    case "ADD_TO_CART": {
      const { product, size = "", color = "", quantity = 1 } = action.payload;
      const prodId = product?.id || action.payload.id || 0;
      const chosenSize = size || "Standard";
      const chosenColor = color || "Default";
      const chosenQty = Math.min(99, Math.max(1, Number(quantity) || 1));
      const chosenPrice = Number(product?.price ?? product?.current_price ?? 0);

      const existingIdx = state.findIndex(
        (item) =>
          (String(item.id) === String(prodId) ||
            String(item.productId) === String(prodId)) &&
          (item.selectedSize || "Standard").toLowerCase() ===
            chosenSize.toLowerCase() &&
          (item.selectedColor || "Default").toLowerCase() ===
            chosenColor.toLowerCase()
      );

      if (existingIdx >= 0) {
        return state.map((item, i) =>
          i === existingIdx
            ? {
                ...item,
                price: item.price || chosenPrice,
                quantity: Math.min(99, item.quantity + chosenQty),
              }
            : item
        );
      }

      let prodImg =
        (product?.images && product?.images[0]) || product?.image || "";
      return deduplicateCartItems([
        ...state,
        normalizeCartItem({
          cartItemId: `${prodId}-${chosenSize}-${chosenColor}-${Date.now()}`,
          id: prodId,
          productId: prodId,
          name: product?.name || "Product",
          price: chosenPrice,
          current_price: chosenPrice,
          originalPrice: product?.originalPrice ?? product?.original_price,
          discountPercent:
            product?.discountPercent ?? product?.discount_percent,
          image: prodImg,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity: chosenQty,
        }),
      ]);
    }

    case "REMOVE_FROM_CART": {
      const target = action.payload;
      return state.filter(
        (item) =>
          item.cartItemId !== target &&
          item.dbId !== target &&
          String(item.dbId) !== String(target) &&
          String(item.cartItemId) !== String(target)
      );
    }

    case "UPDATE_QUANTITY": {
      const { cartItemId, quantity } = action.payload;
      const safeQty = Math.min(99, Math.max(0, Number(quantity) || 0));
      if (safeQty <= 0) {
        return state.filter(
          (item) =>
            item.cartItemId !== cartItemId &&
            item.dbId !== cartItemId &&
            String(item.dbId) !== String(cartItemId) &&
            String(item.cartItemId) !== String(cartItemId)
        );
      }
      return state.map((item) =>
        item.cartItemId === cartItemId ||
        item.dbId === cartItemId ||
        String(item.dbId) === String(cartItemId) ||
        String(item.cartItemId) === String(cartItemId)
          ? { ...item, quantity: safeQty }
          : item
      );
    }

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem("shopco_cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return deduplicateCartItems(parsed);
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);

  // Keep localStorage updated as fallback cache
  useEffect(() => {
    try {
      localStorage.setItem("shopco_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Failed to persist cart locally:", e);
    }
  }, [cartItems]);

  // Load from Database when user is authenticated
  const loadCartFromDb = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsDbSynced(false);
      return;
    }

    try {
      setIsLoading(true);
      const dbItems = await getDbCart();

      if (Array.isArray(dbItems)) {
        const cleaned = deduplicateCartItems(dbItems);
        dispatch({ type: "SET_CART", payload: cleaned });
        localStorage.setItem("shopco_cart", JSON.stringify(cleaned));
        setIsDbSynced(true);
      }
    } catch (err) {
      console.error("Failed to load user cart from database:", err);
      setIsDbSynced(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for login, logout, and storage changes across tabs
  useEffect(() => {
    loadCartFromDb();

    const handleAuthChange = () => {
      loadCartFromDb();
    };

    window.addEventListener("cartAuthChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("cartAuthChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [loadCartFromDb]);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const discountRate = 20;
  const discount = Math.round((subtotal * discountRate) / 100);
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  const cartCount = cartItems.length;

  const addToCart = async (product, size, color, quantity = 1) => {
    const chosenSize = size || product?.sizes?.[0] || "Standard";
    const chosenColor = color || product?.colors?.[0] || "Default";
    const chosenQty = Math.min(99, Math.max(1, Number(quantity) || 1));
    const chosenPrice = Number(product?.price ?? product?.current_price ?? 0);

    const token = localStorage.getItem("token");

    if (token) {
      // When logged in, persist directly to MySQL and load refreshed unique cart
      try {
        const res = await addToDbCart({
          productId: product?.id,
          name: product?.name,
          price: chosenPrice,
          image: (product?.images && product?.images[0]) || product?.image,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity: chosenQty,
        });

        if (res?.cart && Array.isArray(res.cart)) {
          const cleaned = deduplicateCartItems(res.cart);
          dispatch({ type: "SET_CART", payload: cleaned });
          localStorage.setItem("shopco_cart", JSON.stringify(cleaned));
          setIsDbSynced(true);
        } else {
          const fresh = await getDbCart();
          if (Array.isArray(fresh)) {
            const cleaned = deduplicateCartItems(fresh);
            dispatch({ type: "SET_CART", payload: cleaned });
            localStorage.setItem("shopco_cart", JSON.stringify(cleaned));
          }
        }
      } catch (err) {
        console.error("Failed to save item to database cart:", err);
      }
    } else {
      // Guest mode
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          product: { ...product, price: chosenPrice },
          size: chosenSize,
          color: chosenColor,
          quantity: chosenQty,
        },
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    // Locate the item in state to get its database ID if present
    const item = cartItems.find(
      (it) =>
        it.cartItemId === cartItemId ||
        it.dbId === cartItemId ||
        String(it.dbId) === String(cartItemId) ||
        String(it.cartItemId) === String(cartItemId)
    );
    const targetDbId =
      item?.dbId ||
      (!isNaN(cartItemId) && Number(cartItemId) > 0 ? Number(cartItemId) : null);

    // 1. Instant optimistic removal
    dispatch({ type: "REMOVE_FROM_CART", payload: cartItemId });

    // 2. Delete from MySQL database if authenticated
    const token = localStorage.getItem("token");
    if (token && targetDbId) {
      try {
        const res = await removeFromDbCart(targetDbId);
        if (res?.cart && Array.isArray(res.cart)) {
          const cleaned = deduplicateCartItems(res.cart);
          dispatch({ type: "SET_CART", payload: cleaned });
          localStorage.setItem("shopco_cart", JSON.stringify(cleaned));
        }
      } catch (err) {
        console.error("Failed to delete item from database cart:", err);
      }
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const safeQty = Math.min(99, Math.max(0, Number(quantity) || 0));

    // Locate the item in state
    const item = cartItems.find(
      (it) =>
        it.cartItemId === cartItemId ||
        it.dbId === cartItemId ||
        String(it.dbId) === String(cartItemId) ||
        String(it.cartItemId) === String(cartItemId)
    );
    const targetDbId =
      item?.dbId ||
      (!isNaN(cartItemId) && Number(cartItemId) > 0 ? Number(cartItemId) : null);

    // 1. Instant optimistic update
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { cartItemId, quantity: safeQty },
    });

    // 2. Persist updated quantity to MySQL database
    const token = localStorage.getItem("token");
    if (token && targetDbId) {
      try {
        const res = await updateDbCartQuantity(targetDbId, safeQty);
        if (res?.cart && Array.isArray(res.cart)) {
          const cleaned = deduplicateCartItems(res.cart);
          dispatch({ type: "SET_CART", payload: cleaned });
          localStorage.setItem("shopco_cart", JSON.stringify(cleaned));
        }
      } catch (err) {
        console.error("Failed to update database cart quantity:", err);
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    try {
      localStorage.removeItem("shopco_cart");
    } catch {}

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await clearDbCart();
      } catch (err) {
        console.error("Failed to clear database cart:", err);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discount,
        discountRate,
        deliveryFee,
        total,
        isLoading,
        isDbSynced,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: loadCartFromDb,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
