import React from "react";
import { X, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const NoteModal = ({ isOpen, onClose, date, notes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-indigo-400" />
            Notas del{" "}
            {date &&
              format(new Date(date + "T00:00:00"), "d 'de' MMMM", {
                locale: es,
              })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {notes ? notes : "No hay notas registradas para este día."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
