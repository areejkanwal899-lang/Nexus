import React, { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, Clock, FileMode, Trash2, PenTool } from 'lucide-react';

interface SharedDocument {
  id: string;
  name: string;
  size: string;
  status: 'Draft' | 'In Review' | 'Signed';
  uploadedAt: string;
  signedAt?: string;
}

const INITIAL_DOCS: SharedDocument[] = [
  { id: 'doc_1', name: 'Seed_Funding_Term_Sheet_Nexus.pdf', size: '2.4 MB', status: 'In Review', uploadedAt: 'July 02, 2026' },
  { id: 'doc_2', name: 'NDA_Mutual_Collaboration_Signed.pdf', size: '1.1 MB', status: 'Signed', uploadedAt: 'June 28, 2026', signedAt: 'June 29, 2026' },
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<SharedDocument[]>(INITIAL_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<SharedDocument | null>(documents[0]);
  
  // Canvas tracking references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Drawing Handlers for E-Signature Pad
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb'; // Corporate Premium Blue color code
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Status Action updates
  const handleApplySignature = () => {
    if (!selectedDoc || !hasSignature) return;

    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        if (doc.id === selectedDoc.id) {
          const updatedDoc: SharedDocument = {
            ...doc,
            status: 'Signed',
            signedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          };
          setSelectedDoc(updatedDoc);
          return updatedDoc;
        }
        return doc;
      })
    );
    clearSignature();
  };

  // Mock File Upload action trigger
  const handleMockUpload = () => {
    const newDoc: SharedDocument = {
      id: `doc_${Date.now()}`,
      name: 'Partnership_Agreement_Draft.pdf',
      size: '1.8 MB',
      status: 'Draft',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6 p-1 animate-fade-in">
      
      {/* LEFT COLUMN: DOCUMENT INDEX CHAMBER */}
      <div className="w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Document Chamber
          </h2>
          <button 
            onClick={handleMockUpload}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Upload size={14} />
            Upload
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => { setSelectedDoc(doc); clearSignature(); }}
              className={`p-3.5 rounded-lg cursor-pointer transition flex flex-col gap-1.5 border ${
                selectedDoc?.id === doc.id 
                  ? 'bg-blue-50/60 border-blue-200 shadow-sm' 
                  : 'bg-white border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold text-gray-800 truncate flex-1">{doc.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  doc.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                  doc.status === 'In Review' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{doc.size}</span>
                <span>Added: {doc.uploadedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW & SIGNATURE CANVAS */}
      <div className="w-2/3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {selectedDoc ? (
          <div className="flex-1 flex flex-col h-full">
            
            {/* Document details top row */}
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedDoc.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Size: {selectedDoc.size} | Created on {selectedDoc.uploadedAt}</p>
              </div>
              {selectedDoc.status === 'Signed' && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
                  <CheckCircle size={14} />
                  Signed Securely on {selectedDoc.signedAt}
                </div>
              )}
            </div>

            {/* Simulated Live Viewport Chamber */}
            <div className="flex-1 bg-gray-100 p-6 overflow-y-auto flex flex-col items-center">
              <div className="w-full max-w-xl bg-white shadow-md border border-gray-200 rounded-lg p-8 min-h-[420px] relative flex flex-col justify-between">
                
                {/* Simulated Content structure */}
                <div>
                  <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
                    <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">MUTUAL STRUCTURAL AGREEMENT</h1>
                    <p className="text-xs text-gray-500 mt-1">NEXUS ENTERPRISE PIPELINE SYSTEM</p>
                  </div>
                  
                  <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                    <p className="font-bold text-gray-800">1. CORE PURPOSE AND ALLOCATION</p>
                    <p>This workspace binding sets the framework coordinates between verified Founders and Investment syndicates within the decentralized system matrix. All parties execute validation strategies via secure localized browser authentication streams.</p>
                    <p className="font-bold text-gray-800 mt-4">2. NON-DISCLOSURE CLAUSES</p>
                    <p>Data shared including pitch files, data flowcharts, operational modules, and internal timeline schemas are strictly bounded under local repository protocols. Any leaks will invalidate validation configurations instantly.</p>
                  </div>
                </div>

                {/* Bottom Signature verification area */}
                <div className="mt-12 pt-6 border-t border-dashed border-gray-300 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Authorized System</p>
                    <p className="text-xs font-semibold text-gray-800 mt-1">Business Nexus Engine</p>
                  </div>
                  <div className="text-right border-b border-gray-400 w-44 text-center pb-1">
                    {selectedDoc.status === 'Signed' ? (
                      <span className="font-serif italic text-blue-600 font-bold text-sm tracking-widest">
                        SECURELY SIGNED
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Awaiting E-Signature...</span>
                    )}
                    <p className="text-[10px] uppercase font-bold text-gray-400 text-right mt-1">Participant Signee</p>
                  </div>
                </div>
              </div>

              {/* DRAWING BOARD OVERLAY FOR SIGNING IN REAL-TIME */}
              {selectedDoc.status !== 'Signed' && (
                <div className="w-full max-w-xl bg-white shadow-md border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <PenTool size={14} className="text-blue-600" />
                      Draw E-Signature Mockup Here:
                    </label>
                    <button 
                      onClick={clearSignature}
                      className="text-[11px] text-gray-500 hover:text-rose-600 font-medium transition"
                    >
                      Clear Pad
                    </button>
                  </div>

                  {/* HTML5 Canvas Component element */}
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-md cursor-crosshair h-[100px]"
                  />

                  <button
                    onClick={handleApplySignature}
                    disabled={!hasSignature}
                    className={`w-full mt-3 py-2 text-xs font-semibold rounded-lg text-white transition ${
                      hasSignature 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Lock & Apply Signature to Document
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
            <FileText size={48} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Select a contract layout file to initialize review chamber.</p>
          </div>
        )}
      </div>

    </div>
  );
};