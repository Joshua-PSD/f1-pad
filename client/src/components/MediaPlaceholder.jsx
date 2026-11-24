
import React from "react";

// Reusable image tile.
// Replace the image URL in the database to display your own image.
export default function MediaPlaceholder({
  src,
  label = "F1 Pad image",
  className = ""
}) {
  return (
    <div className={`media ${className}`}>
      {src ? (
        <img src={src} alt={label} />
      ) : (
        <div className="media-empty">
          <span>IMAGE PLACEHOLDER</span>
          <small>Add image URL in database</small>
        </div>
      )}
    </div>
  );
}
