import { Mail, Phone, MapPin, PackageSearch } from "lucide-react";

export const SupplierCard = ({ supplier }) => (
  <article className="supplier-card">
    <div className="supplier-card__head">
      <div>
        <h3>{supplier.name}</h3>
        <p>{supplier.contactPerson}</p>
      </div>
      <span className={`mini-pill mini-pill-${supplier.status.replace(/\s/g, "-").toLowerCase()}`}>{supplier.status}</span>
    </div>
    <div className="supplier-card__details">
      <span><Mail size={14} /> {supplier.email}</span>
      <span><Phone size={14} /> {supplier.phone}</span>
      <span><MapPin size={14} /> {supplier.location || "—"}</span>
      <span><PackageSearch size={14} /> {supplier.category}</span>
    </div>
    <div className="supplier-card__footer">
      <strong>{supplier.totalQueries || 0}</strong>
      <span>Total queries</span>
      <strong>{supplier.pendingQueries || 0}</strong>
      <span>Pending</span>
    </div>
  </article>
);
