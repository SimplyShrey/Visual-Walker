// import React, { useState, useRef, useEffect } from 'react';
// import ReactMarkdown from 'react-markdown';

// const Chatbot = ({ selectedDataset }) => {
//     const [messages, setMessages] = useState([
//         { from: 'bot', text: 'Hello! I can help you analyze your data. Try asking me about utilization, shipments, predictions, or data visualization.' }
//     ]);
//     const [input, setInput] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const messagesEndRef = useRef(null);
//     const [columns, setColumns] = useState([]);

//     useEffect(() => {
//         console.log('Chatbot component re-rendered. The value of selectedDataset is:', selectedDataset);
//         if (selectedDataset) {
//             console.log('Loading dataset:', selectedDataset);
//             loadDataset(selectedDataset);
//         }
//     }, [selectedDataset]);
//     useEffect(() => {
//         // Smooth scroll to bottom when messages change
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ 
//                 behavior: "auto",
//                 block: "end"
//             });
//         }
//     }, [messages]);

//         const loadDataset = async () => {
//             if (selectedDataset) {
//                 try {
//                     const response = await fetch('http://localhost:5000/api/load-data', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             datasetName: selectedDataset
//                         })
//                     });
                    
//                     if (response.ok) {
//                         const result = await response.json();
//                         console.log('Dataset loaded for chatbot:', result);
//                         setMessages(prev => [...prev, 
//                             { from: 'bot', text: `Dataset "${selectedDataset}" loaded successfully! I can now help you analyze your data with ${result.columns.length} columns.` }
//                         ]);
//                     } else {
//                         console.error('Failed to load dataset for chatbot');
//                     }
//                 } catch (error) {
//                     console.error('Error loading dataset for chatbot:', error);
//                 }
//             }
//         };

//         loadDataset();
//     }, [selectedDataset]);

//     // const loadDataset = async (datasetName) => {
//     //     setIsLoading(true);
//     //     try {
//     //         const response = await fetch('http://localhost:5000/api/load-data', {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //             },
//     //             body: JSON.stringify({ datasetName })
//     //         });

//     //         const data = await response.json();
//     //         console.log('Dataset response:', data);

//     //         if (!response.ok) throw new Error(data.error || 'Loading dataset failed');

//     //         setColumns(data.columns || []);
//     //         setMessages(prev => [...prev, 
//     //             { from: 'bot', text: `Dataset "${datasetName}" loaded successfully! I can help you analyze ${data.rows} rows of data.` }
//     //         ]);
//     //     } catch (error) {
//     //         console.error('Load error:', error);
//     //         setMessages(prev => [...prev, 
//     //             { from: 'bot', text: `Error loading dataset: ${error.message}` }
//     //         ]);
//     //     } finally {
//     //         setIsLoading(false);
//     //     }
//     // };

// const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = { from: 'user', text: input };
//     setMessages(prev => [...prev, userMessage]);
//     const currentInput = input; // Store the current input
//     setInput('');
//     setIsLoading(true);

//     try {
//         const payload = {
//             message: currentInput,
//             columns: columns,
//             dataset: selectedDataset
//         };
//         console.log('Sending request:', payload);

//         const response = await fetch('http://localhost:5000/api/chatbot', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload)
//         });

//         const data = await response.json();
//         console.log('Full response:', data);

//         if (!response.ok) {
//             throw new Error(data.error || 'Network response was not ok');
//         }
        
//         if (data.reply) {
//             setMessages(prev => [...prev, { 
//                 from: 'bot', 
//                 text: data.reply 
//             }]);
//         } else {
//             throw new Error('No reply received from server');
//         }

//     } catch (error) {
//         console.error('Chat error details:', {
//             error: error.message,
//             columns: columns,
//             dataset: selectedDataset
//         });
//         setMessages(prev => [...prev, { 
//             from: 'bot', 
//             text: `Error: ${error.message}. Please make sure a dataset is loaded.` 
//         }]);
//     } finally {
//         setIsLoading(false);
//     }
// };

