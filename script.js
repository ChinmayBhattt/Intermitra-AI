const header = document.querySelector("[data-header]");
const filterButtons = document.querySelectorAll("[data-filter]");
const products = document.querySelectorAll(".product-card");
const bag = document.querySelector("[data-bag]");
const openBagButton = document.querySelector("[data-open-bag]");
const closeBagButton = document.querySelector("[data-close-bag]");
const bagItems = document.querySelector("[data-bag-items]");
const bagCount = document.querySelector("[data-bag-count]");
const bagTotal = document.querySelector("[data-bag-total]");
const addButtons = document.querySelectorAll("[data-add-item]");
const checkoutButton = document.querySelector(".checkout-button");

const state = {
  items: [],
};

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 12);
}

function formatPrice(value) {
  return `$${value.toLocaleString("en-US")}`;
}

function renderBag() {
  bagItems.innerHTML = "";

  if (state.items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Your bag is empty.";
    bagItems.append(empty);
  } else {
    state.items.forEach((item) => {
      const line = document.createElement("div");
      line.className = "bag-line";
      line.innerHTML = `
        <div>
          <p>${item.name}</p>
          <span>Drop 01 / ${item.size}</span>
        </div>
        <strong>${formatPrice(item.price)}</strong>
      `;
      bagItems.append(line);
    });
  }

  const total = state.items.reduce((sum, item) => sum + item.price, 0);
  bagCount.textContent = state.items.length;
  bagTotal.textContent = formatPrice(total);
}

function openBag() {
  bag.classList.add("open");
  header.classList.add("open");
  bag.setAttribute("aria-hidden", "false");
  document.body.classList.add("bag-open");
  closeBagButton.focus();
}

function closeBag() {
  bag.classList.remove("open");
  header.classList.remove("open");
  bag.setAttribute("aria-hidden", "true");
  document.body.classList.remove("bag-open");
  openBagButton.focus();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((current) => {
      current.classList.toggle("active", current === button);
    });

    products.forEach((product) => {
      const shouldShow = filter === "all" || product.dataset.category === filter;
      product.classList.toggle("hidden", !shouldShow);
    });
  });
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = {
      name: button.dataset.addItem,
      price: Number(button.dataset.price),
      size: "M reserved",
    };

    state.items.push(item);
    renderBag();

    const originalText = button.textContent;
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = originalText;
    }, 900);

    openBag();
  });
});

openBagButton.addEventListener("click", openBag);
closeBagButton.addEventListener("click", closeBag);

bag.addEventListener("click", (event) => {
  if (event.target === bag) {
    closeBag();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bag.classList.contains("open")) {
    closeBag();
  }
});

checkoutButton.addEventListener("click", () => {
  checkoutButton.textContent = state.items.length ? "Reservation sent" : "Select a piece";
  window.setTimeout(() => {
    checkoutButton.textContent = "Reserve pieces";
  }, 1200);
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
renderBag();
