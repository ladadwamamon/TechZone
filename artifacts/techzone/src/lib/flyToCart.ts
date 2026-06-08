const CART_ICON_ID = "nav-cart-icon";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function flyToCart(imageUrl: string, source: HTMLElement | DOMRect): void {
  if (typeof document === "undefined") return;

  const fireBump = () => window.dispatchEvent(new Event("cart-bump"));

  const target = document.getElementById(CART_ICON_ID);
  if (!target || prefersReducedMotion() || !imageUrl) {
    fireBump();
    return;
  }

  const sourceRect = source instanceof HTMLElement ? source.getBoundingClientRect() : source;
  const targetRect = target.getBoundingClientRect();

  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const size = 72;
  const el = document.createElement("img");
  el.src = imageUrl;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    left: `${startX - size / 2}px`,
    top: `${startY - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "contain",
    pointerEvents: "none",
    zIndex: "9999",
    borderRadius: "4px",
    border: "1px solid var(--cyan, #00e5ff)",
    boxShadow: "0 0 22px rgba(0,229,255,0.85), inset 0 0 12px rgba(0,229,255,0.4)",
    background: "rgba(2,8,18,0.55)",
    padding: "4px",
    mixBlendMode: "screen",
    willChange: "transform, opacity",
  } as Partial<CSSStyleDeclaration>);

  document.body.appendChild(el);

  const dx = endX - startX;
  const dy = endY - startY;

  const anim = el.animate(
    [
      { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(0.85) rotate(-8deg)`,
        opacity: 0.95,
        offset: 0.6,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.15) rotate(6deg)`,
        opacity: 0.25,
      },
    ],
    { duration: 760, easing: "cubic-bezier(0.45, -0.25, 0.7, 1)" },
  );

  const cleanup = () => {
    el.remove();
    fireBump();
  };
  anim.onfinish = cleanup;
  anim.oncancel = cleanup;
}
