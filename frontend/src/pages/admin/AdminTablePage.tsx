import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { tableApi } from '../../api/tableApi';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../types';
import { ui } from '../../utils/swalHelper';
import { RefreshCw } from 'lucide-react';
import { jsPDF } from "jspdf";

export default function AdminTablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Table | null>(null);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());
  const [qrTimestamps, setQrTimestamps] = useState<Record<string, number>>({});

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Get dynamic frontend URL
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tableRes = await tableApi.getTables();
      const tables = (tableRes as any).data?.data || (tableRes as any).data || [];
      setTables(Array.isArray(tables) ? tables : []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tableApi.createTable(newTable.name, newTable.capacity);
      setIsAddModalOpen(false);
      setNewTable({ name: '', capacity: 4 });
      ui.alertSuccess("Table added successfully");
      fetchData();
    } catch (err) {
      ui.alertError("Failed to add table");
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    try {
      await tableApi.updateTable(editingTable.id, {
        name: editingTable.name,
        capacity: editingTable.capacity,
        isActive: editingTable.isActive,
      });
      setIsEditModalOpen(false);
      ui.alertSuccess("Table updated successfully");
      fetchData();
    } catch (err) {
      ui.alertError("Failed to update table");
    }
  };

  const handleDeleteTable = async (id: string) => {
    const confirm = await ui.confirmDelete("Delete this table?", "This action cannot be undone.");
    if (confirm.isConfirmed) {
      try {
        await tableApi.deleteTable(id);
        ui.alertSuccess("Table deleted successfully");
        fetchData();
      } catch (error) {
        ui.alertError("Failed to delete table");
      }
    }
  }

  const handleRegenerateQR = async (id: string) => {
    setRegeneratingIds(prev => new Set(prev).add(id));
    try {
      await tableApi.regenerateTableQR(id);

      // Update timestamp to force QR re-render
      setQrTimestamps(prev => ({ ...prev, [id]: Date.now() }));

      ui.alertSuccess("QR code regenerated successfully");
      fetchData(); // Refresh to get new QR
    } catch (error) {
      console.error(`[Frontend] Failed to regenerate QR:`, error);
      ui.alertError("Failed to regenerate QR code");
    } finally {
      setRegeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRegenerateAllQRs = async () => {
    const confirm = await ui.confirmDelete(
      "Regenerate ALL QR Codes?",
      "This will invalidate all existing QR codes. Customers will need to scan the new codes."
    );

    if (confirm.isConfirmed) {
      setRegeneratingAll(true);
      try {
        const result = await tableApi.regenerateAllQRs();

        // Update timestamps for all tables to force re-render
        const newTimestamps: Record<string, number> = {};
        tables.forEach(table => {
          newTimestamps[table.id] = Date.now();
        });
        setQrTimestamps(newTimestamps);

        ui.alertSuccess((result as any).data.message || "All QR codes regenerated successfully");
        fetchData(); // Refresh all tables
      } catch (error) {
        console.error(`[Frontend] Failed to regenerate all QR codes:`, error);
        ui.alertError("Failed to regenerate QR codes");
      } finally {
        setRegeneratingAll(false);
      }
    }
  };

  const handleDownloadAllPDF = async () => {
    if (tables.length === 0) {
      ui.alertError("No tables to download");
      return;
    }

    const confirm = await ui.confirmAction(
      "Download All QRs?",
      `This will generate a PDF with ${tables.length} pages.`,
      "Download"
    );

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      // Fetch pre-generated QR images from backend
      const res = await tableApi.getAllQRImages();
      console.log('DEBUG: getAllQRImages response:', res);
      
      const qrData = (res as any).data?.data || (res as any).data || [];
      console.log('DEBUG: Parsed qrData:', qrData);

      if (!qrData || qrData.length === 0) {
        console.error('DEBUG: No QR data found. key check:', Object.keys(res));
        throw new Error("No QR data received from server");
      }

      const doc = new jsPDF();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      qrData.forEach((item: any, index: number) => {
        if (index > 0) doc.addPage();

        // Title: Table Name
        doc.setFontSize(24);
        doc.text(item.name, width / 2, 40, { align: 'center' });

        // Subtitle: Capacity
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(`Capacity: ${item.capacity}`, width / 2, 50, { align: 'center' });

        // QR Image from Data URL
        if (item.qrDataUrl) {
          const qrSize = 100;
          doc.addImage(item.qrDataUrl, 'PNG', (width - qrSize) / 2, 60, qrSize, qrSize);
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Scan to order", width / 2, height - 20, { align: 'center' });
      });

      doc.save("All_Tables_QR.pdf");
      ui.alertSuccess("PDF Downloaded successfully");

    } catch (error: any) {
      console.error("PDF Gen Error Full:", error);
      ui.alertError(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Table & QR Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage table layout, QR codes and status</p>
        </div>
        <div className="flex gap-3">
          <button
             onClick={handleDownloadAllPDF}
             className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-all font-medium shadow-sm hover:shadow-md"
          >
             <span>Download All QR (PDF)</span>
          </button>
          <button
            onClick={handleRegenerateAllQRs}
            disabled={regeneratingAll}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={regeneratingAll ? 'animate-spin' : ''} />
            <span>{regeneratingAll ? 'Regenerating...' : 'Regenerate All QR'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <span>+ Add New Table</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all group relative overflow-hidden">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                {table.isActive ? 'Active' : 'Stopped'}
              </span>
            </div>

            <div className="flex flex-col items-center mb-6 mt-2">
              <div
                className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-gray-200 p-2 mb-4 group-hover:border-orange-200 transition-colors cursor-pointer"
                onClick={() => setSelectedQR(table)}
              >
                <QRCodeSVG
                  id={`qr-table-${table.id}`}
                  value={`${table.qrCodeUrl || `${frontendUrl}/?tableId=${table.id}`}${qrTimestamps[table.id] ? `&t=${qrTimestamps[table.id]}` : ''}`}
                  size={100}
                  className="w-full h-full"
                  level="M"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{table.name}</h3>
              <p className="text-gray-500 text-sm font-medium mt-1">Capacity: {table.capacity} people</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setEditingTable(table);
                  setIsEditModalOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                Configure
              </button>
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => handleRegenerateQR(table.id)}
              disabled={regeneratingIds.has(table.id)}
              className="w-full mt-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={regeneratingIds.has(table.id) ? 'animate-spin' : ''} />
              {regeneratingIds.has(table.id) ? 'Regenerating...' : 'Regenerate QR'}
            </button>

            <button
              onClick={() => setSelectedQR(table)}
              className="w-full mt-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 transition-colors"
            >
              View Large QR
            </button>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No tables yet. Add a new table.
        </div>
      )}

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddTable} className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Table</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Table 01"
                  required
                  value={newTable.name}
                  onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (people)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                  min={1}
                  value={newTable.capacity}
                  onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 shadow-sm">Add Table</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT STATUS */}
      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleUpdateTable} className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Configure: {editingTable.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Currently only status update is supported.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={editingTable.name}
                  onChange={e => setEditingTable({ ...editingTable, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={editingTable.capacity}
                  onChange={e => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  value={editingTable.isActive ? 'true' : 'false'}
                  onChange={e => setEditingTable({ ...editingTable, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Stopped</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 shadow-sm">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL QR LARGE */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">{selectedQR.name}</h2>
            <p className="text-gray-500 mb-6 font-medium text-sm">Scan QR code to order</p>

            <div className="bg-white p-4 rounded-xl border-4 border-orange-100 mb-6">
              <QRCodeSVG
                id={`qr-${selectedQR.id}`}
                value={`${selectedQR.qrCodeUrl || `${frontendUrl}/?tableId=${selectedQR.id}`}${qrTimestamps[selectedQR.id] ? `&t=${qrTimestamps[selectedQR.id]}` : ''}`}
                size={200}
                level="H"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const svg = document.getElementById(`qr-${selectedQR.id}`);
                  if (svg) {
                    // Convert SVG to PNG for better print quality
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();

                    canvas.width = 800;
                    canvas.height = 800;

                    img.onload = () => {
                      ctx?.drawImage(img, 0, 0, 800, 800);
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `QR_${selectedQR.name}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }
                      }, 'image/png');
                    };

                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                  }
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold shadow-sm hover:bg-orange-700 transition-colors"
              >
                Download (PNG)
              </button>
              <button
                onClick={() => {
                  const svg = document.getElementById(`qr-${selectedQR.id}`);
                  if (svg) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();

                    // High resolution for PDF
                    canvas.width = 1000;
                    canvas.height = 1000;

                    img.onload = () => {
                      ctx?.drawImage(img, 0, 0, 1000, 1000);
                      const imgData = canvas.toDataURL('image/png');

                      // Create PDF
                      const doc = new jsPDF();
                      const width = doc.internal.pageSize.getWidth();
                      const height = doc.internal.pageSize.getHeight();

                      // Title
                      doc.setFontSize(24);
                      doc.text(selectedQR.name, width / 2, 40, { align: 'center' });

                      // Instructions
                      doc.setFontSize(14);
                      doc.setTextColor(100);
                      doc.text("Scan to order", width / 2, 50, { align: 'center' });

                      // QR Image (Centered)
                      const qrSize = 100;
                      doc.addImage(imgData, 'PNG', (width - qrSize) / 2, 60, qrSize, qrSize);

                      // Footer
                      doc.setFontSize(10);
                      doc.setTextColor(150);
                      doc.text("Smart Restaurant System", width / 2, height - 20, { align: 'center' });

                      // Download
                      doc.save(`QR_${selectedQR.name}.pdf`);
                    };

                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                  }
                }}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                Download (PDF)
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="w-full text-gray-500 py-2 font-medium hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
