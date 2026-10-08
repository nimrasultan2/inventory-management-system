import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Fetch hook
function useApi(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fnRef = useRef(fetchFn);

  useEffect(() => {
    fnRef.current = fetchFn;
  });

  const run = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setData(await fnRef.current());
    } catch (err) {
      setError(
        err.response?.data?.error ??
        err.message ??
        'Request failed'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return {
    data,
    loading,
    error,
    refresh: run
  };
}

// Spinner
function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

// Alert
function Alert({ msg }) {
  if (!msg) return null;

  return (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {msg}
    </div>
  );
}

// Constants
const ROLES = [
  'ADMIN',
  'INVENTORY_MANAGER',
  'CASHIER'
];

const ROLE_LABEL = {
  ADMIN: 'Admin',
  INVENTORY_MANAGER: 'Inv. Manager',
  CASHIER: 'Cashier'
};

const BLANK_FORM = {
  email: '',
  password: '',
  fullName: '',
  role: 'CASHIER'
};

// Icons
function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 3 3 5-7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// Users tab
function UsersTab() {
  const {
    data: users,
    loading,
    error,
    refresh
  } = useApi(
    () => api.get('/users').then(r => r.data)
  );

  const [rowErr, setRowErr] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function patch(id, body) {
    setRowErr('');

    try {
      await api.patch(`/users/${id}`, body);
      refresh();
    } catch (e) {
      setRowErr(
        e.response?.data?.error ??
        'Update failed'
      );
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormErr('');
    setSubmitting(true);

    try {
      await api.post('/users', form);

      setShowModal(false);
      setForm(BLANK_FORM);
      refresh();
    } catch (e) {
      setFormErr(
        e.response?.data?.error ??
        'Create failed'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setFormErr('');
            setForm(BLANK_FORM);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-600/20 transition hover:bg-purple-700"
        >
          <span className="text-lg leading-none">+</span>
          Create user
        </button>
      </div>

      <Alert msg={error || rowErr} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">

              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', ''].map(h => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {!users?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}

                {users?.map(u => (
                  <tr
                    key={u.id}
                    className="transition hover:bg-purple-50/30"
                  >

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                          {u.fullName?.charAt(0)?.toUpperCase()}
                        </div>

                        <span className="font-semibold text-gray-900">
                          {u.fullName}
                        </span>

                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {u.email}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={e =>
                          patch(u.id, {
                            role: e.target.value
                          })
                        }
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          patch(u.id, {
                            isActive: !u.isActive
                          })
                        }
                        className={`text-xs font-semibold transition hover:underline ${
                          u.isActive
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {u.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4 backdrop-blur-sm"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >

          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Create user
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new system user
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <CloseIcon />
              </button>

            </div>

            <Alert msg={formErr} />

            <form
              onSubmit={handleCreate}
              noValidate
              className="space-y-4"
            >

              {[
                {
                  id: 'fullName',
                  label: 'Full name',
                  type: 'text',
                  key: 'fullName'
                },
                {
                  id: 'email',
                  label: 'Email',
                  type: 'email',
                  key: 'email'
                },
                {
                  id: 'password',
                  label: 'Password',
                  type: 'password',
                  key: 'password'
                }
              ].map(({ id, label, type, key }) => (
                <div key={id}>

                  <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {label}
                  </label>

                  <input
                    id={id}
                    type={type}
                    required
                    value={form[key]}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        [key]: e.target.value
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                  />

                </div>
              ))}

              <div>

                <label
                  htmlFor="newRole"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Role
                </label>

                <select
                  id="newRole"
                  value={form.role}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      role: e.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>

              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? 'Creating...'
                    : 'Create'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
}

// Products tab
function ProductsTab() {
  const {
    data: products,
    loading,
    error
  } = useApi(
    () => api.get('/products').then(r => r.data)
  );

  return (
    <section>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Products
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View products and current inventory levels
        </p>
      </div>

      <Alert msg={error} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {[
                    '',
                    'SKU',
                    'Name',
                    'Category',
                    'Price',
                    'Stock',
                    'Reorder'
                  ].map(h => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {!products?.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      No products found
                    </td>
                  </tr>
                )}

                {products?.map(p => {
                  const lowStock =
                    Number(p.quantityInStock) <=
                    Number(p.reorderThreshold);

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-purple-50/30"
                    >

                      <td className="px-5 py-4">
                        {p.imageUrl ? (
                          <img
                            src={`http://localhost:5000${p.imageUrl}`}
                            alt={p.name}
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-400">
                            <ProductIcon />
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        {p.sku}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {p.name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {p.Category?.name ?? 'None'}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        ${Number(p.price).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${
                            lowStock
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {p.quantityInStock}
                        </span>

                        {lowStock && (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                            Low
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {p.reorderThreshold}
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
}

// Reports tab
function ReportsTab() {
  const {
    data: txns,
    loading,
    error
  } = useApi(
    () => api.get('/transactions').then(r => r.data)
  );

  const totalRevenue =
    txns?.reduce(
      (s, t) => s + Number(t.total),
      0
    ) ?? 0;

  return (
    <section>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Reports
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View sales activity and revenue
        </p>
      </div>

      <Alert msg={error} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <ReportIcon />
              </div>

              <p className="text-sm font-medium text-gray-500">
                Total Revenue
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <ReportIcon />
              </div>

              <p className="text-sm font-medium text-gray-500">
                Transactions
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {txns?.length ?? 0}
              </p>
            </div>

          </div>

          {/* Transactions */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">
                Transactions
              </h3>
            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {[
                      'Date',
                      'Cashier',
                      'Items',
                      'Subtotal',
                      'Tax',
                      'Total'
                    ].map(h => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {!txns?.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-gray-400"
                      >
                        No transactions yet
                      </td>
                    </tr>
                  )}

                  {txns?.map(t => (
                    <tr
                      key={t.id}
                      className="transition hover:bg-purple-50/30"
                    >

                      <td className="px-5 py-4 text-gray-600">
                        {new Date(
                          t.createdAt
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {t.User?.fullName ??
                          `User #${t.cashierId}`}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {t.TransactionItems?.length ?? 0}
                      </td>

                      <td className="px-5 py-4 text-gray-900">
                        ${Number(t.subtotal).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        ${Number(t.tax).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 font-bold text-gray-900">
                        ${Number(t.total).toFixed(2)}
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </section>
  );
}

// Navigation
const TABS = [
  {
    name: 'Users',
    icon: UsersIcon
  },
  {
    name: 'Products',
    icon: ProductIcon
  },
  {
    name: 'Reports',
    icon: ReportIcon
  }
];

function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-purple-700 text-white md:flex">

      {/* Brand */}
      <div className="flex h-20 items-center gap-3 px-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <ProductIcon />
        </div>

        <div>
          <h1 className="font-bold tracking-tight">
            POS & Inventory
          </h1>

          <p className="text-xs text-purple-200">
            Admin Panel
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-purple-300">
          Management
        </p>

        <div className="space-y-1">

          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => onChange(tab.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-purple-100 hover:bg-white/10'
                }`}
              >
                <Icon />
                {tab.name}
              </button>
            );
          })}

        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-4">

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-purple-100 transition hover:bg-white/10"
        >
          <LogoutIcon />
          Sign out
        </button>

      </div>

    </aside>
  );
}

// Mobile navigation
function MobileNav({ active, onChange }) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">

      <div className="flex gap-2 overflow-x-auto">

        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => onChange(tab.name)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon />
              {tab.name}
            </button>
          );
        })}

      </div>
    </div>
  );
}

// Main page
export default function AdminPage() {
  const { fullName, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('Users');

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar
          active={activeTab}
          onChange={setActiveTab}
          onLogout={logout}
        />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="flex min-h-20 items-center justify-between border-b border-gray-200 bg-white px-5 sm:px-8">

            <div>
              <p className="text-sm font-medium text-purple-600">
                Admin Dashboard
              </p>

              <h1 className="mt-0.5 text-xl font-bold text-gray-900">
                Welcome{fullName ? `, ${fullName}` : ''}
              </h1>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {fullName || 'Admin'}
                </p>

                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                {fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>

              <button
                onClick={logout}
                className="hidden rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:block"
              >
                Sign out
              </button>

            </div>

          </header>

          {/* Mobile nav */}
          <MobileNav
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* Content */}
          <main className="w-full flex-1 px-5 py-7 sm:px-8 lg:px-10">

            <div className="mx-auto max-w-7xl">

              {activeTab === 'Users' && (
                <UsersTab />
              )}

              {activeTab === 'Products' && (
                <ProductsTab />
              )}

              {activeTab === 'Reports' && (
                <ReportsTab />
              )}

            </div>

          </main>

        </div>
      </div>
    </div>
  );
}