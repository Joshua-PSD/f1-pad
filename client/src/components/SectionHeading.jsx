
import React from "react";

// Reusable page title section with kicker label
// and a short description.
export default function SectionHeading({
  kicker,
  title,
  description
}) {
  return (
    <div className="section-heading">
      <p className="kicker">{kicker}</p>

      <h1>{title}</h1>

      {description && (
        <p className="muted">{description}</p>
      )}
    </div>
  );
}
