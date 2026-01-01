import React from "react";

export const Modal = ({ children, ...props }) => (
  <div className="modal" {...props}>
    {children}
  </div>
);
