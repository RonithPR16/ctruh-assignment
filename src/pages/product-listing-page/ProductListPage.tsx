import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { ProductCard } from "../../components/product-card/ProductCard";
import { InputField } from "../../components/input/InputField";
import { PRICE_RANGES } from "../../constants/filters";
import { useCart } from "../../context/cart-context";
import { useProducts } from "../../hooks/useProducts";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { formatPrice, toTitleCase } from "../../utils/format";
import styles from "./ProductListPage.module.css";

const normalize = (value: string) => value.trim().toLowerCase();

export const ProductListPage = () => {
  const { products, status, error } = useProducts();
  const { items, addItem, incrementItem, decrementItem } = useCart();
  const { filters, setQuery, toggleFilter, clearAll } = useUrlFilters();
  const shimmerItems = Array.from({ length: 8 }, (_, index) => index);
  const currency = products[0]?.currency ?? "INR";
  const hasFilters =
    filters.gender.length > 0 ||
    filters.colour.length > 0 ||
    filters.type.length > 0 ||
    filters.price.length > 0;
  const hasActiveCriteria = hasFilters || filters.query.trim().length > 0;
  const [searchInput, setSearchInput] = useState(filters.query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isEmptyCatalogue = status === "success" && products.length === 0;

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isFilterOpen]);

  const filterOptions = useMemo(() => {
    const gender = new Set<string>();
    const colour = new Set<string>();
    const type = new Set<string>();

    products.forEach((product) => {
      if (product.gender) gender.add(normalize(product.gender));
      if (product.color) colour.add(normalize(product.color));
      if (product.type) type.add(normalize(product.type));
    });

    return {
      gender: Array.from(gender).sort(),
      colour: Array.from(colour).sort(),
      type: Array.from(type).sort(),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const productGender = normalize(product.gender);
      const productColour = normalize(product.color);
      const productType = normalize(product.type);
      const searchTarget =
        `${product.name} ${product.color} ${product.type}`.toLowerCase();

      const matchesSearch =
        terms.length === 0 ||
        terms.every((term) => searchTarget.includes(term));

      const matchesGender =
        filters.gender.length === 0 || filters.gender.includes(productGender);

      const matchesColour =
        filters.colour.length === 0 || filters.colour.includes(productColour);

      const matchesType =
        filters.type.length === 0 || filters.type.includes(productType);

      const matchesPrice =
        filters.price.length === 0 ||
        filters.price.some((range) => {
          const priceRange = PRICE_RANGES.find((item) => item.value === range);
          if (!priceRange) return false;
          return (
            product.price >= priceRange.min && product.price <= priceRange.max
          );
        });

      return (
        matchesSearch &&
        matchesGender &&
        matchesColour &&
        matchesType &&
        matchesPrice
      );
    });
  }, [filters, products]);

  const formatRangeLabel = (min: number, max: number) => {
    if (max === Infinity) {
      return `${formatPrice(min, currency)}+`;
    }
    return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
  };

  const renderFiltersBody = () => (
    <>
      {status === "loading" ? (
        <div className={styles.filterShimmer}>
          {shimmerItems.map((item) => (
            <div key={item} className={styles.filterShimmerLine} />
          ))}
        </div>
      ) : null}

      {status !== "loading" ? (
        <>
          <div className={styles.filterGroup}>
            <h4>Gender</h4>
            {filterOptions.gender.map((value) => (
              <label key={value} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.gender.includes(value)}
                  onChange={() => toggleFilter("gender", value)}
                />
                <span>{toTitleCase(value)}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Colour</h4>
            {filterOptions.colour.map((value) => (
              <label key={value} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.colour.includes(value)}
                  onChange={() => toggleFilter("colour", value)}
                />
                <span>{toTitleCase(value)}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Price range</h4>
            {PRICE_RANGES.map((range) => (
              <label key={range.value} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.price.includes(range.value)}
                  onChange={() => toggleFilter("price", range.value)}
                />
                <span>{formatRangeLabel(range.min, range.max)}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Type</h4>
            {filterOptions.type.map((value) => (
              <label key={value} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.type.includes(value)}
                  onChange={() => toggleFilter("type", value)}
                />
                <span>{toTitleCase(value)}</span>
              </label>
            ))}
          </div>
        </>
      ) : null}
    </>
  );

  return (
    <div
      className={`${styles.pageGrid} ${
        isEmptyCatalogue ? styles.pageGridEmpty : ""
      }`}
    >
      {!isEmptyCatalogue ? (
        <aside className={styles.filtersPanel}>
          <div className={styles.filtersHead}>
            <h2>Filter</h2>
            {hasFilters ? (
              <button
                className={styles.ghostButton}
                onClick={clearAll}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </div>
          {renderFiltersBody()}
        </aside>
      ) : null}

      <main className={styles.catalogGrid}>
        <div className={styles.catalogTop}>
          <div>
            <p className={styles.eyebrow}>Catalogue</p>
            <h2 className={styles.catalogTitle}>T-Shirt Collection</h2>
            <p className={styles.catalogCount}>
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
          {!isEmptyCatalogue ? (
            <div className={styles.catalogActions}>
              <button
                type="button"
                className={`${styles.filterToggle} ${
                  hasFilters ? styles.filterToggleActive : ""
                }`}
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <form
                className={styles.searchBar}
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(searchInput);
                }}
              >
                <InputField
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, colour, type"
                  aria-label="Search catalogue"
                  className={styles.searchInput}
                />
                <button
                  className={`${styles.searchButton} search-button-container`}
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>
          ) : null}
        </div>
        {status === "loading" ? (
          <div className={styles.productGrid}>
            {shimmerItems.map((card) => (
              <div key={card} className={styles.shimmerCard}>
                <div className={styles.shimmerMedia} />
                <div className={styles.shimmerLine} />
                <div className={styles.shimmerLineShort} />
                <div className={styles.shimmerFooter} />
              </div>
            ))}
          </div>
        ) : null}
        {status === "error" ? (
          <div className={`${styles.statusCard} ${styles.statusError}`}>
            {error}
          </div>
        ) : null}
        {isEmptyCatalogue ? (
          <div className={`${styles.statusCard} ${styles.emptyCatalogue}`}>
            No items present right now. Please come back later.
          </div>
        ) : null}
        {status === "success" &&
        products.length > 0 &&
        filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={`${styles.statusCard} ${styles.emptyFilterCard}`}>
              <p>
                No products match the applied filters. Please clear the filters.
              </p>
              {hasActiveCriteria ? (
                <PrimaryButton
                  className={styles.emptyFilterButton}
                  type="button"
                  onClick={clearAll}
                >
                  Clear filters
                </PrimaryButton>
              ) : null}
            </div>
            {hasActiveCriteria ? null : null}
          </div>
        ) : null}
        {status === "success" && filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product, index) => {
              const cartItem = items.find((item) => item.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addItem}
                  onIncrement={incrementItem}
                  onDecrement={decrementItem}
                  cartQty={cartItem?.cartQty ?? 0}
                  index={index}
                />
              );
            })}
          </div>
        ) : null}
      </main>
      {isFilterOpen
        ? createPortal(
            <div
              className={styles.mobileFiltersBackdrop}
              onClick={() => setIsFilterOpen(false)}
            >
              <aside
                className={styles.mobileFiltersPanel}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className={styles.filtersHead}>
                  <h2>Filter</h2>
                  <div className={styles.filtersHeadActions}>
                    {hasFilters ? (
                      <button
                        className={styles.ghostButton}
                        onClick={clearAll}
                        type="button"
                      >
                        Clear filters
                      </button>
                    ) : null}
                    <button
                      className={styles.iconButton}
                      type="button"
                      aria-label="Close filters"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                {renderFiltersBody()}
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
