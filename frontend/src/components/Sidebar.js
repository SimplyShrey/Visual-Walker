// src/components/Sidebar.js

import React, { useState } from 'react';
import Chatbot from './Chatbot';

const Sidebar = ({
    activeTab,
    datasets,
    selectedDataset,
    onDatasetChange,
    onGoClick,
    onFileUpload,
    isLoading,
    dashboards,
    onDashboardSelect
}) => {

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
        }
        event.target.value = null; // Reset file input
    };

    // return (
    //     <aside className="sidebar">
    //         {activeTab === 'design' && (
    //             <div className="sidebar-content">
    //                 <div className="sidebar-section">
    //                     <h3>1. Select Data</h3>
    //                     <p>Choose a pre-existing dataset or upload a new Excel file.</p>
                        
    //                     <label htmlFor="dataset-select">Dataset Name</label>
    //                     <select
    //                         id="dataset-select"
    //                         value={selectedDataset}
    //                         onChange={onDatasetChange}
    //                         disabled={isLoading}
    //                     >
    //                         <option value="">Select a dataset...</option>
    //                         {datasets.map((ds, idx) => (
    //                             <option key={idx} value={ds.datasetName}>
    //                                 {ds.datasetName}
    //                             </option>
    //                         ))}
    //                     </select>
    //                     <button className="go-button" onClick={onGoClick} disabled={isLoading || !selectedDataset}>
    //                         {isLoading ? 'Loading...' : 'Go'}
    //                     </button>

    //                     <div className="divider">OR</div>

    //                     <input type="file" id="file-upload" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
    //                     <label htmlFor="file-upload" className={`upload-button ${isLoading ? 'disabled' : ''}`}>
    //                         Upload Excel File
    //                     </label>
    //                 </div>

    //                 <div className="sidebar-section chatbot-section">
    //                      <h3>2. Chat with AI</h3>
    //                      <Chatbot />
    //                 </div>
    //             </div>
    //         )}

    //         {activeTab === 'view' && (
    //             <div className="sidebar-content">
    //                  <div className="sidebar-section">
    //                     <h3>Saved Dashboards</h3>
    //                     {dashboards.length > 0 ? (
    //                         <ul className="dashboard-list">
    //                             {dashboards.map((dash, idx) => (
    //                                 <li key={idx} onClick={() => onDashboardSelect(dash)}>
    //                                     {dash.dashboardName}
    //                                 </li>
    //                             ))}
    //                         </ul>
    //                     ) : (
    //                         <p>No dashboards found.</p>
    //                     )}
    //                 </div>
    //             </div>
    //         )}
    //     </aside>
    // );
    // In src/components/Sidebar.js

    return (
        <aside className="sidebar">
            {activeTab === 'design' && (
                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h3>1. Select Data</h3>
                        <p>Choose a pre-existing dataset or upload a new Excel file.</p>
                        
                        {/* Group for the dataset dropdown and Go button */}
                        <div className="input-group">
                            <label htmlFor="dataset-select">Dataset Name</label>
                            <select
                                id="dataset-select"
                                value={selectedDataset}
                                onChange={onDatasetChange}
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                {datasets.map((ds, idx) => (
                                    <option key={idx} value={ds.datasetName}>
                                        {ds.datasetName}
                                    </option>
                                ))}
                            </select>
                            <button className="go-button" onClick={onGoClick} disabled={isLoading || !selectedDataset}>
                                Go
                            </button>
                        </div>

                        <div className="divider">OR</div>

                        {/* Group for the file upload button */}
                        <div className="input-group">
                             <label htmlFor="file-upload">Upload Excel File</label>
                             <input type="file" id="file-upload" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
                             <label htmlFor="file-upload" className={`upload-button ${isLoading ? 'disabled' : ''}`}>
                                Choose File
                             </label>
                        </div>
                    </div>

                    <div className="sidebar-section chatbot-section">
                         <h3>2. Chat with AI</h3>
                         <Chatbot />
                    </div>
                </div>
            )}

            {activeTab === 'view' && (
                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h3>Saved Dashboards</h3>
                        {dashboards.length > 0 ? (
                            <ul className="dashboard-list">
                                {dashboards.map((dash, idx) => (
                                    <li key={idx} onClick={() => onDashboardSelect(dash)}>
                                        {dash.dashboardName}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No dashboards found.</p>
                        )}
                    </div>
                 </div>
            )}
        </aside>
    );
};

export default Sidebar;