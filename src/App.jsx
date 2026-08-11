import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ClipboardList, Plus, RefreshCcw, ShieldCheck, Sparkles, UserPlus, Users, FileText, Filter, SortAsc, Search, ArrowRight, Send, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "./components/Layout.jsx";
import { Header } from "./components/Header.jsx";
import { StatCard } from "./components/StatCard.jsx";
import { LoadingState } from "./components/LoadingState.jsx";
import { EmptyState } from "./components/EmptyState.jsx";
import { ErrorState } from "./components/ErrorState.jsx";
import { Modal } from "./components/Modal.jsx";
import { QueryTable } from "./components/QueryTable.jsx";
import { QueryForm, SupplierForm } from "./components/Form.jsx";
import { StatusBadge, PriorityBadge } from "./components/Badges.jsx";
import { QueryTimeline } from "./components/QueryTimeline.jsx";
import { SupplierCard } from "./components/SupplierCard.jsx";
import {
  addQueryNote,
  apiErrorMessage,
  createQuery,
  createSupplier,
  deleteQuery,
  getDashboardStats,
  getQueries,
  getQuery,
  getSuppliers,
  updateQueryStatus,
} from "./services/api.js";
import { formatDate, formatDateTime, isOverdue } from "./utils/formatters.js";

const defaultQueryForm = {
  supplierId: "",
  category: "",
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  referenceProduct: "",
  attachmentName: "",
};

const defaultSupplierForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  category: "Ingredients",
  status: "Active",
  location: "",
};

const queryActionOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Resolved", value: "Resolved" },
  { label: "Overdue", value: "Overdue" },
];

const Select = ({ value, onChange, options, label }) => (
  <label className="filter-select">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  </label>
);

const sortLabel = { updatedAt: "Last updated", dueDate: "Due date", createdAt: "Created date" };

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [queries, setQueries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const order = searchParams.get("order") || "desc";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResponse, queryResponse, supplierResponse] = await Promise.all([
        getDashboardStats(),
        getQueries({ search, status, category, priority, sortBy, order }),
        getSuppliers({ search }),
      ]);
      setStats(statsResponse.data);
      setQueries(queryResponse.data);
      setSuppliers(supplierResponse.data);
    } catch (issue) {
      setError(apiErrorMessage(issue));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, category, priority, sortBy, order]);

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params);
  };

  const topQueries = useMemo(() => queries.slice(0, 8), [queries]);

  const header = <Header title="Supplier Queries" subtitle="Monitor food-safety questions and supplier responses." searchPlaceholder="Search suppliers or queries" />;

  const statsCards = [
    { label: "Total Queries", value: stats?.totalQueries ?? 0, note: "All supplier questions", icon: <ClipboardList size={18} /> },
    { label: "Pending", value: stats?.pending ?? 0, note: "Waiting for action", icon: <Clock3 size={18} /> },
    { label: "In Progress", value: stats?.inProgress ?? 0, note: "Active follow-ups", icon: <Sparkles size={18} /> },
    { label: "Resolved", value: stats?.resolved ?? 0, note: "Closed items", icon: <CheckCircle2 size={18} /> },
    { label: "Overdue", value: stats?.overdue ?? 0, note: "Needs attention now", icon: <AlertTriangle size={18} /> },
  ];

  return (
    <Layout header={header}>
      <section className="page-stack">
        <div className="page-hero">
          <div>
            <span className="hero-tag"><ShieldCheck size={14} /> Smartfood QA cockpit</span>
            <h2>Supplier Query Management</h2>
            <p>Prioritize overdue, critical, and supplier-response items before they affect release decisions.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/queries/new"><Plus size={16} /> Raise New Query</Link>
            <Link className="btn btn-secondary" to="/suppliers"><Users size={16} /> View Suppliers</Link>
          </div>
        </div>

        {loading ? <LoadingState label="Loading dashboard" /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <>
            <div className="stats-grid">
              {statsCards.map((card) => <StatCard key={card.label} {...card} />)}
            </div>

            <section className="panel">
              <div className="panel__header">
                <div>
                  <h3>Supplier Queries</h3>
                  <p>Search, filter, and sort the latest supplier conversations.</p>
                </div>
                <div className="panel-actions">
                  <Select value={status} onChange={(value) => updateParams({ status: value })} label="Status" options={queryActionOptions} />
                  <Select value={category} onChange={(value) => updateParams({ category: value })} label="Category" options={[{ label: "All categories", value: "" }, { label: "Allergen", value: "Allergen" }, { label: "Certificate", value: "Certificate" }, { label: "Ingredient Safety", value: "Ingredient Safety" }, { label: "Compliance", value: "Compliance" }, { label: "Quality", value: "Quality" }, { label: "Documentation", value: "Documentation" }, { label: "Other", value: "Other" }]} />
                  <Select value={priority} onChange={(value) => updateParams({ priority: value })} label="Priority" options={[{ label: "All priorities", value: "" }, { label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }, { label: "Critical", value: "Critical" }]} />
                  <Select value={sortBy} onChange={(value) => updateParams({ sortBy: value })} label="Sort" options={[{ label: "Last updated", value: "updatedAt" }, { label: "Due date", value: "dueDate" }, { label: "Created date", value: "createdAt" }]} />
                  <Select value={order} onChange={(value) => updateParams({ order: value })} label="Direction" options={[{ label: "Newest first", value: "desc" }, { label: "Oldest first", value: "asc" }]} />
                </div>
              </div>
              <QueryTable
                queries={topQueries}
                emptyState={<EmptyState title="No queries match the current filters" description="Try changing search, status, category, or priority." action={<button className="btn btn-primary" onClick={() => setSearchParams({})} type="button">Clear filters</button>} />}
              />
            </section>
          </>
        )}
      </section>
    </Layout>
  );
}

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getSuppliers({ search, status, category });
      setSuppliers(response.data);
    } catch (issue) {
      setError(apiErrorMessage(issue));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, category]);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      await createSupplier(values);
      toast.success("Supplier created successfully");
      setOpen(false);
      load();
    } catch (issue) {
      toast.error(apiErrorMessage(issue));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout header={<Header title="Suppliers" subtitle="View supplier accounts and monitor open query load." searchPlaceholder="Search suppliers" />}> 
      <section className="page-stack">
        <div className="page-toolbar">
          <div className="toolbar-filters">
            <Select value={status} onChange={(value) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value) next.set("status", value); else next.delete("status"); return next; })} label="Status" options={[{ label: "All statuses", value: "" }, { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Under Review", value: "Under Review" }]} />
            <Select value={category} onChange={(value) => setSearchParams((current) => { const next = new URLSearchParams(current); if (value) next.set("category", value); else next.delete("category"); return next; })} label="Category" options={[{ label: "All categories", value: "" }, { label: "Ingredients", value: "Ingredients" }, { label: "Packaging", value: "Packaging" }, { label: "Additives", value: "Additives" }, { label: "Organic Produce", value: "Organic Produce" }, { label: "Grains", value: "Grains" }, { label: "Dairy", value: "Dairy" }, { label: "Other", value: "Other" }]} />
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}><UserPlus size={16} /> Create Supplier</button>
        </div>
        {loading ? <LoadingState label="Loading suppliers" /> : error ? <ErrorState message={error} onRetry={load} /> : suppliers.length ? <div className="supplier-grid">{suppliers.map((supplier) => <SupplierCard key={supplier._id} supplier={supplier} />)}</div> : <EmptyState title="No suppliers found" description="Create a supplier or clear filters to see the current list." action={<button className="btn btn-primary" onClick={() => setOpen(true)} type="button">Create Supplier</button>} />}
      </section>
      <Modal open={open} title="Create Supplier" onClose={() => setOpen(false)} footer={null}>
        <SupplierForm initialValues={defaultSupplierForm} submitting={submitting} onSubmit={submit} onCancel={() => setOpen(false)} />
      </Modal>
    </Layout>
  );
}

