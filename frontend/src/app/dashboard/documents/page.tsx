"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface Document {
  name: string;
  size: string;
  date: string;
  status: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsFetching(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/documents`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setStatus(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // Browser sets multipart/form-data with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setStatus({ type: "success", message: data.message });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocuments();
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/documents/${filename}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });


      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Delete failed");
      }

      fetchDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Knowledge Base</h1>
        <p className="text-gray-500 text-sm">Upload documents to train your admission assistant.</p>
      </div>

      {/* Upload/Ingest Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-[#0F172A] mb-4">Upload New Document</h3>
        <p className="text-xs text-gray-400 mb-6">Supported formats: .txt, .pdf, .docx (Max 10MB)</p>
        
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.pdf,.docx"
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer bg-white transition-all overflow-hidden"
            >
              <FileText className="text-gray-400 h-4 w-4 shrink-0" />
              <span className="text-sm text-gray-600 truncate">
                {selectedFile ? selectedFile.name : "Select a document..."}
              </span>
              {selectedFile && (
                <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </label>
          </div>
          <button 
            type="submit"
            disabled={isLoading || !selectedFile}
            className="bg-black text-white px-8 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={18} />}
            {isLoading ? "Ingesting..." : "Upload & Train"}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm ${
            status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#0F172A]">Managed Documents</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {isFetching ? "..." : `${documents.length} total`}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {isFetching ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 className="animate-spin h-8 w-8" />
              <p className="text-sm italic">Loading your knowledge base...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <FileText size={48} className="opacity-20" />
              <p className="text-sm italic">No documents uploaded yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          <FileText size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0F172A]">{doc.name}</span>
                          <span className="text-[10px] text-gray-500">Indexed on {doc.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        doc.status === "indexed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${doc.status === "indexed" ? "bg-green-600" : "bg-red-600"}`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">{doc.size}</td>
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(doc.name)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
