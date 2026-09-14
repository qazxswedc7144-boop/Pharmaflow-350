import React, { useState, useMemo } from 'react';
import { 
  Sparkles, X, CheckCircle2, AlertTriangle, FileText, 
  Layers, RefreshCw, ArrowRight, ShieldCheck, Database, Loader2
} from 'lucide-react';
import { SmartImportSupplierResolution } from './SmartImportSupplierResolution';
import { SmartImportBatchSummary } from './SmartImportBatchSummary';
import { SmartImportBulkActions } from './SmartImportBulkActions';
import { SmartImportProductResolution } from './SmartImportProductResolution';

interface SmartImportProcessingCenterProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  onApply: (data: any) => void;
  onApplyAndSaveImmediately: (data: any) => void;
  isProcessing?: boolean;
}

export const SmartImportProcessingCenter: React.FC<SmartImportProcessingCenterProps> = ({
  isOpen,
  onClose,
  analysisResult,
  onApply,
  onApplyAndSaveImmediately,
  isProcessing = false
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unresolved' | 'resolved'>('all');

  if (!isOpen) return null;

  const rows = analysisResult?.rows || [];
  const totalRows = rows.length;
  const resolvedCount = rows.filter((r: any) => r.isResolved || r.matchedProductId).length;
  const unresolvedCount = totalRows - resolvedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col w-full max-w-md h-[85vh] bg-slate-900 text-slate-100 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 relative">
        
        {/* شاشة التحميل / المعالجة المصغرة والمرتبة */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-4 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">جاري تشغيل محرك OCR المحلي للتعرف على محتويات المستند...</h3>
            <p className="text-xs text-slate-400 mb-6">جاري فحص سلامة المستند، مطابقة الأصناف والمورد...</p>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
              <div className="w-2/3 h-full bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            >
              إلغاء المعالجة
            </button>
          </div>
        )}

        {/* الترويسة العلوية المصغرة والمضغوطة للهاتف */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">مركز مراجعة الاستيراد</h2>
              <p className="text-[10px] text-slate-400">IMAGE • LocalOcrEngine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* معلومات الفاتورة المدمجة (رقم الفاتورة والتاريخ بجوار بعضهما) */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-700/60 text-xs shrink-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">رقم الفاتورة:</span>
              <span className="font-semibold text-emerald-400">{analysisResult?.invoiceNumber || 'غير مكتشف'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">التاريخ:</span>
              <span className="font-medium text-slate-200">{analysisResult?.invoiceDate || '---'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">المورد:</span>
            <span className="font-medium truncate max-w-[220px]">{analysisResult?.supplierName || 'غير مكتشف'}</span>
          </div>
        </div>

        {/* قسم الملخص المصغر */}
        <div className="px-4 py-2 bg-slate-800/20 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">الملخص:</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{totalRows} أصناف</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {resolvedCount} مرتبطة
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {unresolvedCount}
              </span>
            </div>
          </div>
        </div>

        {/* منطقة المحتوى القابلة للتمرير */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SmartImportSupplierResolution 
            supplierName={analysisResult?.supplierName}
            onResolve={(name) => {}} 
          />

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">بنود الفاتورة والمطابقة</div>
            {rows.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">لا توجد أصناف مستخرجة</div>
            ) : (
              rows.map((row: any, index: number) => (
                <SmartImportProductResolution 
                  key={index}
                  row={row}
                  index={index}
                />
              ))
            )}
          </div>
        </div>

        {/* الأزرار السفلية المضغوطة والمجاورة (shrink-0) */}
        <div className="px-4 py-3 bg-slate-800/90 border-t border-slate-700 shrink-0 flex items-center gap-2">
          <button
            onClick={() => onApply(analysisResult)}
            disabled={isProcessing}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد وتعبئة ({totalRows} صنف)</span>
          </button>

          <button
            onClick={() => onApplyAndSaveImmediately(analysisResult)}
            disabled={isProcessing}
            className="py-2 px-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-600 disabled:opacity-50"
          >
            <span>حفظ فوري</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-3 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