function QueriesPage() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const order = searchParams.get("order") || "desc";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [queryResponse, supplierResponse] = await Promise.all([
        getQueries({ search, status, category, priority, sortBy, order }),
        getSuppliers({ search }),
      ]);
      setQueries(queryResponse.data);
      setSuppliers(supplierResponse.data);
    } catch (issue) {
      setError(apiErrorMessage(issue));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, category, priority, sortBy, order]);

  return (
    <Layout header={<Header title="Queries" subtitle="Review, prioritize, and resolve supplier questions." searchPlaceholder="Search queries" />}> 
      <section className="page-stack">
        <div className="page-toolbar">
          <div className="toolbar-filters">
            <Select value={status} onChange={(value) => { const next = new URLSearchParams(searchParams); if (value) next.set("status", value); else next.delete("status"); setSearchParams(next); }} label="Status" options={queryActionOptions} />
            <Select value={category} onChange={(value) => { const next = new URLSearchParams(searchParams); if (value) next.set("category", value); else next.delete("category"); setSearchParams(next); }} label="Category" options={[{ label: "All categories", value: "" }, { label: "Allergen", value: "Allergen" }, { label: "Certificate", value: "Certificate" }, { label: "Ingredient Safety", value: "Ingredient Safety" }, { label: "Compliance", value: "Compliance" }, { label: "Quality", value: "Quality" }, { label: "Documentation", value: "Documentation" }, { label: "Other", value: "Other" }]} />
            <Select value={priority} onChange={(value) => { const next = new URLSearchParams(searchParams); if (value) next.set("priority", value); else next.delete("priority"); setSearchParams(next); }} label="Priority" options={[{ label: "All priorities", value: "" }, { label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }, { label: "Critical", value: "Critical" }]} />
            <Select value={sortBy} onChange={(value) => { const next = new URLSearchParams(searchParams); next.set("sortBy", value); setSearchParams(next); }} label="Sort" options={[{ label: "Last updated", value: "updatedAt" }, { label: "Due date", value: "dueDate" }, { label: "Created date", value: "createdAt" }]} />
          </div>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/queries/new")}><Plus size={16} /> Raise New Query</button>
        </div>
        {loading ? <LoadingState label="Loading queries" /> : error ? <ErrorState message={error} onRetry={load} /> : <QueryTable queries={queries} emptyState={<EmptyState title="No queries found" description="Try another combination of search, filters, or sorting." action={<button className="btn btn-primary" onClick={() => setSearchParams({})} type="button">Clear filters</button>} />} />}
      </section>
    </Layout>
  );
}

function NewQueryPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSuppliers().then((response) => setSuppliers(response.data)).catch((issue) => toast.error(apiErrorMessage(issue))).finally(() => setLoading(false));
  }, []);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      const response = await createQuery(values);
      toast.success("Query submitted successfully");
      navigate(`/queries/${response.data._id}`, { replace: true });
    } catch (issue) {
      toast.error(apiErrorMessage(issue));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout header={<Header title="Raise New Query" subtitle="Create a clear, auditable food-safety query for a supplier." searchPlaceholder="Search suppliers" />}> 
      <section className="page-stack">
        {loading ? <LoadingState label="Loading supplier options" /> : <div className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>New query</h3>
              <p>Required fields are marked with an asterisk.</p>
            </div>
            <div className="panel-note">Attachments are captured by filename in this demo workflow.</div>
          </div>
          <QueryForm suppliers={suppliers} initialValues={defaultQueryForm} submitting={submitting} onSubmit={submit} onCancel={() => navigate(-1)} />
        </div>}
      </section>
    </Layout>
  );
}

function QueryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getQuery(id);
      setQuery(result.data);
      setResponse(result.data.supplierResponse || "");
    } catch (issue) {
      setError(apiErrorMessage(issue));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const mutate = async (action, payload, successMessage) => {
    setSaving(true);
    try {
      const result = await action(payload);
      toast.success(successMessage);
      await load();
      return result;
    } catch (issue) {
      toast.error(apiErrorMessage(issue));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout header={<Header title="Query Details" subtitle="Review the query timeline and response history." />}><section className="page-stack"><LoadingState label="Loading query" /></section></Layout>;

  if (error) return <Layout header={<Header title="Query Details" subtitle="Review the query timeline and response history." />}><section className="page-stack"><ErrorState message={error} onRetry={load} /></section></Layout>;

  const status = query?.effectiveStatus || query?.status;

  const statusAction = () => {
    if (query.status === "Pending") return { label: "Mark as In Progress", icon: <Send size={16} />, handler: () => mutate(updateQueryStatus, { status: "In Progress", message: "Marked as in progress" }, "Query moved to In Progress") };
    if (query.status === "In Progress") return { label: "Resolve Query", icon: <CheckCircle2 size={16} />, handler: () => setResolveOpen(true) };
    return { label: "Resolved", icon: <CheckCircle2 size={16} />, handler: null };
  };

  return (
    <Layout header={<Header title="Query Details" subtitle="Review the query timeline and response history." searchPlaceholder="Search queries" />}> 
      <section className="page-stack">
        <div className="detail-hero panel">
          <div>
            <p className="eyebrow">{query.queryId}</p>
            <h2>{query.title}</h2>
            <p>{query.description}</p>
          </div>
          <div className="detail-aside">
            <StatusBadge status={status} />
            <PriorityBadge priority={query.priority} />
            <span className="detail-row"><strong>Supplier</strong><span>{query.supplierId?.name}</span></span>
            <span className="detail-row"><strong>Category</strong><span>{query.category}</span></span>
            <span className="detail-row"><strong>Created</strong><span>{formatDateTime(query.createdAt)}</span></span>
            <span className="detail-row"><strong>Due</strong><span>{formatDateTime(query.dueDate)}</span></span>
          </div>
        </div>

        <div className="detail-grid">
          <section className="panel">
            <div className="panel__header"><div><h3>Timeline</h3><p>Submitted → Sent to Supplier → Supplier Response → Resolved</p></div></div>
            <QueryTimeline query={query} />
          </section>
          <section className="panel">
            <div className="panel__header"><div><h3>Supplier response</h3><p>{query.supplierResponse ? "Latest response received" : "Waiting for supplier response."}</p></div></div>
            <div className="copy-box">{query.supplierResponse || "Waiting for supplier response."}</div>
            <label className="field"><span>Update supplier response</span><textarea value={response} onChange={(event) => setResponse(event.target.value)} rows={4} placeholder="Paste the supplier's response here." /></label>
            <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => mutate((payload) => updateQueryStatus(id, payload), { status: query.status, supplierResponse: response, message: "Supplier response updated" }, "Supplier response saved")}>Save response</button>
          </section>
        </div>

        <div className="detail-grid">
          <section className="panel">
            <div className="panel__header"><div><h3>Internal notes</h3><p>Record QA comments and escalation details.</p></div></div>
            <div className="notes-list">
              {query.internalNotes?.length ? query.internalNotes.map((entry, index) => <article className="note-item" key={`${entry.createdAt}-${index}`}><strong>{entry.author}</strong><p>{entry.text}</p><span>{formatDateTime(entry.createdAt)}</span></article>) : <EmptyState title="No internal notes yet" description="Add a note to capture QA context." />}
            </div>
            <label className="field"><span>Add internal note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Escalation context, document request, or follow-up note." /></label>
            <button className="btn btn-secondary" type="button" disabled={saving || !note.trim()} onClick={async () => { await mutate((payload) => addQueryNote(id, payload), { text: note, author: "QA Manager" }, "Internal note saved"); setNote(""); }}>Add note</button>
          </section>
          <section className="panel">
            <div className="panel__header"><div><h3>Actions</h3><p>Update query progress or close it out.</p></div></div>
            <div className="action-stack">
              {status === "Resolved" ? <div className="resolved-banner"><CheckCircle2 size={18} /> This query is resolved.</div> : null}
              {status === "Overdue" ? <div className="warning-banner"><AlertTriangle size={18} /> This query is overdue.</div> : null}
              {statusAction().handler ? <button className="btn btn-primary" type="button" onClick={statusAction().handler} disabled={saving}>{statusAction().icon}{statusAction().label}</button> : <button className="btn btn-secondary" type="button" onClick={() => navigate("/queries")}>Back to Queries</button>}
              <button className="btn btn-ghost" type="button" onClick={() => mutate((payload) => updateQueryStatus(id, payload), { status: query.status, message: "Details reviewed" }, "Query refreshed")}>Refresh status</button>
            </div>
          </section>
        </div>
      </section>

      <Modal open={resolveOpen} title="Resolve this query?" onClose={() => setResolveOpen(false)} footer={<><button className="btn btn-secondary" onClick={() => setResolveOpen(false)} type="button">Cancel</button><button className="btn btn-primary" onClick={async () => { setResolveOpen(false); await mutate(updateQueryStatus, { status: "Resolved", supplierResponse: response, message: "Query resolved" }, "Query resolved"); }} type="button">Resolve Query</button></>}>
        <p>This will mark the query as resolved and add a completion event to the timeline.</p>
      </Modal>
    </Layout>
  );
}

function SettingsPage() {
  return (
    <Layout header={<Header title="Settings" subtitle="Design system and workflow preferences." searchPlaceholder="Search settings" />}> 
      <section className="page-stack">
        <div className="panel settings-panel">
          <div className="settings-hero">
            <span className="hero-tag"><Sparkles size={14} /> Smartfood design system</span>
            <h2>Trustworthy, calm, and operationally focused.</h2>
            <p>The interface emphasizes priority, status, and due date visibility with clear icons, color, and hierarchy.</p>
          </div>
          <div className="settings-grid">
            <article><h3>Colors</h3><p>Teal primary, slate surfaces, amber pending, blue in progress, green resolved, red overdue.</p></article>
            <article><h3>Accessibility</h3><p>Labels, focus states, keyboard navigation, semantic buttons, and color-plus-icon status tokens.</p></article>
            <article><h3>Responsive</h3><p>Sidebar collapses on mobile, tables switch to cards, and forms stack into single-column layouts.</p></article>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/queries" element={<QueriesPage />} />
      <Route path="/queries/new" element={<NewQueryPage />} />
      <Route path="/queries/:id" element={<QueryDetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
