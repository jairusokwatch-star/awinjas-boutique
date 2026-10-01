const products = [
  {
    id: "after-hours",
    name: "After Hours Dress",
    category: "Dresses",
    price: 3850,
    tag: "The occasion edit",
    description: "A little drama, all the right reasons.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    alt: "Flowing red occasion dress"
  },
  {
    id: "soft-focus",
    name: "Soft Focus Set",
    category: "Sets",
    price: 4200,
    tag: "Easy together",
    description: "Two pieces, one very good outfit.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    alt: "Modern coordinated fashion set"
  },
  {
    id: "sunday-best",
    name: "Sunday Best",
    category: "Dresses",
    price: 3400,
    tag: "A little lovely",
    description: "For slow mornings and long lunches.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    alt: "Woman in an elegant everyday dress"
  },
  {
    id: "the-everyday",
    name: "The Everyday Edit",
    category: "Everyday",
    price: 2950,
    tag: "Wear on repeat",
    description: "Your favourite plan is no plan.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    alt: "Friends browsing a clothing boutique"
  }
];

const phone = "254702256455";
const grid = document.querySelector(".product-grid");
const bagCount = document.querySelector(".bag-count");
const bagDrawer = document.querySelector(".bag-drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const bagItems = document.querySelector(".bag-items");
const bagEmpty = document.querySelector(".bag-empty");
const drawerFooter = document.querySelector(".drawer-footer");
const formatPrice = (price) => `KSh ${price.toLocaleString("en-KE")}`;
let activeFilter = "All";
let bag = readBag();

function readBag() {
  try {
    return JSON.parse(localStorage.getItem("awinjas-bag") || "{}");
  } catch {
    return {};
  }
}

function saveBag() {
  try {
    localStorage.setItem("awinjas-bag", JSON.stringify(bag));
  } catch {
    // Keep the bag usable when browser storage is unavailable.
  }
}

function renderProducts() {
  const visibleProducts = products.filter((product) => activeFilter === "All" || product.category === activeFilter);
  grid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 55}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy" />
        <span class="product-tag">${product.tag}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button>
      </div>
      <div class="product-meta"><h3 class="product-name">${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
      <p class="product-description">${product.description}</p>
    </article>`).join("");
}

function renderBag() {
  const entries = Object.entries(bag).filter(([, quantity]) => quantity > 0);
  const totalQuantity = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const totalPrice = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  bagCount.textContent = totalQuantity;
  bagEmpty.hidden = entries.length > 0;
  drawerFooter.hidden = entries.length === 0;
  bagItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `<article class="bag-row">
      <img src="${product.image}" alt="" />
      <div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-quantity="${id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
          <span>${quantity}</span>
          <button type="button" data-quantity="${id}" data-change="1" aria-label="Add one ${product.name}">+</button>
        </div>
      </div><span class="bag-row-price">${formatPrice(product.price * quantity)}</span>
    </article>`;
  }).join("");

  document.querySelector(".bag-subtotal strong").textContent = formatPrice(totalPrice);
  const orderLines = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `${quantity} x ${product.name} (${formatPrice(product.price * quantity)})`;
  });
  const message = encodeURIComponent(`Hello Awinjas Boutique! I'd like to order:\n${orderLines.join("\n")}\nSubtotal: ${formatPrice(totalPrice)}\nPlease confirm available sizes and delivery.`);
  document.querySelector(".checkout-link").href = `https://wa.me/${phone}?text=${message}`;
}

function setBagOpen(open) {
  bagDrawer.hidden = !open;
  backdrop.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) document.querySelector(".close-bag").focus();
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.navCategory;
    document.querySelector(`[data-filter="${activeFilter}"]`).click();
  });
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  bag[id] = (bag[id] || 0) + 1;
  saveBag();
  renderBag();
  button.textContent = "✓";
  window.setTimeout(() => { button.textContent = "+"; }, 850);
});

bagItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = button.dataset.quantity;
  bag[id] = (bag[id] || 0) + Number(button.dataset.change);
  if (bag[id] <= 0) delete bag[id];
  saveBag();
  renderBag();
});

document.querySelector(".bag-button").addEventListener("click", () => setBagOpen(true));
document.querySelector(".close-bag").addEventListener("click", () => setBagOpen(false));
backdrop.addEventListener("click", () => setBagOpen(false));
document.querySelector(".continue-shopping").addEventListener("click", () => setBagOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !bagDrawer.hidden) setBagOpen(false);
});

renderProducts();
renderBag();