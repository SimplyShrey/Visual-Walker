// src/components/DashboardPage.js

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GraphicWalker, GraphicRenderer } from '@kanaries/graphic-walker';
import * as XLSX from 'xlsx';
import Sidebar from './Sidebar';
import Placeholder from './Placeholder'; // <-- Import the new placeholder component
import AnimatedSection from './AnimatedSection';
import SaveDashboardModal from './SaveDashboardModal';
import Chatbot from './Chatbot';


const TABS = {
    DESIGN: 'design',
    VIEW: 'view'
};

const ENDPOINTS = {
    DASHBOARD: 'http://localhost:5246/Dashboard',
    DATASET: 'http://localhost:5246/Dataset',
    DATASET_UPLOAD: 'http://localhost:5246/Dataset/Upload'
};

const MESSAGES = {
    NO_DATA: 'Select a dataset or upload a file to begin.',
    LOADING: 'Loading...',
    ERROR: 'An error occurred',
    NO_DASHBOARDS: 'No dashboards have been saved yet.',
    SAVE_SUCCESS: 'Dashboard saved successfully!',
};

const RenderMultipleCharts = ({ singleChartConfig, gwData, index }) => {
    if (!singleChartConfig) return null;
    const chartConfig = Array.isArray(singleChartConfig) ? singleChartConfig : [singleChartConfig];
    const chartName = singleChartConfig.name || `Chart ${index + 1}`;

    return (
        <div className="chart-item">
            <h3 className="chart-title">{chartName}</h3>
            <GraphicRenderer
                data={gwData.dataSource}
                fields={gwData.fields}
                chart={chartConfig}
            />
        </div>
    );
};

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState(TABS.DESIGN);
    const [datasets, setDatasets] = useState({ items: [], loading: true, error: null });
    const [dashboards, setDashboards] = useState({ items: [], loading: true, error: null, selected: null });
    
    const [dropdownSelection, setDropdownSelection] = useState('');
    const [datasetForChatbot, setDatasetForChatbot] = useState(null);
    const [gwData, setGwData] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State for the View Tab
    const [viewGwData, setViewGwData] = useState(null);
    const [viewChartConfig, setViewChartConfig] = useState(null);
    const [isDashboardVisible, setIsDashboardVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const gw = useRef(null);
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        if (isLightMode) {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }
    }, [isLightMode]);

    const toggleTheme = () => {
        setIsLightMode(prev => !prev);
    };

    // Fetch datasets on initial load
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await axios.get(ENDPOINTS.DATASET);
                setDatasets({ items: response.data, loading: false, error: null });
            } catch (err) {
                setDatasets({ items: [], loading: false, error: err });
                console.error("Error fetching datasets:", err);
            }
        };
        fetchDatasets();
    }, []);

    // Fetch dashboards when switching to the View tab
    useEffect(() => {
        const fetchDashboards = async () => {
            setDashboards(prev => ({ ...prev, loading: true }));
            try {
                const response = await axios.get(ENDPOINTS.DASHBOARD);
                setDashboards({ items: response.data, loading: false, error: null, selected: null });
            } catch (err) {
                setDashboards({ items: [], loading: false, error: err, selected: null });
                console.error("Error fetching dashboards:", err);
            }
        };

        if (activeTab === TABS.VIEW) {
            fetchDashboards();
            setIsDashboardVisible(false); // Reset view when tabbing back
        }
    }, [activeTab]);

    const openSaveModal = () => {
        if (!gw.current || !isDataLoaded) {
             alert("Please create a visualization before saving.");
             return;
        }
        setIsModalOpen(true);
    };
    const handleSaveDashboard = async (dashboardName) => {
        try {
            const chartConfigList = gw.current.exportCode();
            await axios.post(ENDPOINTS.DASHBOARD, {
                dashboardName,
                datasetName: datasetForChatbot,
                jsonFormat: JSON.stringify(chartConfigList, null, 2),
                isMultiple: Array.isArray(chartConfigList) && chartConfigList.length > 1,
            });
            alert(MESSAGES.SAVE_SUCCESS);
            setIsModalOpen(false); // Close modal on success
        } catch (error) {
            console.error('Error saving dashboard:', error);
            alert(error.response?.data?.error || 'Failed to save dashboard.');
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        const datasetName = file.name.replace(/\.[^/.]+$/, "");
        if (datasets.items.some(d => d.datasetName === datasetName)) {
            alert('Dataset with this name already exists.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('datasetName', datasetName);

        try {
            await axios.post(ENDPOINTS.DATASET_UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            // Refresh dataset list
            const response = await axios.get(ENDPOINTS.DATASET);
            setDatasets({ items: response.data, loading: false, error: null });
            setDropdownSelection(datasetName);
            setDatasetForChatbot(datasetName);

            // Process file for immediate use
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const excelData = XLSX.utils.sheet_to_json(firstSheet, { raw: false, defval: null });

                if (excelData.length > 0) {
                    const fields = Object.keys(excelData[0]).map(key => ({
                        fid: key,
                        semanticType: !isNaN(excelData[0][key]) ? 'quantitative' : 'nominal',
                        analyticType: 'dimension',
                    }));
                    setGwData({ fields, dataSource: excelData });
                    setIsDataLoaded(true);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error uploading dataset:', error);
            alert('Failed to upload dataset.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoClick = async () => {
        setDatasetForChatbot(dropdownSelection);
        if (!dropdownSelection) {
            alert('Please select a dataset');
            return;
        }

        setIsLoading(true);
        setIsDataLoaded(false);
        setGwData(null);
        const selected = datasets.items.find(d => d.datasetName === dropdownSelection);

        if (selected) {
            try {
                let response;
                if (selected.isItFromExcel) {
                    response = await axios.get(`http://localhost:5246/api/excel/read?excelPath=${encodeURIComponent(selected.excelPath)}`);
                } else {
                    response = await axios.get(`http://localhost:5246/api/storedprocedure/execute?storedProcedureName=${encodeURIComponent(selected.sp)}`);
                }

                const data = response.data;
                if (data.length > 0) {
                    const fields = Object.keys(data[0]).map(key => ({
                        fid: key,
                        semanticType: typeof data[0][key] === 'number' ? 'quantitative' : 'nominal',
                        analyticType: 'dimension',
                    }));
                    setGwData({ fields, dataSource: data });
                    setIsDataLoaded(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data.');
            }
        }
        setIsLoading(false);
    };

    const exportDashboard = async () => {
        if (!gw.current) return;
        const dashboardName = prompt("Enter a name for the dashboard:");
        if (!dashboardName) return;

        try {
            const chartConfigList = gw.current.exportCode();
            await axios.post(ENDPOINTS.DASHBOARD, {
                dashboardName,
                datasetName: datasetForChatbot,
                jsonFormat: JSON.stringify(chartConfigList, null, 2),
                isMultiple: Array.isArray(chartConfigList) && chartConfigList.length > 1,
            });
            alert(MESSAGES.SAVE_SUCCESS);
        } catch (error) {
            console.error('Error saving dashboard:', error);
            alert(error.response?.data?.error || 'Failed to save dashboard.');
        }
    };
    
    const handleDashboardSelect = async (dashboard) => {
        setIsLoading(true);
        setDashboards(prev => ({ ...prev, selected: dashboard }));
        setIsDashboardVisible(false);

        const dataset = datasets.items.find(d => d.datasetName === dashboard.datasetName);
        if (!dataset) {
            alert("Associated dataset not found. Please ensure all datasets are loaded.");
            setIsLoading(false);
            return;
        }
        
        try {
            let response;
            if (dataset.isItFromExcel) {
                response = await axios.get(`http://localhost:5246/api/excel/read?excelPath=${encodeURIComponent(dataset.excelPath)}`);
            } else {
                response = await axios.get(`http://localhost:5246/api/storedprocedure/execute?storedProcedureName=${encodeURIComponent(dataset.sp)}`);
            }
            
            const data = response.data;
            if (data.length > 0) {
                const fields = Object.keys(data[0]).map(key => ({
                    fid: key,
                    semanticType: typeof data[0][key] === 'number' ? 'quantitative' : 'nominal',
                    analyticType: 'dimension',
                }));
                setViewGwData({ fields, dataSource: data });
                setViewChartConfig(JSON.parse(dashboard.jsonFormat));
                setIsDashboardVisible(true);
            }
        } catch (error) {
            console.error("Error fetching data for dashboard:", error);
            alert("Failed to load data for the selected dashboard.");
        } finally {
            setIsLoading(false);
        }
    };

    // return (
    //     <div className="page-layout">
    //         <header className="page-header">
    //             <div className="header-tabs">
    //                 <button onClick={() => setActiveTab(TABS.DESIGN)} className={activeTab === TABS.DESIGN ? 'active' : ''}>
    //                     Design Dashboard
    //                 </button>
    //                 <button onClick={() => setActiveTab(TABS.VIEW)} className={activeTab === TABS.VIEW ? 'active' : ''}>
    //                     View Dashboards
    //                 </button>
    //             </div>
    //         </header>

    //         <Sidebar
    //             activeTab={activeTab}
    //             datasets={datasets.items}
    //             selectedDataset={selectedDataset}
    //             onDatasetChange={(e) => {
    //                 setSelectedDataset(e.target.value);
    //                 setIsDataLoaded(false);
    //             }}
    //             onGoClick={handleGoClick}
    //             onFileUpload={handleFileUpload}
    //             isLoading={isLoading}
    //             dashboards={dashboards.items}
    //             onDashboardSelect={handleDashboardSelect}
    //         />

    //         <main className="main-content">
    //             {activeTab === TABS.DESIGN && (
    //                 <>
    //                     <div className="chart-area">
    //                         {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
    //                         {(!isLoading && isDataLoaded && gwData) ? (
    //                             <GraphicWalker
    //                                 fields={gwData.fields}
    //                                 data={gwData.dataSource}
    //                                 storeRef={gw}
    //                                 appearance='media'
    //                             />
    //                         ) : (
    //                             !isLoading && <div className="no-data-message">{MESSAGES.NO_DATA}</div>
    //                         )}
    //                     </div>
    //                     <div className="export-container">
    //                         <button onClick={exportDashboard} disabled={!isDataLoaded}>
    //                             Export Dashboard
    //                         </button>
    //                     </div>
    //                 </>
    //             )}

    //             {activeTab === TABS.VIEW && (
    //                 <div className="chart-area">
    //                     {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
    //                     {(!isLoading && isDashboardVisible && viewGwData && viewChartConfig) ? (
    //                          Array.isArray(viewChartConfig) ? (
    //                             <div className="multiple-charts-grid">
    //                                 {viewChartConfig.map((chart, index) => (
    //                                     <RenderMultipleCharts 
    //                                         key={index}
    //                                         singleChartConfig={chart}
    //                                         gwData={viewGwData}
    //                                         index={index}
    //                                     />
    //                                 ))}
    //                             </div>
    //                         ) : (
    //                             <GraphicRenderer
    //                                 data={viewGwData.dataSource}
    //                                 fields={viewGwData.fields}
    //                                 chart={viewChartConfig}
    //                             />
    //                         )
    //                     ) : (
    //                         !isLoading && <div className="no-data-message">Select a dashboard from the left to view it.</div>
    //                     )}
    //                 </div>
    //             )}
    //         </main>
    //     </div>
    // );
// return (
//   <div className="app-container">
//       <div className="page-container">
//         <nav className="floating-nav">
//           <div className="app-title">VISUAL WALKER</div>
//           <div className="nav-links">
//             <button 
//               onClick={() => setActiveTab(TABS.DESIGN)} 
//               className={`nav-button ${activeTab === TABS.DESIGN ? 'active' : ''}`}
//             >
//               Design
//             </button>
//             <button 
//               onClick={() => setActiveTab(TABS.VIEW)} 
//               className={`nav-button ${activeTab === TABS.VIEW ? 'active' : ''}`}
//             >
//               View
//             </button>
//             {/* Theme Toggle */}
//             <button onClick={toggleTheme} className="nav-button">
//               {isLightMode ? "🌞 Light" : "🌙 Dark"}
//             </button>
//           </div>
//         </nav>

//         {/* New container for the two-column layout */}
//         <div className="main-grid-container">
          
//           {/* Left Column for Controls */}
//           <aside className="left-column">
//             <Sidebar
//               activeTab={activeTab}
//               datasets={datasets.items}
//               selectedDataset={selectedDataset}
//               onDatasetChange={(e) => {
//                   setSelectedDataset(e.target.value);
//                   setIsDataLoaded(false);
//               }}
//               onGoClick={handleGoClick}
//               onFileUpload={handleFileUpload}
//               isLoading={isLoading}
//               dashboards={dashboards.items}
//               onDashboardSelect={handleDashboardSelect}
//             />
//           </aside>

//           {/* Right Column for Charts */}
//           <main className="right-column">
//             {activeTab === TABS.DESIGN && (
//               <>
//                 <div className="chart-area">
//                   {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
//                   {(!isLoading && isDataLoaded && gwData) ? (
//                     <GraphicWalker
//                       fields={gwData.fields}
//                       data={gwData.dataSource}
//                       storeRef={gw}
//                       appearance='media'
//                     />
//                   ) : (
//                     !isLoading && <Placeholder />
//                   )}
//                 </div>
//                 <div className="export-container">
//                   <button onClick={exportDashboard} disabled={!isDataLoaded}>
//                     Export Dashboard
//                   </button>
//                 </div>
//               </>
//             )}

//             {activeTab === TABS.VIEW && (
//               <div className="chart-area">
//                 {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
//                 {(!isLoading && isDashboardVisible && viewGwData && viewChartConfig) ? (
//                   Array.isArray(viewChartConfig) ? (
//                     <div className="multiple-charts-grid">
//                       {viewChartConfig.map((chart, index) => (
//                         <RenderMultipleCharts
//                           key={index}
//                           singleChartConfig={chart}
//                           gwData={viewGwData}
//                           index={index}
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <GraphicRenderer
//                       data={viewGwData.dataSource}
//                       fields={viewGwData.fields}
//                       chart={viewChartConfig}
//                     />
//                   )
//                 ) : (
//                   !isLoading && <Placeholder />
//                 )}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };
    return (
        <div className="app-container">
            {/* The Export button is now here, using the correct class */}
            <button 
                onClick={openSaveModal}
                disabled={!isDataLoaded || activeTab !== TABS.DESIGN}
                className="export-button-floating"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Export Dashboard
            </button>

            <div className="page-container">
                <nav className="floating-nav">
                    <div className="app-title">VISUAL WALKER</div>
                    <div className="nav-links">
                        <button
                            onClick={() => setActiveTab(TABS.DESIGN)}
                            className={`nav-button ${activeTab === TABS.DESIGN ? 'active' : ''}`}
                        >
                            Design
                        </button>
                        <button
                            onClick={() => setActiveTab(TABS.VIEW)}
                            className={`nav-button ${activeTab === TABS.VIEW ? 'active' : ''}`}
                        >
                            View
                        </button>
                        <button onClick={toggleTheme} className="nav-button">
                            {isLightMode ? "🌞 Light" : "🌙 Dark"}
                        </button>
                    </div>
                </nav>

                <div className="main-grid-container">
                    <aside className="left-column">
                        <Sidebar
                            activeTab={activeTab}
                            datasets={datasets.items}
                            selectedDataset={dropdownSelection}
                            onDatasetChange={(e) => {
                                setDropdownSelection(e.target.value);
                                setIsDataLoaded(false);
                            }}
                            onGoClick={handleGoClick}
                            onFileUpload={handleFileUpload}
                            isLoading={isLoading}
                            dashboards={dashboards.items}
                            onDashboardSelect={handleDashboardSelect}
                        />
                        {/* <Chatbot selectedDataset={datasetForChatbot}/> */}
                    </aside>

                    <main className="right-column">
                        {activeTab === TABS.DESIGN && (
                            <div className="chart-area">
                                {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
                                {(!isLoading && isDataLoaded && gwData) ? (
                                    <GraphicWalker
                                        fields={gwData.fields}
                                        data={gwData.dataSource}
                                        storeRef={gw}
                                        appearance='media'
                                    />
                                ) : (
                                    !isLoading && <Placeholder />
                                )}
                            </div>
                        )}

                        {activeTab === TABS.VIEW && (
                            <div className="chart-area">
                                {(isLoading) && <div className="loading-message">{MESSAGES.LOADING}</div>}
                                {(!isLoading && isDashboardVisible && viewGwData && viewChartConfig) ? (
                                    Array.isArray(viewChartConfig) ? (
                                        <div className="multiple-charts-grid">
                                            {viewChartConfig.map((chart, index) => (
                                                <RenderMultipleCharts
                                                    key={index}
                                                    singleChartConfig={chart}
                                                    gwData={viewGwData}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <GraphicRenderer
                                            data={viewGwData.dataSource}
                                            fields={viewGwData.fields}
                                            chart={viewChartConfig}
                                        />
                                    )
                                ) : (
                                    !isLoading && <Placeholder />
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <SaveDashboardModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveDashboard}
        />
        </div>
    );
};

export default DashboardPage;