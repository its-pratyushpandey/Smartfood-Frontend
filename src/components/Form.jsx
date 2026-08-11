import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Paperclip } from "lucide-react";
import { QUERY_CATEGORIES, QUERY_PRIORITIES, SUPPLIER_CATEGORIES, SUPPLIER_STATUSES } from "../utils/constants.js";

const supplierSchema = z.object({
  name: z.string().trim().min(2, "Supplier name is required").max(120),
  contactPerson: z.string().trim().min(2, "Contact person is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  category: z.enum(SUPPLIER_CATEGORIES),
  status: z.enum(SUPPLIER_STATUSES).optional(),
  location: z.string().trim().max(150).optional().or(z.literal("")),
});

const querySchema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().trim().min(20, "Please add more detail").max(2000),
  category: z.enum(QUERY_CATEGORIES),
  priority: z.enum(QUERY_PRIORITIES),
  dueDate: z.string().min(1, "Select a due date"),
  referenceProduct: z.string().trim().max(150).optional().or(z.literal("")),
  attachmentName: z.string().trim().max(200).optional().or(z.literal("")),
});

const fieldError = (errors, name) => errors?.[name]?.message;

const FileField = ({ register, setValue, errors }) => (
  <label className="field">
    <span>Attachment</span>
    <div className="file-field">
      <Paperclip size={16} />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            setValue("attachmentName", "", { shouldValidate: true });
            return;
          }
          const allowed = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
          if (!allowed.includes(file.type)) {
            event.target.value = "";
            setValue("attachmentName", "", { shouldValidate: true });
            return;
          }
          setValue("attachmentName", file.name, { shouldValidate: true });
        }}
      />
    </div>
    <input type="hidden" {...register("attachmentName")} />
    {errors.attachmentName ? <span className="field-error">{errors.attachmentName.message}</span> : null}
  </label>
);

export const SupplierForm = ({ initialValues, onSubmit, submitting, onCancel }) => {
  const form = useForm({ resolver: zodResolver(supplierSchema), defaultValues: initialValues });
  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <label className="field"><span>Supplier name *</span><input {...register("name")} placeholder="FreshHarvest Foods" />{fieldError(errors, "name") ? <span className="field-error">{fieldError(errors, "name")}</span> : null}</label>
      <label className="field"><span>Contact person *</span><input {...register("contactPerson")} placeholder="Amelia Turner" />{fieldError(errors, "contactPerson") ? <span className="field-error">{fieldError(errors, "contactPerson")}</span> : null}</label>
      <label className="field"><span>Email *</span><input {...register("email")} placeholder="name@company.com" type="email" />{fieldError(errors, "email") ? <span className="field-error">{fieldError(errors, "email")}</span> : null}</label>
      <label className="field"><span>Phone *</span><input {...register("phone")} placeholder="+1 415 555 0101" />{fieldError(errors, "phone") ? <span className="field-error">{fieldError(errors, "phone")}</span> : null}</label>
      <label className="field"><span>Category *</span><select {...register("category")}><option value="">Select category</option>{SUPPLIER_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>{fieldError(errors, "category") ? <span className="field-error">{fieldError(errors, "category")}</span> : null}</label>
      <label className="field"><span>Status</span><select {...register("status")}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Under Review">Under Review</option></select></label>
      <label className="field field-full"><span>Location</span><input {...register("location")} placeholder="California, USA" /></label>
      <div className="form-actions field-full">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create Supplier"}</button>
      </div>
    </form>
  );
};

export const QueryForm = ({ suppliers, initialValues, onSubmit, submitting, onCancel }) => {
  const form = useForm({ resolver: zodResolver(querySchema), defaultValues: initialValues });
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = form;
  const [supplierFilter, setSupplierFilter] = useState("");
  const [supplierOpen, setSupplierOpen] = useState(false);
  const supplierId = watch("supplierId");

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const selectedSupplier = suppliers.find((supplier) => supplier._id === supplierId);

  const filteredSuppliers = useMemo(() => suppliers.filter((supplier) => {
    const text = `${supplier.name} ${supplier.contactPerson} ${supplier.email}`.toLowerCase();
    return text.includes(supplierFilter.toLowerCase());
  }), [supplierFilter, suppliers]);

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <label className="field field-full">
        <span>Supplier *</span>
        <div className="combobox">
          <input
            value={supplierFilter || selectedSupplier?.name || ""}
            placeholder="Search supplier"
            onChange={(event) => {
              setSupplierFilter(event.target.value);
              setSupplierOpen(true);
              setValue("supplierId", "", { shouldValidate: true });
            }}
            onFocus={() => setSupplierOpen(true)}
            aria-invalid={Boolean(errors.supplierId)}
          />
          {supplierOpen ? (
            <div className="combobox-menu">
              {filteredSuppliers.length ? filteredSuppliers.map((supplier) => (
                <button key={supplier._id} type="button" className="combobox-option" onClick={() => {
                  setValue("supplierId", supplier._id, { shouldValidate: true });
                  setSupplierFilter(supplier.name);
                  setSupplierOpen(false);
                }}>
                  <strong>{supplier.name}</strong>
                  <span>{supplier.contactPerson}</span>
                </button>
              )) : <div className="combobox-empty">No suppliers found</div>}
            </div>
          ) : null}
        </div>
        <input type="hidden" {...register("supplierId")} />
        {errors.supplierId ? <span className="field-error">{errors.supplierId.message}</span> : null}
      </label>
      <label className="field"><span>Category *</span><select {...register("category")}><option value="">Select category</option>{QUERY_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>{errors.category ? <span className="field-error">{errors.category.message}</span> : null}</label>
      <label className="field"><span>Priority *</span><select {...register("priority")}><option value="">Select priority</option>{QUERY_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>{errors.priority ? <span className="field-error">{errors.priority.message}</span> : null}</label>
      <label className="field"><span>Due date *</span><input {...register("dueDate")} type="date" min={new Date().toISOString().split("T")[0]} />{errors.dueDate ? <span className="field-error">{errors.dueDate.message}</span> : null}</label>
      <label className="field field-full"><span>Query title *</span><input {...register("title")} placeholder="Confirm allergen controls for sesame blend" maxLength={150} />{errors.title ? <span className="field-error">{errors.title.message}</span> : null}</label>
      <label className="field field-full"><span>Detailed question *</span><textarea {...register("description")} placeholder="Explain the product, safety issue, and documents required." rows={6} maxLength={2000} />{errors.description ? <span className="field-error">{errors.description.message}</span> : null}</label>
      <label className="field"><span>Reference / Product</span><input {...register("referenceProduct")} placeholder="Roasted Seed Blend A" maxLength={150} /></label>
      <FileField register={register} setValue={setValue} errors={errors} />
      <div className="form-actions field-full">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Query"}</button>
      </div>
    </form>
  );
};
