import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFilterOutline,
  IoChevronForward,
  IoClose,
  IoCheckmark,
} from "react-icons/io5";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import ProductCard from "../components/ui/ProductCard";
import Breadcrumb from "../components/ui/Breadcrumb";
import NewsletterBanner from "../components/layout/NewsletterBanner";
import { products } from "../data/products";
import { fetchDbProducts } from "../services/productService";
import {
  fetchDbCategories,
  fetchDbSubcategories,
} from "../services/categoryService";
import "./CategoryPage.css";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const COLOR_SWATCHES = [
  "#4CAF50",
  "#F44336",
  "#FFEB3B",
  "#FF9800",
  "#03A9F4",
  "#2196F3",
  "#9C27B0",
  "#FF69B4",
  "#FFFFFF",
  "#000000",
];

const ALL_SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

const PRODUCTS_PER_PAGE = 9;

function getPaginationItems(currentPage, totalPages = 10) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button onClick={() => setOpen(!open)} className="filter-section__toggle">
        {title}
        {open ? (
          <IoChevronUpOutline size={16} />
        ) : (
          <IoChevronDownOutline size={16} />
        )}
      </button>
      {open && <div className="filter-section__body">{children}</div>}
    </div>
  );
}

function FilterSidebar({
  filters,
  setFilters,
  onApply,
  priceCeiling,
  subcategories,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggle = (key, value) => {
    setLocalFilters((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply?.();
  };

  return (
    <div>
      <FilterSection title="Filters" defaultOpen={true}>
        {subcategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggle("subcategory", cat.slug)}
            className={`filter-cat-item${localFilters.subcategory?.includes(cat.slug) ? " filter-cat-item--active" : ""}`}
          >
            {cat.name}
            <IoChevronForward size={14} />
          </button>
        ))}
      </FilterSection>

      <FilterSection title="Price">
        <div className="filter-price">
          <div className="filter-price__labels">
            <span>${localFilters.minPrice ?? 0}</span>
            <span>${localFilters.maxPrice ?? priceCeiling}</span>
          </div>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            value={localFilters.maxPrice ?? priceCeiling}
            onChange={(e) =>
              setLocalFilters((p) => ({
                ...p,
                maxPrice: Number(e.target.value),
              }))
            }
            style={{
              "--range-fill": `${((localFilters.maxPrice ?? priceCeiling) / priceCeiling) * 100}%`,
            }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Colors">
        <div className="filter-colors">
          {COLOR_SWATCHES.map((color) => {
            const selected = localFilters.colors?.includes(color);
            return (
              <button
                key={color}
                onClick={() => toggle("colors", color)}
                className={`filter-color-swatch${selected ? " filter-color-swatch--selected" : ""}${color === "#FFFFFF" ? " filter-color-swatch--white" : ""}`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              >
                {selected && (
                  <IoCheckmark
                    size={16}
                    color={color === "#FFFFFF" ? "#000000" : "#ffffff"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="filter-sizes">
          {ALL_SIZES.map((size) => {
            const selected = localFilters.sizes?.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggle("sizes", size)}
                className={`filter-size-btn${selected ? " filter-size-btn--selected" : ""}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Dress Style">
        {DRESS_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => toggle("dressStyle", style.toLowerCase())}
            className={`filter-style-item${localFilters.dressStyle?.includes(style.toLowerCase()) ? " filter-style-item--active" : ""}`}
          >
            {style}
            <IoChevronForward size={14} />
          </button>
        ))}
      </FilterSection>

      <button onClick={handleApply} className="btn-primary filter-apply-btn">
        Apply Filter
      </button>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    subcategory: [],
    colors: [],
    sizes: [],
    dressStyle: [],
    minPrice: 0,
    maxPrice: null,
  });

  const [productsVersion, setProductsVersion] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const priceCeiling = products.reduce(
    (maxPrice, product) => Math.max(maxPrice, Number(product.price) || 0),
    500,
  );

  useEffect(() => {
    fetchDbProducts().catch(() => {});
    fetchDbCategories()
      .then(setCategories)
      .catch(() => {});
    fetchDbSubcategories()
      .then(setSubcategories)
      .catch((error) => console.error("Failed to load subcategories:", error));
    const handleUpdate = () => setProductsVersion((v) => v + 1);
    window.addEventListener("products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [slug]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const SLUG_MAP = {
    men: "casual",
    women: "formal",
    kids: "party",
  };
  const categoryFromSlug = categories.find(
    (category) => category.slug === slug,
  );
  const resolvedCategory =
    slug === "all"
      ? null
      : (categoryFromSlug?.name.toLowerCase() ?? SLUG_MAP[slug] ?? slug);

  const filtered = products.filter((p) => {
    if (resolvedCategory && p.category !== resolvedCategory) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (
      filters.subcategory?.length > 0 &&
      !filters.subcategory.includes((p.subcategory || "").toLowerCase())
    )
      return false;
    if (
      filters.sizes?.length > 50 &&
      !filters.sizes.some((s) => p.sizes.includes(s))
    )
      return false;
    if (
      filters.dressStyle?.length > 50 &&
      !filters.dressStyle.includes(p.category)
    )
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return b.id - a.id;

    const priorityOrder = [6, 7, 8, 2, 3, 4, 9, 10, 11];
    const indexA = priorityOrder.indexOf(a.id);
    const indexB = priorityOrder.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return b.reviewCount - a.reviewCount;
  });

  const displayTotalPages = Math.max(
    1,
    Math.ceil(sorted.length / PRODUCTS_PER_PAGE),
  );
  const pageSlice = sorted.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE,
  );
  const paginated =
    pageSlice.length > 0 ? pageSlice : sorted.slice(0, PRODUCTS_PER_PAGE);

  const categoryLabel =
    slug === "all"
      ? "All Products"
      : categoryFromSlug?.name ||
        (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "All");

  return (
    <>
      <div className="category-page">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/category/all" },
            ...(filters.subcategory?.length > 0
              ? [
                  { label: categoryLabel, href: `/category/${slug}` },
                  {
                    label:
                      subcategories.find(
                        (s) => s.slug === filters.subcategory[0],
                      )?.name || filters.subcategory[0],
                  },
                ]
              : [{ label: categoryLabel }]),
          ]}
        />

        <div className="category-page__layout">
          <aside className="filter-sidebar">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <h2 className="filter-sidebar__title">Filters</h2>
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              priceCeiling={priceCeiling}
              subcategories={subcategories}
            />
          </aside>

          <div className="category-main">
            <div className="category-toolbar">
              <div className="category-toolbar__left">
                <h1>{categoryLabel}</h1>
              </div>
              <div className="category-toolbar__right">
                <span className="category-toolbar__count">
                  Showing {(page - 1) * PRODUCTS_PER_PAGE + 1}-
                  {Math.min(page * PRODUCTS_PER_PAGE, sorted.length)} of{" "}
                  {sorted.length} Products
                </span>

                <button
                  onClick={() => setDrawerOpen(true)}
                  className="mobile-filter-btn"
                >
                  <IoFilterOutline size={16} />
                  Filters
                </button>

                <div className="sort-wrap">
                  <span className="sort-label">Sort by:</span>
                  <div className="sort-select-wrapper">
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                      }}
                      className="sort-select"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <IoChevronDownOutline size={15} className="sort-chevron" />
                  </div>
                </div>
              </div>
            </div>
            {paginated.length > 0 ? (
              <div className="category-grid">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="category-empty">
                <span className="category-empty__icon">👗</span>
                <p className="category-empty__title">No products found</p>
                <p className="category-empty__sub">
                  Try adjusting your filters
                </p>
              </div>
            )}

            <div className="pagination-wrapper">
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="pagination__btn pagination__btn--prev"
                >
                  <GoArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination__pages">
                  {getPaginationItems(page, displayTotalPages).map(
                    (item, idx) => {
                      if (item === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="pagination__ellipsis"
                          >
                            ...
                          </span>
                        );
                      }
                      const pg = Number(item);
                      return (
                        <button
                          key={pg}
                          onClick={() => handlePageChange(pg)}
                          disabled={displayTotalPages === 1}
                          className={`pagination__page${pg === page ? " pagination__page--active" : ""}`}
                        >
                          {pg}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(displayTotalPages, page + 1))
                  }
                  disabled={page >= displayTotalPages}
                  className="pagination__btn pagination__btn--next"
                >
                  <span>Next</span>
                  <GoArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            className="filter-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="filter-drawer animate-slideInRight">
            <div className="filter-drawer__header">
              <span className="filter-drawer__title">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="filter-drawer__close"
                aria-label="Close filters"
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="filter-drawer__body">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                priceCeiling={priceCeiling}
                subcategories={subcategories}
                onApply={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <NewsletterBanner />
    </>
  );
}
