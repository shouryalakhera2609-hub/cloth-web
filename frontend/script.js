const API = window.API_URL || '/api';

(function startWelcomeSplash() {
  const splash = document.getElementById('welcome-splash');
  const countdown = document.getElementById('splash-countdown');
  const ring = splash?.querySelector('.countdown-ring');
  if (!splash || !countdown || !ring) return;

  let seconds = 5;
  countdown.textContent = seconds;
  ring.setAttribute('aria-label', `Opening in ${seconds} seconds`);

  const preventSplashZoom = (event) => {
    if (event.touches?.length > 1 || event.scale && event.scale !== 1) event.preventDefault();
  };
  splash.addEventListener('touchmove', preventSplashZoom, { passive: false });
  splash.addEventListener('gesturestart', preventSplashZoom, { passive: false });
  splash.addEventListener('gesturechange', preventSplashZoom, { passive: false });
  splash.addEventListener('gestureend', preventSplashZoom, { passive: false });

  const timer = window.setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      countdown.textContent = seconds;
      ring.setAttribute('aria-label', `Opening in ${seconds} seconds`);
      countdown.classList.remove('count-pop');
      void countdown.offsetWidth;
      countdown.classList.add('count-pop');
      return;
    }

    window.clearInterval(timer);
    countdown.textContent = '0';
    ring.setAttribute('aria-label', 'Opening now');
    window.setTimeout(() => {
      splash.removeEventListener('touchmove', preventSplashZoom);
      splash.removeEventListener('gesturestart', preventSplashZoom);
      splash.removeEventListener('gesturechange', preventSplashZoom);
      splash.removeEventListener('gestureend', preventSplashZoom);
      splash.classList.add('is-hidden');
      document.body.classList.remove('splash-active');
      window.setTimeout(() => splash.remove(), 700);
    }, 350);
  }, 1000);
})();

function optimizedCloudinaryUrl(url) {
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto:good,c_limit,w_1200,dpr_auto/');
}

const form = document.getElementById('item-form');
const submitBtn = document.getElementById('submit-btn');
const itemsEl = document.getElementById('items');
const errorEl = document.getElementById('error');
const searchEl = document.getElementById('search');
const categoryFilters = document.getElementById('category-filters');
const categorySelect = document.getElementById('category');

let allItems = [];
let displayItems = [];
let categories = [];
let activeCategory = 'all';

function renderCategoryControls() {
  categoryFilters.replaceChildren();
  const allButton = document.createElement('button');
  allButton.className = `filter-button${activeCategory === 'all' ? ' active' : ''}`;
  allButton.type = 'button';
  allButton.dataset.category = 'all';
  allButton.setAttribute('aria-pressed', String(activeCategory === 'all'));
  allButton.textContent = 'All';
  categoryFilters.appendChild(allButton);

  categorySelect.replaceChildren();
  for (const category of categories) {
    const filterButton = document.createElement('button');
    filterButton.className = `filter-button${activeCategory === category.slug ? ' active' : ''}`;
    filterButton.type = 'button';
    filterButton.dataset.category = category.slug;
    filterButton.setAttribute('aria-pressed', String(activeCategory === category.slug));
    filterButton.textContent = category.name;
    categoryFilters.appendChild(filterButton);

    const option = document.createElement('option');
    option.value = category.slug;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  }

  for (const button of categoryFilters.querySelectorAll('.filter-button')) {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      for (const filterButton of categoryFilters.querySelectorAll('.filter-button')) {
        const isActive = filterButton === button;
        filterButton.classList.toggle('active', isActive);
        filterButton.setAttribute('aria-pressed', String(isActive));
      }
      render();
    });
  }
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function createFreshLayout(items) {
  displayItems = shuffleItems(items);
  const previousLayout = sessionStorage.getItem('collection-layout-order');
  const currentLayout = displayItems.map((item) => item._id || item.productNumber).join('|');

  if (previousLayout && previousLayout === currentLayout && displayItems.length > 1) {
    displayItems = shuffleItems(displayItems);
  }
  sessionStorage.setItem('collection-layout-order', displayItems.map((item) => item._id || item.productNumber).join('|'));
}

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showError(message) {
  errorEl.textContent = message || '';
}

