import { ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/cart-context";
import styles from "./Header.module.css";

type HeaderProps = {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
};

export const Header = ({
  showSearch,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) => {
  const { totalItems } = useCart();
  return (
    <header className={styles.topbar}>
      <NavLink to="/" className={styles.brand}>
        Gulzeesh
      </NavLink>
      <div className={styles.navSpacer} aria-hidden="true" />
      <div className={styles.headerActions}>
        {showSearch ? (
          <form
            className={styles.searchBar}
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit?.();
            }}
          >
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
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
        ) : null}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive
              ? `${styles.cartLink} ${styles.cartLinkActive}`
              : styles.cartLink
          }
          aria-label="Shopping cart"
        >
          <span className={styles.cartIcon} aria-hidden>
            <ShoppingCart size={18} strokeWidth={2} />
          </span>
          <span>Cart</span>
          <span className={styles.cartCount}>{totalItems}</span>
        </NavLink>
      </div>
    </header>
  );
};
