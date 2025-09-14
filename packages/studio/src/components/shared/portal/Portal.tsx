/**
 * Portal component
 *
 * Creates a div in the body and renders the component
 */

import React from "react";
import ReactDOM from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(
    <div id="portal">{children}</div>,
    document.body
  );
}
