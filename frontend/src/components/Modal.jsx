import React from 'react';
export default function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-card">
      <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}>×</button></div>
      {children}
    </div>
  </div>;
}
