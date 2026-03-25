import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { PrimaryButton } from "../button/PrimaryButton";
import { Counter } from "../counter/Counter";
import styles from "./ProductCard.module.css";

export const ProductCard = ({
  product,
  onAdd,
  onIncrement,
  onDecrement,
  cartQty = 0,
  index = 0,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onIncrement: (id: Product["id"]) => void;
  onDecrement: (id: Product["id"]) => void;
  cartQty?: number;
  index?: number;
}) => {
  const isOutOfStock = product.quantity <= 0;

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={styles.media}>
        <img
          className={styles.image}
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        {isOutOfStock ? (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            Out of stock
          </span>
        ) : null}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>{product.type}</div>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.sub}>
          {product.color} / {product.gender}
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.price, product.currency)}
          </span>
          {cartQty > 0 ? (
            <Counter
              value={cartQty}
              onDecrement={() => onDecrement(product.id)}
              onIncrement={() => onIncrement(product.id)}
              decrementLabel={`Decrease ${product.name} quantity`}
              incrementLabel={`Increase ${product.name} quantity`}
            />
          ) : (
            <PrimaryButton
              className={styles.addButton}
              onClick={() => onAdd(product)}
              disabled={isOutOfStock}
            >
              Add to Cart
            </PrimaryButton>
          )}
        </div>
      </div>
    </article>
  );
};
