import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'shrink-0'
  };

  const icons = {
    box: (
      <>
        <path d="M21 8.5 12 4 3 8.5 12 13l9-4.5Z" />
        <path d="M3 8.5V16l9 4 9-4V8.5" />
        <path d="M12 13v7" />
        <path d="m7.5 6.25 9 4.5" />
      </>
    ),

    categories: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    warning: (
      <>
        <path d="M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
      </>
    ),

    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),

    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),

    package: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),

    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-6" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    )
  };

  return (
    <svg {...common}>
      {icons[name]}
    </svg>
  );
}


/* =========================================================
   API HOOK
========================================================= */

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


/* =========================================================
   LOADING
========================================================= */

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}


/* =========================================================
   ALERT
========================================================= */

function Alert({ msg }) {
  if (!msg) return null;

  return (
    <div
      role="alert"
      className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <Icon name="warning" size={17} />
      <span>{msg}</span>
    </div>
  );
}


/* =========================================================
   CATEGORY FIELDS
========================================================= */

const CATEGORY_FIELDS = {
  fragile: [
    {
      key: 'handlingNote',
      label: 'Handling note',
      type: 'text'
    },
    {
      key: 'isFragile',
      label: 'Mark as fragile',
      type: 'checkbox'
    }
  ],

  cold: [
    {
      key: 'expiryDate',
      label: 'Expiry date',
      type: 'date'
    },
    {
      key: 'storageTemp',
      label: 'Storage temp',
      type: 'text'
    }
  ],

  tech: [
    {
      key: 'warrantyPeriod',
      label: 'Warranty period',
      type: 'text'
    },
    {
      key: 'serialNumber',
      label: 'Serial number',
      type: 'text'
    }
  ],

  cleaning: [
    {
      key: 'isHazardous',
      label: 'Mark as hazardous',
      type: 'checkbox'
    },
    {
      key: 'safetyNote',
      label: 'Safety note',
      type: 'text'
    }
  ]
};

const BLANK_DETAIL = {
  handlingNote: '',
  isFragile: false,
  expiryDate: '',
  storageTemp: '',
  warrantyPeriod: '',
  serialNumber: '',
  isHazardous: false,
  safetyNote: ''
};