// const handleExport = async () => {
//     try {
//         console.log('Starting export...');
//         const response = await fetch('http://localhost:5000/api/export', {
//             method: 'GET',
//             headers: {
//                 'Accept': 'text/csv',
//             },
//         });

//         console.log('Export response:', response);
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Export failed');
//         }
        
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `export_${new Date().toISOString().slice(0,19).replace(/[:]/g, '')}.csv`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//     } catch (error) {
//         console.error('Export error:', error);
//         setMessages(prev => [...prev, 
//             { from: 'bot', text: `Error exporting data: ${error.message}` }
//         ]);
//     }
// };

//     return (
//         <div className="chatbot-container">
//             <div className="chatbot-header">
//             </div>
//             <div className="chatbot-messages">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`message ${msg.from}`}>
//                         {msg.text}
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <div className="chatbot-input">
//                 <input
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//                     placeholder="Ask about your data..."
//                 />
//                 <button 
//                     onClick={handleSend} 
//                     disabled={!input.trim()}
//                 >
//                     ➤
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chatbot;

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const Chatbot = ({ selectedDataset }) => {
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hello! I can help you analyze your data. Try asking me about utilization, shipments, predictions, or data visualization.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [columns, setColumns] = useState([]);
    const [loadedDataset, setLoadedDataset] = useState(null); 

    useEffect(() => {
        console.log('Chatbot component re-rendered. The value of selectedDataset is:', selectedDataset);
        
        const loadDataset = async () => {
            if (selectedDataset && selectedDataset !== loadedDataset) {
                try {
                    console.log('Loading dataset:', selectedDataset);
                    const response = await fetch('http://localhost:5000/api/load-data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            datasetName: selectedDataset
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('Dataset loaded for chatbot:', result);
                        setColumns(result.columns || []); // Set the columns
                        setMessages(prev => [...prev, 
                            { from: 'bot', text: `Dataset "${selectedDataset}" loaded successfully! I can now help you analyze your data with ${result.columns.length} columns.` }
                        ]);
                    } else {
                        console.error('Failed to load dataset for chatbot');
                        const errorData = await response.json();
                        setMessages(prev => [...prev, 
                            { from: 'bot', text: `Error loading dataset: ${errorData.error || 'Unknown error'}` }
                        ]);
                    }
                } catch (error) {
                    console.error('Error loading dataset for chatbot:', error);
                    setMessages(prev => [...prev, 
                        { from: 'bot', text: `Error loading dataset: ${error.message}` }
                    ]);
                }
            }
        };

        if (selectedDataset) {
            loadDataset();
        }
    }, [selectedDataset]);

    // Fix: Properly structured useEffect for auto-scroll
    useEffect(() => {
        // Smooth scroll to bottom when messages change
        if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
            });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const payload = {
                message: currentInput,
                columns: columns,
                dataset: selectedDataset
            };
            console.log('Sending request:', payload);

            const response = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('Full response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Network response was not ok');
            }
            
            if (data.reply) {
                setMessages(prev => [...prev, { 
                    from: 'bot', 
                    text: data.reply 
                }]);
            } else {
                throw new Error('No reply received from server');
            }

        } catch (error) {
            console.error('Chat error details:', {
                error: error.message,
                columns: columns,
                dataset: selectedDataset
            });
            setMessages(prev => [...prev, { 
                from: 'bot', 
                text: `Error: ${error.message}. Please make sure a dataset is loaded.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            console.log('Starting export...');
            const response = await fetch('http://localhost:5000/api/export', {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv',
                },
            });

            console.log('Export response:', response);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export_${new Date().toISOString().slice(0,19).replace(/[:]/g, '')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            setMessages(prev => [...prev, 
                { from: 'bot', text: `Error exporting data: ${error.message}` }
            ]);
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
            </div>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.from}`}>
                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your data..."
                />
                <button 
                    onClick={handleSend} 
                    disabled={!input.trim()}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default Chatbot;