function render() {
  const search = searchEl.value.trim().toLowerCase();
  const visibleItems = displayItems.filter((item) => {
    const searchableText = `${item.title} ${item.description || ''} ${item.category || ''}`.toLowerCase();
    const matchesSearch = searchableText.includes(search);
    const matchesCategory = activeCategory === 'all' || String(item.category || '').toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  itemsEl.replaceChildren();
  if (visibleItems.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = allItems.length === 0
      ? 'Our collection is getting ready. Upload a product to display it here.'
      : 'No products found. Try another search or category.';
    itemsEl.appendChild(emptyMessage);
    return;
  }

  for (const [index, item] of visibleItems.entries()) {
    const card = document.createElement('article');
    card.className = `product-card layout-${Math.floor(Math.random() * 6)}`;
    card.style.setProperty('--card-delay', `${Math.min(index * 45, 300)}ms`);

    if (item.image && item.image.url) {
      const image = document.createElement('img');
      image.className = 'product-card-image';
      image.src = optimizedCloudinaryUrl(item.image.url);
      image.alt = item.title || item.category || 'Product photo';
      image.loading = 'lazy';
      image.decoding = 'async';
      const imagePositions = ['50% 50%', '50% 35%', '50% 65%', '35% 50%', '65% 50%', '40% 40%', '60% 60%'];
      image.style.objectPosition = imagePositions[Math.floor(Math.random() * imagePositions.length)];
      card.appendChild(image);
    } else {
      const imagePlaceholder = document.createElement('div');
      imagePlaceholder.className = 'image-placeholder';
      imagePlaceholder.textContent = 'Photo coming soon';
      card.appendChild(imagePlaceholder);
    }

    const details = document.createElement('div');
    details.className = 'product-details';

    if (item.title) {
      const title = document.createElement('h3');
      title.textContent = item.title;
      details.appendChild(title);
    }

    const metadata = document.createElement('div');
    metadata.className = 'product-meta';

    const category = document.createElement('span');
    category.textContent = `Category: ${item.category || 'General'}`;
    metadata.appendChild(category);

    const productNumber = document.createElement('span');
    productNumber.textContent = `Product No.: ${item.productNumber || '-'}`;
    metadata.appendChild(productNumber);

    const price = document.createElement('span');
    price.textContent = `Price: ₹${Number(item.price || 0).toFixed(2)}`;
    metadata.appendChild(price);
    details.appendChild(metadata);

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'product-description';
      description.textContent = item.description;
      details.appendChild(description);
    }

    const buyButton = document.createElement('button');
    buyButton.className = 'buy-now-button';
    buyButton.type = 'button';
    buyButton.textContent = 'Buy Now';
    buyButton.addEventListener('click', () => {
      const productName = document.getElementById('buy-product-name');
      productName.textContent = item.title ? `Interested in: ${item.title}` : 'Interested in this product?';
      document.getElementById('buy-dialog').showModal();
    });
    details.appendChild(buyButton);

    if (isLoggedIn) {
      const actions = document.createElement('div');
      actions.className = 'product-actions';

      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => openEditProduct(item));
      actions.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Remove';
      deleteButton.addEventListener('click', async () => {
        try {
          await request('/items/' + item._id, { method: 'DELETE' });
          await loadItems();
        } catch (error) {
          showError(error.message);
        }
      });
      actions.appendChild(deleteButton);
      details.appendChild(actions);
    }
    card.appendChild(details);
    itemsEl.appendChild(card);
  }
}

async function loadItems() {
  try {
    allItems = await request('/items');
    createFreshLayout(allItems);
    render();
  } catch (error) {
    showError(error.message);
  }
}

async function loadCategories() {
  try {
    categories = await request('/categories');
    renderCategoryControls();
  } catch (error) {
    showError(error.message);
  }
}

searchEl.addEventListener('input', render);

async function compressImage(file) {
  const image = await new Promise((resolve, reject) => {
    const loader = new Image();
    loader.onload = () => resolve(loader);
    loader.onerror = reject;
    loader.src = URL.createObjectURL(file);
  });

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.92;
  let width = canvas.width;
  let height = canvas.height;
  let blob;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= 300 * 1024 && blob.size >= 200 * 1024) break;
    if (blob && blob.size > 300 * 1024) {
      quality = Math.max(0.55, quality - 0.08);
      width = Math.round(width * 0.9);
      height = Math.round(height * 0.9);
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
    } else if (blob && blob.size < 200 * 1024) {
      break;
    }
  }

  if (!blob || blob.size > 300 * 1024) {
    throw new Error('Photo 300 KB se kam nahi ho paayi. Dusri photo choose karein.');
  }
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}

const buyDialog = document.getElementById('buy-dialog');
buyDialog.querySelector('.buy-dialog-close').addEventListener('click', () => buyDialog.close());
buyDialog.querySelector('.buy-dialog-close-action').addEventListener('click', () => buyDialog.close());
buyDialog.addEventListener('click', (event) => {
  if (event.target === buyDialog) buyDialog.close();
});

