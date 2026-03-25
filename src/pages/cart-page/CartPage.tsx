import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/cart-context";
import { formatPrice } from "../../utils/format";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { InputField } from "../../components/input/InputField";
import { Counter } from "../../components/counter/Counter";
import checkoutVideo from "../../assets/videos/video.mp4";
import styles from "./CartPage.module.css";

export const CartPage = () => {
  const {
    items,
    totalAmount,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState<
    "starting" | "video" | "clearing" | "success" | null
  >(null);

  const hasItems = items.length > 0;
  const currency = items[0]?.currency ?? "INR";
  const subtotal = totalAmount;
  const discount = subtotal * discountRate;
  const interimTotal = subtotal - discount;
  const baseShipping = currency === "INR" ? 49 : 0;
  const shippingFee =
    hasItems && currency === "INR" && interimTotal > 0 && interimTotal <= 499
      ? 49
      : 0;
  const isFreeShipping = hasItems && baseShipping > 0 && shippingFee === 0;
  const grandTotal = interimTotal + shippingFee;

  const handleApplyCoupon = () => {
    const normalized = couponCode.trim().toLowerCase();
    if (normalized === "zeesh30") {
      setDiscountRate(0.3);
      setAppliedCoupon("zeesh30");
      setCouponError(null);
      setCouponSuccess("Coupon applied, enjoy the offer.");
      return;
    }
    setDiscountRate(0);
    setAppliedCoupon(null);
    setCouponSuccess(null);
    if (normalized.length > 0) {
      setCouponError(
        "No coupons present for that coupon code. Please try again with other codes.",
      );
    } else {
      setCouponError(null);
    }
  };

  const handleCheckout = () => {
    setCheckoutStage("starting");
  };

  useEffect(() => {
    if (!checkoutStage) return;
    let timer: number | null = null;
    if (checkoutStage === "starting") {
      timer = window.setTimeout(() => setCheckoutStage("video"), 3000);
    }
    if (checkoutStage === "video") {
      timer = window.setTimeout(() => setCheckoutStage("clearing"), 10000);
    }
    if (checkoutStage === "clearing") {
      clearCart();
      timer = window.setTimeout(() => setCheckoutStage("success"), 2000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [checkoutStage, clearCart]);
  const summaryDetails = (
    <>
      <div className={styles.couponRow}>
        <InputField
          className={styles.couponInput}
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleApplyCoupon();
            }
          }}
          placeholder="Enter coupon code"
          aria-label="Coupon code"
        />
        <PrimaryButton
          className={styles.applyButton}
          type="button"
          onClick={handleApplyCoupon}
        >
          Apply
        </PrimaryButton>
      </div>
      <div className={styles.couponHint}>Try: zeesh30 for 30% off</div>
      {couponSuccess ? (
        <div className={styles.couponSuccess}>{couponSuccess}</div>
      ) : null}
      {couponError ? (
        <div className={styles.couponError}>{couponError}</div>
      ) : null}
      <div className={styles.summaryDivider} />
      <div className={styles.summaryLine}>
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal, currency)}</strong>
      </div>
      {appliedCoupon ? (
        <div className={styles.summaryLine}>
          <span>Discount ({appliedCoupon.toUpperCase()})</span>
          <strong>-{formatPrice(discount, currency)}</strong>
        </div>
      ) : null}
      <div className={styles.summaryLine}>
        <span>Shipping</span>
        {isFreeShipping ? (
          <span className={styles.shippingFree}>
            <span className={styles.shippingStriked}>
              {formatPrice(baseShipping, currency)}
            </span>
            <strong>Free</strong>
          </span>
        ) : (
          <strong>{formatPrice(shippingFee, currency)}</strong>
        )}
      </div>
      <div className={styles.summaryDivider} />
      <div className={styles.summaryLine}>
        <span>Total</span>
        <strong>{formatPrice(grandTotal, currency)}</strong>
      </div>
    </>
  );

  return (
    <div className={styles.appShell}>
      <section className={styles.cartHeader}>
        <div>
          <p className={styles.eyebrow}>Shopping Cart</p>
          <h1>Your Checkout</h1>
          <p className={styles.subtle}>
            Review and adjust quantities before checkout.
          </p>
        </div>
        {hasItems ? (
          <button
            className={styles.ghostButton}
            onClick={clearCart}
            type="button"
          >
            Clear cart
          </button>
        ) : null}
      </section>

      <div
        className={`${styles.cartLayout} ${
          !hasItems ? styles.cartLayoutEmpty : ""
        }`}
      >
        <div className={styles.cartItems}>
          {items.length === 0 ? (
            <div className={`${styles.statusCard} ${styles.emptyCartCard}`}>
              <p>{`Your cart is currently empty :(`}</p>
              <PrimaryButton
                as={NavLink}
                to="/"
                className={styles.emptyCartButton}
              >
                Browse products
              </PrimaryButton>
            </div>
          ) : null}
          {items.map((item, index) => (
            <article
              key={item.id}
              className={styles.cartItem}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <img src={item.image} alt={item.name} />
              <div className={styles.cartInfo}>
                <div className={styles.cartTitle}>
                  <h3>{item.name}</h3>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <p className={styles.cartSub}>
                  {item.type} / {item.color} / {item.gender}
                </p>
                <p className={styles.cartStock}>In stock: {item.stock}</p>
                <div className={styles.cartControls}>
                  <Counter
                    value={item.cartQty}
                    onDecrement={() => decrementItem(item.id)}
                    onIncrement={() => incrementItem(item.id)}
                    decrementLabel={`Decrease ${item.name} quantity`}
                    incrementLabel={`Increase ${item.name} quantity`}
                  />
                  <span className={styles.cartPrice}>
                    {formatPrice(item.price * item.cartQty, item.currency)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {hasItems ? (
          <aside className={styles.cartSummary}>
            <div className={styles.summaryCard}>
              <h2>Order summary</h2>
              {summaryDetails}
              <PrimaryButton
                className={styles.checkoutButton}
                type="button"
                onClick={handleCheckout}
              >
                Proceed to checkout
              </PrimaryButton>
            </div>
            <div className={styles.summaryNote}>
              Delivery within 3-5 working days. Free returns within 30 days.
            </div>
          </aside>
        ) : null}
      </div>

      {hasItems
        ? createPortal(
            <>
              {isSummaryOpen ? (
                <div
                  className={styles.mobileSummaryOverlay}
                  onClick={() => setIsSummaryOpen(false)}
                />
              ) : null}
              <div
                className={`${styles.mobileSummary} ${
                  isSummaryOpen ? styles.mobileSummaryOpen : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.mobileSummaryHandle}
                  onClick={() => setIsSummaryOpen((prev) => !prev)}
                  aria-expanded={isSummaryOpen}
                >
                  <span className={styles.handleBar} />
                </button>
                <div className={styles.mobileSummaryTop}>
                  <div className={styles.mobileSummaryTitleGroup}>
                    <span className={styles.mobileSummaryTitle}>
                      Order summary
                    </span>
                    {!isSummaryOpen ? (
                      <span className={styles.mobileSummaryTotal}>
                        {formatPrice(grandTotal, currency)}
                      </span>
                    ) : null}
                  </div>
                  {!isSummaryOpen ? (
                    <PrimaryButton
                      className={`${styles.mobileCheckoutButton} ${styles.mobileCheckoutButtonCompact}`}
                      type="button"
                      onClick={handleCheckout}
                    >
                      Proceed to checkout
                    </PrimaryButton>
                  ) : null}
                </div>
                <div className={styles.mobileSummaryBody}>
                  {summaryDetails}
                  {isSummaryOpen ? (
                    <PrimaryButton
                      className={styles.mobileCheckoutButton}
                      type="button"
                      onClick={handleCheckout}
                    >
                      Proceed to checkout
                    </PrimaryButton>
                  ) : null}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
      {checkoutStage
        ? createPortal(
            <div
              className={styles.checkoutOverlay}
              role="dialog"
              aria-modal="true"
            >
              <div className={styles.checkoutModal}>
                {checkoutStage === "starting" ? (
                  <div className={styles.checkoutMessage}>
                    <h3>Placing your order</h3>
                    <p>Please don’t close or refresh.</p>
                    <span
                      className={styles.checkoutSpinner}
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
                {checkoutStage === "video" ? (
                  <>
                    <div className={styles.videoFrame}>
                      <video
                        src={checkoutVideo}
                        autoPlay
                        controls
                        playsInline
                      />
                    </div>
                    <p className={styles.videoHint}>
                      Watching for 10 seconds to confirm your order...
                    </p>
                  </>
                ) : null}
                {checkoutStage === "clearing" ? (
                  <div className={styles.checkoutMessage}>
                    <h3>Clearing your cart</h3>
                    <p>Finalizing your order details.</p>
                    <span
                      className={styles.checkoutSpinner}
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
                {checkoutStage === "success" ? (
                  <div className={styles.successState}>
                    <h3>Order placed successfully</h3>
                    <p>Thanks for shopping with us!</p>
                    <PrimaryButton
                      as={NavLink}
                      to="/"
                      className={styles.successButton}
                      onClick={() => setCheckoutStage(null)}
                    >
                      Continue shopping
                    </PrimaryButton>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
