import { STATUS_FLOW } from "../utils/constants.js";
import { formatDateTime } from "../utils/formatters.js";

export const QueryTimeline = ({ query }) => {
  const events = query?.timeline || [];

  return (
    <section className="timeline">
      {STATUS_FLOW.map((step) => {
        const matched = events.find((entry) => entry.status === step);
        const completed = Boolean(matched);
        const current = query?.effectiveStatus === "Resolved" ? step === "Resolved" : !completed && step === "Supplier Response" ? query?.supplierResponse : matched?.status === query?.status;
        const tone = completed ? "done" : current ? "current" : "upcoming";

        return (
          <article key={step} className={`timeline-step ${tone}`}>
            <div className="timeline-marker" />
            <div>
              <h4>{step}</h4>
              <p>{matched?.message || (step === "Supplier Response" ? "Waiting for supplier response." : "Upcoming step")}</p>
              {matched ? <span>{formatDateTime(matched.timestamp)}</span> : null}
            </div>
          </article>
        );
      })}
    </section>
  );
};
