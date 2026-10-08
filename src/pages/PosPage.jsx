import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TAX_RATE = 0.05;

// ─── Shared primitives ───────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div
        className="h-6 w-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin"
        aria-label="Loading"
      />
    </div>
  );
}

function Alert({ msg }) {
  if (!msg) return null;

  return (
    <div
      role="alert"
      className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
    >
      {msg}
    </div>
  );
}

// ─── Receipt modal ───────────────────────────────────────────────────────────

function ReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Sale Complete
          </h3>

          <p className="text-xs text-gray-500">
            Transaction #{transaction.id}
          </p>

          <p className="text-xs text-gray-400">
            {new Date(transaction.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2 border-y border-dashed border-gray-200 py-3">
          {transaction.TransactionItems?.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-3 text-sm"
            >
              <span className="text-gray-700">
                {item.Product?.name ?? `Item #${item.productId}`}
                {' × '}
                {item.quantity}
              </span>

              <span className="text-gray-900">
                $
                {(
                  Number(item.unitPrice) * Number(item.quantity)
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>
              ${Number(transaction.subtotal).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>
              ${Number(transaction.tax).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between pt-1 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>
              ${Number(transaction.total).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          New Sale
        </button>
      </div>
    </div>
  );
}

// ─── Recent sales ────────────────────────────────────────────────────────────

function RecentSales({ refreshKey }) {
  const [open, setOpen] = useState(false);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    setLoading(true);
    setError('');

    api
      .get('/transactions/my')
      .then((response) => {
        if (!cancelled) {
          setSales(response.data ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.error ??
              err.message ??
              'Failed to load sales'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, refreshKey]);

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>My Recent Sales</span>

        <span className="text-gray-400">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3">
          <Alert msg={error} />

          {loading ? (
            <Spinner />
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {!sales.length && (
                <p className="py-4 text-center text-sm text-gray-400">
                  No sales yet
                </p>
              )}

              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between gap-4 border-b border-gray-50 py-2 last:border-0"
                >
                  <span className="text-sm text-gray-600">
                    {new Date(sale.createdAt).toLocaleString()}
                    {' · '}
                    {sale.TransactionItems?.length ?? 0} item(s)
                  </span>

                  <span className="whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(sale.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── POS Page ────────────────────────────────────────────────────────────────

export default function PosPage() {
  const { fullName, logout } = useAuth();

  const [cart, setCart] = useState([]);

  const [skuInput, setSkuInput] = useState('');
  const [scanErr, setScanErr] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [cartErr, setCartErr] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const [receipt, setReceipt] = useState(null);
  const [salesRefreshKey, setSalesRefreshKey] = useState(0);

  const skuInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Keep scanner input focused
  useEffect(() => {
    skuInputRef.current?.focus();

    return () => {
      clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // ─── Cart ─────────────────────────────────────────────────────────────────

  function addToCart(product) {
    const stock = Number(product.quantityInStock);

    if (stock < 1) {
      setCartErr(`"${product.name}" is out of stock.`);
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        if (existing.quantity + 1 > stock) {
          setCartErr(
            `Insufficient stock for "${product.name}". Only ${stock} available.`
          );

          return previousCart;
        }

        setCartErr('');

        return previousCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      setCartErr('');

      return [
        ...previousCart,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          stock,
        },
      ];
    });
  }

  function updateQuantity(productId, delta) {
    setCart((previousCart) => {
      const item = previousCart.find(
        (cartItem) => cartItem.productId === productId
      );

      if (!item) return previousCart;

      const nextQuantity = item.quantity + delta;

      if (nextQuantity < 1) {
        return previousCart.filter(
          (cartItem) => cartItem.productId !== productId
        );
      }

      if (nextQuantity > item.stock) {
        setCartErr(
          `Insufficient stock for "${item.name}". Only ${item.stock} available.`
        );

        return previousCart;
      }

      setCartErr('');

      return previousCart.map((cartItem) =>
        cartItem.productId === productId
          ? {
              ...cartItem,
              quantity: nextQuantity,
            }
          : cartItem
      );
    });
  }

  function removeItem(productId) {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.productId !== productId
      )
    );

    setCartErr('');
  }

  function clearCart() {
    setCart([]);
    setCartErr('');
  }

  // ─── SKU scanner ──────────────────────────────────────────────────────────

  async function handleScan(e) {
    e.preventDefault();

    const sku = skuInput.trim();

    if (!sku) return;

    setScanErr('');

    try {
      const response = await api.get('/products', {
        params: { sku },
      });

      const products = response.data ?? [];

      const exactProduct = products.find(
        (product) =>
          product.sku?.toLowerCase() === sku.toLowerCase()
      );

      if (!exactProduct) {
        setScanErr(`No product found for SKU "${sku}".`);
        return;
      }

      addToCart(exactProduct);
    } catch (err) {
      setScanErr(
        err.response?.data?.error ??
          err.message ??
          'Product lookup failed.'
      );
    } finally {
      setSkuInput('');

      setTimeout(() => {
        skuInputRef.current?.focus();
      }, 0);
    }
  }

  // ─── Product search ───────────────────────────────────────────────────────

  function handleSearchChange(value) {
    setSearchTerm(value);

    clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);

      try {
        const response = await api.get('/products', {
          params: {
            name: value.trim(),
          },
        });

        setSearchResults(response.data ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  // ─── Checkout ─────────────────────────────────────────────────────────────

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  async function handleCheckout() {
    if (!cart.length || checkingOut) return;

    setCartErr('');
    setCheckingOut(true);

    try {
      const response = await api.post('/transactions', {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      setReceipt(response.data);
      setCart([]);

      setSearchTerm('');
      setSearchResults([]);

      setSalesRefreshKey((key) => key + 1);
    } catch (err) {
      setCartErr(
        err.response?.data?.error ??
          err.message ??
          'Checkout failed.'
      );
    } finally {
      setCheckingOut(false);

      setTimeout(() => {
        skuInputRef.current?.focus();
      }, 0);
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            POS Terminal
          </h1>

          {fullName && (
            <p className="text-sm text-gray-500">
              Welcome, {fullName}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          Sign out
        </button>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">

        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">

          {/* LEFT SIDE */}
          <div className="md:col-span-3">

            {/* SKU Scanner */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Scan / Enter SKU
              </h2>

              <Alert msg={scanErr} />

              <form
                onSubmit={handleScan}
                className="flex gap-2"
              >
                <input
                  ref={skuInputRef}
                  type="text"
                  value={skuInput}
                  onChange={(e) =>
                    setSkuInput(e.target.value)
                  }
                  placeholder="Scan or type SKU, then press Enter"
                  autoComplete="off"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Search */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Search by Name
              </h2>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
                placeholder="Type a product name..."
                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              {searching && <Spinner />}

              {!searching &&
                searchTerm &&
                searchResults.length === 0 && (
                  <p className="py-2 text-center text-sm text-gray-400">
                    No products found
                  </p>
                )}

              <div className="max-h-72 space-y-1 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={
                      Number(product.quantityInStock) < 1
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {product.imageUrl ? (
                      <img
                        src={`http://localhost:5000${product.imageUrl}`}
                        alt={product.name}
                        className="h-9 w-9 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                        —
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {product.sku} · $
                        {Number(product.price).toFixed(2)} ·
                        stock {product.quantityInStock}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-violet-600">
                      Add
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent sales */}
            <RecentSales
              refreshKey={salesRefreshKey}
            />
          </div>

          {/* RIGHT SIDE — CART */}
          <div className="md:col-span-2">

            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4">

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Cart
                </h2>

                {cart.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {cart.reduce(
                      (sum, item) =>
                        sum + item.quantity,
                      0
                    )}{' '}
                    item(s)
                  </span>
                )}
              </div>

              <Alert msg={cartErr} />

              {cart.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">
                    Cart is empty
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    Scan a SKU or search for a product
                  </p>
                </div>
              )}

              <div className="max-h-80 space-y-3 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            -1
                          )
                        }
                        className="h-6 w-6 rounded border border-gray-300 text-sm leading-none text-gray-600 hover:bg-gray-50"
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            1
                          )
                        }
                        className="h-6 w-6 rounded border border-gray-300 text-sm leading-none text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>

                    <p className="w-16 text-right text-sm font-medium text-gray-900">
                      $
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                    <button
                      onClick={() =>
                        removeItem(item.productId)
                      }
                      aria-label={`Remove ${item.name}`}
                      className="text-xs text-red-500 hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-1 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">

                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Clear Cart
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={
                    cart.length === 0 ||
                    checkingOut
                  }
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {checkingOut
                    ? 'Processing...'
                    : 'Checkout'}
                </button>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Receipt */}
      <ReceiptModal
        transaction={receipt}
        onClose={() => {
          setReceipt(null);

          setTimeout(() => {
            skuInputRef.current?.focus();
          }, 0);
        }}
      />
    </div>
  );
}