const BLANK_PRODUCT_FORM = {
  sku: '',
  name: '',
  categoryId: '',
  price: '',
  quantityInStock: '0',
  reorderThreshold: '',
  description: '',
  ...BLANK_DETAIL
};


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'violet'
}) {
  const variants = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${variants[variant]}`}
        >
          <Icon name={icon} size={21} />
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   PRODUCTS TAB
========================================================= */

function ProductsTab({ categories }) {
  const {
    data: products,
    loading,
    error,
    refresh
  } = useApi(
    () => api.get('/products').then(r => r.data)
  );

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(BLANK_PRODUCT_FORM);
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rowErr, setRowErr] = useState('');

  const imgInputRefs = useRef({});

  const selectedCatName =
    categories?.find(
      c => String(c.id) === String(form.categoryId)
    )?.name?.toLowerCase() ?? '';

  const extraFields =
    CATEGORY_FIELDS[selectedCatName] ?? [];

  const totalProducts = products?.length ?? 0;

  const lowStockCount =
    products?.filter(
      p =>
        Number(p.quantityInStock) <=
        Number(p.reorderThreshold)
    ).length ?? 0;

  const totalStock =
    products?.reduce(
      (sum, p) => sum + Number(p.quantityInStock),
      0
    ) ?? 0;


  function openCreate() {
    setEditTarget(null);

    setForm({
      ...BLANK_PRODUCT_FORM,
      categoryId: categories?.[0]?.id ?? ''
    });

    setFormErr('');
    setShowModal(true);
  }


  function openEdit(p) {
    const d = p.ProductDetail ?? {};

    setEditTarget(p);

    setForm({
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId,
      price: String(p.price),
      quantityInStock: String(p.quantityInStock),
      reorderThreshold: String(p.reorderThreshold),
      description: p.description ?? '',

      handlingNote: d.handlingNote ?? '',
      isFragile: d.isFragile ?? false,

      expiryDate: d.expiryDate ?? '',
      storageTemp: d.storageTemp ?? '',

      warrantyPeriod: d.warrantyPeriod ?? '',
      serialNumber: d.serialNumber ?? '',

      isHazardous: d.isHazardous ?? false,
      safetyNote: d.safetyNote ?? ''
    });

    setFormErr('');
    setShowModal(true);
  }


  async function handleSubmit(e) {
    e.preventDefault();

    setFormErr('');
    setSubmitting(true);

    try {
      const basePayload = {
        sku: form.sku,
        name: form.name,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        quantityInStock: Number(form.quantityInStock),
        reorderThreshold: Number(form.reorderThreshold),
        description: form.description || null
      };

      let productId;

      if (editTarget) {
        await api.put(
          `/products/${editTarget.id}`,
          basePayload
        );

        productId = editTarget.id;
      } else {
        const { data } = await api.post(
          '/products',
          basePayload
        );

        productId = data.id;
      }

      if (extraFields.length > 0) {
        const detailPayload = {};

        for (const f of extraFields) {
          detailPayload[f.key] = form[f.key];
        }

        const existingDetail =
          editTarget?.ProductDetail;

        if (existingDetail) {
          await api.put(
            `/product-details/${existingDetail.id}`,
            detailPayload
          );
        } else {
          await api.post(
            '/product-details',
            {
              productId,
              ...detailPayload
            }
          );
        }
      }

      setShowModal(false);
      refresh();

    } catch (err) {
      setFormErr(
        err.response?.data?.error ??
        err.message ??
        'Save failed'
      );
    } finally {
      setSubmitting(false);
    }
  }


  async function handleDelete(p) {
    if (
      !window.confirm(
        `Delete "${p.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setRowErr('');

    try {
      await api.delete(`/products/${p.id}`);
      refresh();
    } catch (err) {
      setRowErr(
        err.response?.data?.error ??
        'Delete failed'
      );
    }
  }


  async function handleImageUpload(productId, file) {
    setRowErr('');

    const fd = new FormData();
    fd.append('image', file);

    try {
      await api.post(
        `/products/${productId}/image`,
        fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      refresh();

    } catch (err) {
      setRowErr(
        err.response?.data?.error ??
        'Image upload failed'
      );
    }
  }


  function field(
    key,
    label,
    type = 'text',
    required = false
  ) {
    const isCheck = type === 'checkbox';

    if (isCheck) {
      return (
        <div
          key={key}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
        >
          <input
            id={key}
            type="checkbox"
            checked={!!form[key]}
            onChange={e =>
              setForm(f => ({
                ...f,
                [key]: e.target.checked
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />

          <label
            htmlFor={key}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        </div>
      );
    }

    return (
      <div key={key}>
        <label
          htmlFor={key}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <input
          id={key}
          type={type}
          required={required}
          value={form[key]}
          onChange={e =>
            setForm(f => ({
              ...f,
              [key]: e.target.value
            }))
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
        />
      </div>
    );
  }


  return (
    <section>

      {/* Stats */}

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle="Products in inventory"
          icon="box"
          variant="violet"
        />

        <StatCard
          title="Total Stock"
          value={totalStock}
          subtitle="Units currently available"
          icon="chart"
          variant="blue"
        />

        <StatCard
          title="Low Stock"
          value={lowStockCount}
          subtitle="Products need attention"
          icon="warning"
          variant="amber"
        />

      </div>


      {/* Section heading */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your inventory and product details
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md"
        >
          <Icon name="plus" size={17} />
          Add product
        </button>

      </div>


      <Alert msg={error || rowErr} />


      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>
                  {[
                    '',
                    'SKU',
                    'Product',
                    'Category',
                    'Price',
                    'Stock',
                    'Reorder',
                    'Actions'
                  ].map(h => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
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
                      colSpan={8}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                        <Icon name="box" size={23} />
                      </div>

                      <p className="mt-3 font-medium text-gray-700">
                        No products yet
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Add your first product to get started.
                      </p>
                    </td>
                  </tr>
                )}


                {products?.map(p => {

                  const low =
                    Number(p.quantityInStock) <=
                    Number(p.reorderThreshold);

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-violet-50/30"
                    >

                      {/* Image */}

                      <td className="px-5 py-4">

                        <div className="flex flex-col items-center gap-1.5">

                          {p.imageUrl ? (
                            <img
                              src={`http://localhost:5000${p.imageUrl}`}
                              alt={p.name}
                              className="h-11 w-11 rounded-xl object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                              <Icon name="box" size={19} />
                            </div>
                          )}

                          <input
                            ref={el => {
                              imgInputRefs.current[p.id] = el;
                            }}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={e => {
                              const file =
                                e.target.files?.[0];

                              if (file) {
                                handleImageUpload(
                                  p.id,
                                  file
                                );
                              }

                              e.target.value = '';
                            }}
                          />

                          <button
                            onClick={() =>
                              imgInputRefs.current[p.id]?.click()
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-700"
                          >
                            <Icon name="upload" size={12} />
                            Upload
                          </button>

                        </div>

                      </td>


                      {/* SKU */}

                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        {p.sku}
                      </td>


                      {/* Product */}

                      <td className="px-5 py-4">

                        <p className="font-semibold text-gray-900">
                          {p.name}
                        </p>

                        {p.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                            {p.description}
                          </p>
                        )}

                      </td>


                      {/* Category */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium capitalize text-violet-700">
                          {p.Category?.name ?? 'Unknown'}
                        </span>

                      </td>


                      {/* Price */}

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ${Number(p.price).toFixed(2)}
                      </td>


                      {/* Stock */}

                      <td className="px-5 py-4">

                        <span
                          className={
                            low
                              ? 'inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600'
                              : 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600'
                          }
                        >
                          {p.quantityInStock}
                        </span>

                      </td>


                      {/* Reorder */}

                      <td className="px-5 py-4 text-gray-600">
                        {p.reorderThreshold}
                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() => openEdit(p)}
                            title="Edit product"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                          >
                            <Icon name="edit" size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            title="Delete product"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="trash" size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>
      )}


      {/* Product Modal */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/50 px-4 py-10 backdrop-blur-sm"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >

          <div className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Icon name="box" size={21} />
                </div>

                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {editTarget
                    ? `Edit: ${editTarget.name}`
                    : 'Add product'}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the product information below.
                </p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Icon name="close" size={18} />
              </button>

            </div>


            <Alert msg={formErr} />


            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('sku', 'SKU', 'text', true)}
                {field('name', 'Name', 'text', true)}
              </div>


              <div>

                <label
                  htmlFor="categoryId"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="categoryId"
                  required
                  value={form.categoryId}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      categoryId: e.target.value,
                      ...BLANK_DETAIL
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                >

                  <option value="">
                    Select category
                  </option>

                  {categories?.map(c => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.name}
                    </option>
                  ))}

                </select>

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {field(
                  'price',
                  'Price',
                  'number',
                  true
                )}

                {field(
                  'quantityInStock',
                  'Quantity',
                  'number',
                  true
                )}

                {field(
                  'reorderThreshold',
                  'Reorder at',
                  'number',
                  true
                )}

              </div>


              {field(
                'description',
                'Description',
                'text'
              )}


              {extraFields.length > 0 && (

                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">

                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-violet-600">
                    {selectedCatName} details
                  </p>

                  <div className="space-y-4">
                    {extraFields.map(f =>
                      field(
                        f.key,
                        f.label,
                        f.type
                      )
                    )}
                  </div>

                </div>

              )}


              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving...'
                    : editTarget
                    ? 'Save changes'
                    : 'Add product'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


/* =========================================================
   CATEGORIES TAB
========================================================= */

function CategoriesTab({
  categories,
  loading,
  error,
  refresh
}) {
  const [rowErr, setRowErr] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  function startEdit(c) {
    setEditingId(c.id);
    setEditValue(c.name);
    setRowErr('');
  }

  async function saveEdit(id) {
    setRowErr('');

    try {
      await api.put(
        `/categories/${id}`,
        { name: editValue }
      );

      setEditingId(null);
      refresh();

    } catch (err) {
      setRowErr(
        err.response?.data?.error ??
        'Rename failed'
      );
    }
  }

  async function handleAdd(e) {
    e.preventDefault();

    if (!newName.trim()) return;

    setRowErr('');
    setAdding(true);

    try {
      await api.post(
        '/categories',
        { name: newName }
      );

      setNewName('');
      refresh();

    } catch (err) {
      setRowErr(
        err.response?.data?.error ??
        'Create failed'
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <section>

      <div className="mb-7">

        <h2 className="text-xl font-bold text-gray-900">
          Categories
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Organize products into inventory categories.
        </p>

      </div>


      <Alert msg={error || rowErr} />


      <div className="mb-6 max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Icon name="categories" size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Add category
            </h3>

            <p className="text-xs text-gray-400">
              Create a category for your products.
            </p>
          </div>

        </div>


        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 sm:flex-row"
        >

          <input
            type="text"
            value={newName}
            onChange={e =>
              setNewName(e.target.value)
            }
            placeholder="Enter category name"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />

          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Icon name="plus" size={16} />
            {adding ? 'Adding...' : 'Add category'}
          </button>

        </form>

      </div>


      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <table className="min-w-full text-sm">

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {!categories?.length && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                      <Icon name="categories" size={20} />
                    </div>

                    <p className="mt-3 font-medium text-gray-700">
                      No categories yet
                    </p>
                  </td>
                </tr>
              )}


              {categories?.map(c => (

                <tr
                  key={c.id}
                  className="transition hover:bg-violet-50/30"
                >

                  <td className="px-5 py-4">

                    {editingId === c.id ? (

                      <div className="flex flex-col gap-2 sm:flex-row">

                        <input
                          autoFocus
                          value={editValue}
                          onChange={e =>
                            setEditValue(e.target.value)
                          }
                          className="flex-1 rounded-lg border border-violet-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-100"
                        />

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              saveEdit(c.id)
                            }
                            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Save
                          </button>

                          <button
                            onClick={() =>
                              setEditingId(null)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <Icon name="categories" size={15} />
                        </div>

                        <span className="font-medium capitalize text-gray-900">
                          {c.name}
                        </span>

                      </div>

                    )}

                  </td>


                  <td className="px-5 py-4 text-right">

                    {editingId !== c.id && (
                      <button
                        onClick={() =>
                          startEdit(c)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Icon name="edit" size={13} />
                        Rename
                      </button>
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}


/* =========================================================
   LOW STOCK
========================================================= */

function LowStockTab() {
  const {
    data: products,
    loading,
    error
  } = useApi(
    () =>
      api
        .get('/products/low-stock')
        .then(r => r.data)
  );

  const sorted = products
    ? [...products].sort(
        (a, b) =>
          a.quantityInStock -
          a.reorderThreshold -
          (b.quantityInStock -
            b.reorderThreshold)
      )
    : [];

  return (
    <section>

      <div className="mb-7">

        <h2 className="text-xl font-bold text-gray-900">
          Low Stock
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Products that need to be restocked.
        </p>

      </div>


      <Alert msg={error} />


      {loading ? (
        <Spinner />
      ) : (

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-gray-200 bg-red-50/70">

                <tr>

                  {[
                    'Product',
                    'SKU',
                    'Category',
                    'Current Stock',
                    'Reorder At',
                    'Status'
                  ].map(h => (

                    <th
                      key={h}
                      className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-red-600"
                    >
                      {h}
                    </th>

                  ))}

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {!sorted.length && (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Icon name="check" size={23} />
                      </div>

                      <p className="mt-3 font-semibold text-gray-700">
                        Inventory looks good
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        No products need restocking right now.
                      </p>

                    </td>

                  </tr>

                )}


                {sorted.map(p => (

                  <tr
                    key={p.id}
                    className="transition hover:bg-red-50/30"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-900">
                        {p.name}
                      </p>

                    </td>


                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      {p.sku}
                    </td>


                    <td className="px-5 py-4 capitalize text-gray-600">
                      {p.Category?.name ?? 'Unknown'}
                    </td>


                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        {p.quantityInStock}
                      </span>

                    </td>


                    <td className="px-5 py-4 text-gray-600">
                      {p.reorderThreshold}
                    </td>


                    <td className="px-5 py-4">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Restock needed
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </section>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

const TABS = [
  {
    id: 'Products',
    icon: 'box'
  },
  {
    id: 'Categories',
    icon: 'categories'
  },
  {
    id: 'Low Stock',
    icon: 'warning'
  }
];


function Sidebar({
  activeTab,
  onChange,
  fullName,
  logout
}) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">

      {/* Brand */}

      <div className="border-b border-gray-100 px-6 py-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <Icon name="box" size={20} />
          </div>

          <div>
            <h1 className="font-bold tracking-tight text-gray-900">
              Inventory
            </h1>

            <p className="text-xs text-gray-400">
              Management System
            </p>
          </div>

        </div>

      </div>


      {/* Navigation */}

      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Management
        </p>


        <div className="space-y-1">

          {TABS.map(tab => (

            <button
              key={tab.id}
              onClick={() =>
                onChange(tab.id)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >

              <Icon
                name={tab.icon}
                size={18}
              />

              <span>
                {tab.id}
              </span>

            </button>

          ))}

        </div>

      </nav>


      {/* User */}

      <div className="border-t border-gray-100 p-4">

        {fullName && (

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Signed in as
              </p>

              <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                {fullName}
              </p>

            </div>

          </div>

        )}


        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="logout" size={16} />
          Sign out
        </button>

      </div>

    </aside>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function InventoryPage() {

  const {
    fullName,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] =
    useState('Products');


  const {
    data: categories,
    loading: catLoading,
    error: catError,
    refresh: refreshCategories
  } = useApi(
    () =>
      api
        .get('/categories')
        .then(r => r.data)
  );


  return (

    <div className="min-h-screen bg-gray-50">

      <Sidebar
        activeTab={activeTab}
        onChange={setActiveTab}
        fullName={fullName}
        logout={logout}
      />


      <div className="lg:pl-64">

        {/* Header */}

        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur lg:px-8">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-violet-600">
                Inventory
              </p>

              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-gray-900">
                {activeTab}
              </h1>

            </div>


            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-xs text-gray-400">
                  Welcome back
                </p>

                <p className="text-sm font-semibold text-gray-700">
                  {fullName || 'User'}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {fullName
                  ? fullName.charAt(0).toUpperCase()
                  : 'U'}
              </div>

            </div>

          </div>

        </header>


        {/* Main */}

        <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8">

          {activeTab === 'Products' && (
            <ProductsTab
              categories={categories ?? []}
            />
          )}

          {activeTab === 'Categories' && (
            <CategoriesTab
              categories={categories}
              loading={catLoading}
              error={catError}
              refresh={refreshCategories}
            />
          )}

          {activeTab === 'Low Stock' && (
            <LowStockTab />
          )}

        </main>

      </div>

    </div>
  );
}