const productDialog = document.getElementById('product-dialog');
const addProductButton = document.getElementById('add-product-button');
const addCategoryButton = document.getElementById('add-category-button');
const categoryDialog = document.getElementById('category-dialog');
const categoryForm = document.getElementById('category-form');
const categoryError = document.getElementById('category-error');
const productNumberInput = document.getElementById('product-number');
let editingProductId = null;

function resetProductForm() {
  form.reset();
  editingProductId = null;
  productDialog.querySelector('h2').textContent = 'Add Product';
  submitBtn.textContent = 'Add to collection';
  document.getElementById('product-error').textContent = '';
}

function openEditProduct(item) {
  editingProductId = item._id;
  form.title.value = item.title || '';
  if (item.category && categorySelect.querySelector(`option[value="${CSS.escape(item.category)}"]`)) {
    form.category.value = item.category;
  } else if (categorySelect.options.length) {
    form.category.value = categorySelect.options[0].value;
  }
  productNumberInput.value = item.productNumber || '';
  form.price.value = item.price || '';
  form.description.value = item.description || '';
  form.image.value = '';
  productDialog.querySelector('h2').textContent = 'Edit Product';
  submitBtn.textContent = 'Save changes';
  document.getElementById('product-error').textContent = '';
  productDialog.showModal();
}

addProductButton.addEventListener('click', async () => {
  resetProductForm();
  const latestNumber = allItems.reduce((maximum, item) => Math.max(maximum, Number(item.productNumber) || 0), 0);
  productNumberInput.value = latestNumber + 1;
  productDialog.showModal();
});

addCategoryButton.addEventListener('click', () => {
  categoryError.textContent = '';
  categoryForm.reset();
  categoryDialog.showModal();
});
document.getElementById('category-dialog-close').addEventListener('click', () => categoryDialog.close());
categoryDialog.addEventListener('click', (event) => {
  if (event.target === categoryDialog) categoryDialog.close();
});
categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  categoryError.textContent = '';
  const submitButton = document.getElementById('category-submit');
  submitButton.disabled = true;
  try {
    await request('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryForm.name.value }),
    });
    categoryDialog.close();
    await loadCategories();
  } catch (error) {
    categoryError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

productDialog.querySelector('.product-dialog-close').addEventListener('click', () => productDialog.close());

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Optimizing & uploading...';
  try {
    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('description', form.description.value);
    formData.append('category', form.category.value);
    formData.append('productNumber', form.productNumber.value);
    formData.append('price', form.price.value);
    if (form.image.files[0]) {
      const optimizedImage = await compressImage(form.image.files[0]);
      formData.append('image', optimizedImage);
    } else if (!editingProductId) {
      throw new Error('Product photo required hai');
    }
    await request(editingProductId ? `/items/${editingProductId}` : '/items', {
      method: editingProductId ? 'PUT' : 'POST',
      body: formData,
    });
    resetProductForm();
    productDialog.close();
    await loadItems();
  } catch (error) {
    showError(error.message);
    const dialogError = document.getElementById('product-error');
    if (dialogError) dialogError.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingProductId ? 'Save changes' : 'Add to collection';
  }
});

const signinButton = document.getElementById('signin-button');
const loginDialog = document.getElementById('login-dialog');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
let isLoggedIn = false;

function setAuthState(loggedIn) {
  isLoggedIn = loggedIn;
  addProductButton.hidden = !loggedIn;
  addCategoryButton.hidden = !loggedIn;
  signinButton.querySelector('span').textContent = loggedIn ? 'Logout' : 'Sign in';
  signinButton.setAttribute('aria-label', loggedIn ? 'Logout' : 'Google sign in');
  render();
}

async function checkLoginSession() {
  try {
    const result = await request('/auth/me');
    setAuthState(Boolean(result.loggedIn));
  } catch (error) {
    setAuthState(false);
  }
}

signinButton.addEventListener('click', async () => {
  if (isLoggedIn) {
    try {
      await request('/auth/logout', { method: 'POST' });
      setAuthState(false);
    } catch (error) {
      showError(error.message);
    }
    return;
  }

  loginError.textContent = '';
  loginDialog.showModal();
});

loginDialog.querySelector('.dialog-close').addEventListener('click', () => loginDialog.close());

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  try {
    await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginForm.email.value,
        password: loginForm.password.value,
      }),
    });
    loginDialog.close();
    loginForm.reset();
    setAuthState(true);
  } catch (error) {
    loginError.textContent = error.message;
  }
});

checkLoginSession().finally(async () => {
  await Promise.all([loadCategories(), loadItems()]);
});
