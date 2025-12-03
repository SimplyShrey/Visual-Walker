import React, { useState } from 'react';

const SaveDashboardModal = ({ isOpen, onClose, onSave }) => {
  const [dashboardName, setDashboardName] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (dashboardName.trim()) {
      onSave(dashboardName);
      setDashboardName(''); // Reset for next time
    } else {
      alert('Please enter a name.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Save Dashboard</h3>
        <p>Enter a name for your new dashboard.</p>
        <input
          type="text"
          className="modal-input"
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
          placeholder="e.g., Monthly Sales Report"
          autoFocus
        />
        <div className="modal-actions">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDashboardModal;