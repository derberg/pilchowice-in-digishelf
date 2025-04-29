import React, { useState, useMemo } from "react";
import type { DocumentMetadata, ResourceViewMode } from "../lib/types";
import { FaList, FaThLarge } from "react-icons/fa";

// --- date helper functions -------------------------------------
const now = () => new Date();
const startOfWeek = (d: Date) => {
  const dd = new Date(d);
  const day = dd.getDay(); // 0=Sun,1=Mon
  const shift = day === 0 ? 6 : day - 1;
  dd.setDate(dd.getDate() - shift);
  dd.setHours(0, 0, 0, 0);
  return dd;
};
const startOfMonth = (d: Date) => {
  const dd = new Date(d);
  dd.setDate(1);
  dd.setHours(0, 0, 0, 0);
  return dd;
};
const startOfYear = (d: Date) => {
  const dd = new Date(d);
  dd.setMonth(0, 1);
  dd.setHours(0, 0, 0, 0);
  return dd;
};

// --- date filter options ---------------------------------------
const dateFilters = [
  { label: 'Dodane w tym tygodniu', value: 'thisWeek' },
  { label: 'Dodane w poprzednim tygodniu', value: 'lastWeek' },
  { label: 'Dodane w poprzednim miesiącu', value: 'lastMonth' },
  { label: 'Dodane w tym roku', value: 'thisYear' },
  { label: 'Dodane przed obecnym rokiem', value: 'lastYearUp' },
] as const;
type DateFilter = typeof dateFilters[number]['value'];

// --- keyword grouping mapping ----------------------------------
const keywordGroups: Record<string, string[]> = {
  "Nieborowice": ["Nieborowice", "Nieborowitz", "Neubersdorf"],
  "Pilchowice": ["Pilchowice", "Pilchowitz", "Bilchengrund"],
  "Wilcza": ["Wilcza"],
  "Kuźnia Nieborowska": ["Kuźnia Nieborowska", "Nieborowitz Hammer"],
  "Stanica": ["Stanica", "Stanitz"],
  "Leboszowice": ["Leboszowice", "Leboschowitz", "Klein-garben"],
  "Żernica": ["Żernica", "Zernitz", "Haselgrund"],
};
const groupMap: Record<string, string> = {};
Object.entries(keywordGroups).forEach(([label, syns]) => {
  syns.forEach(s => {
    groupMap[s] = label;
  });
});

interface Props {
  documents: DocumentMetadata[];
}

export default function ResourceList({ documents }: Props) {
  const [viewMode, setViewMode] = useState<ResourceViewMode>({
    mode: "gallery",
    showTranslations: false,
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // derive unique group labels present in docs
  const allKeywordGroups = useMemo(() => {
    const labels = new Set<string>();
    documents.forEach(doc => {
      doc.keywords.forEach(k => {
        const label = groupMap[k] || k;
        labels.add(label);
      });
    });
    return Array.from(labels).sort();
  }, [documents]);

  // compute filtered list by groups and date
  const filteredDocuments = useMemo(() => {
    const nowDate = now();
    const thisWeekStart = startOfWeek(nowDate);
    const lastWeekStart = startOfWeek(new Date(nowDate.getTime() - 7 * 86400000));
    const thisMonthStart = startOfMonth(nowDate);
    const lastMonthStart = startOfMonth(
      new Date(nowDate.getFullYear(), nowDate.getMonth() - 1)
    );
    const thisYearStart = startOfYear(nowDate);

    return documents.filter((doc) => {
      // group-based keyword filtering
      if (
        selectedGroups.length > 0 &&
        !doc.keywords.some(k => selectedGroups.includes(groupMap[k] || k))
      ) {
        return false;
      }
      // date filtering
      if (selectedDateFilter) {
        const docDate = new Date(doc.addDate);
        switch (selectedDateFilter) {
          case 'thisWeek':
            if (docDate < thisWeekStart) return false;
            break;
          case 'lastWeek':
            if (docDate < lastWeekStart || docDate >= thisWeekStart) return false;
            break;
          case 'lastMonth':
            if (docDate < lastMonthStart || docDate >= thisMonthStart) return false;
            break;
          case 'thisYear':
            if (docDate < thisYearStart) return false;
            break;
          case 'lastYearUp':
            if (docDate >= thisYearStart) return false;
            break;
        }
      }
      return true;
    });
  }, [documents, selectedGroups, selectedDateFilter]);

  return (
    <div className='container mx-auto px-4 mt-4'>
      {/* view-mode controls and mobile filter toggle */}
      <div className='mb-6 flex justify-between items-center relative'>
        <div className='flex gap-4'>
          <button
            onClick={() => setViewMode({ ...viewMode, mode: "gallery" })}
            className={`p-2 cursor-pointer ${
              viewMode.mode === "gallery" ? "text-[#3C2A21]" : "text-gray-600"
            }`}
          >
            <FaThLarge />
          </button>
          <button
            onClick={() => setViewMode({ ...viewMode, mode: "list" })}
            className={`p-2 cursor-pointer ${
              viewMode.mode === "list" ? "text-[#3C2A21]" : "text-gray-600"
            }`}
          >
            <FaList />
          </button>
        </div>
        {/* tylko na mobilce */}
        <button
          className='md:hidden px-4 py-2 bg-[#3C2A21] text-white rounded relative'
          onClick={() => setShowFilters(prev => !prev)}
        >
          {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>
      </div>

      {/* container filtrów: ukryty na mobile, chyba że toggled, widoczny zawsze na md+ */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block relative`}>
        {/* grouped keyword filter */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-2 text-[#3C2A21]'>
            Filtruj według lokalizacji (grupy słów kluczowych):
          </h3>
          <div className='flex flex-wrap gap-2 relative'>
            {allKeywordGroups.map(label => {
              const syns = keywordGroups[label] || [label];
              const others = syns.filter(s => s !== label);
              const display = `${label}${others.length ? ` (${others.join(', ')})` : ''}`;
              return (
                <button
                  key={label}
                  onClick={() =>
                    setSelectedGroups(prev =>
                      prev.includes(label)
                        ? prev.filter(g => g !== label)
                        : [...prev, label]
                    )
                  }
                  className={`px-3 py-1 rounded-full cursor-pointer ${
                    selectedGroups.includes(label)
                      ? "bg-[#3C2A21] text-white"
                      : "bg-[#D5CEA3]"
                  }`}
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>

        {/* date filter */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-2 text-[#3C2A21]'>
            Filtruj według daty dodania:
          </h3>
          <div className='flex flex-wrap gap-2 relative'>
            {dateFilters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() =>
                  setSelectedDateFilter(prev => (prev === value ? null : value))
                }
                className={`px-3 py-1 rounded-full cursor-pointer ${
                  selectedDateFilter === value
                    ? "bg-[#3C2A21] text-white"
                    : "bg-[#D5CEA3]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* documents display */}
      <div className={
        viewMode.mode === "gallery"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          : "space-y-4"
      }>
        {filteredDocuments.map(doc => (
          <div
            key={`${doc.recordId}-${doc.pageNumber}`}
            className={`relative border border-[#D5CEA3] rounded-lg p-4 shadow-xl bg-[#F8F5F2] ${
              viewMode.showTranslations ? "flex gap-4 relative" : ""
            }`}
          >
            {/* gallery view */}
            {viewMode.mode === "gallery" && (
              <div className={viewMode.showTranslations ? 'w-1/2' : 'w-full'}>
                <a href={`/zasoby/${doc.recordId}/${doc.pageNumber}`}>
                  <p className='text-sm mb-2'>
                    <strong>Słowa kluczowe:</strong> {doc.keywords.join(", ")}                  
                  </p>
                  <hr />
                  <img
                    src={`/thumbnails/${doc.recordId}.jpg`}
                    alt={`Strona ${doc.pageNumber} z ${doc.newspaperTitle}`}
                    className='w-1/2 h-1/2 mx-auto object-cover mb-4 mt-4 bg-[#b5a896] border-2 border-gray-500 rounded-md'
                  />
                  <hr />
                  <h3 className='mt-2 '>
                    <strong>Źródło:</strong> {doc.newspaperTitle}
                  </h3>
                  <p className='text-sm'>
                    <strong>Rok:</strong> {doc.year}, <strong>Strona:</strong> {doc.pageNumber}
                  </p>
                </a>
              </div>
            )}
            {/* list view */}
            {viewMode.mode === "list" && (
              <div className={viewMode.showTranslations ? 'w-1/2' : 'w-full'}>
                <a
                  href={`/zasoby/${doc.recordId}/${doc.pageNumber}`}
                  className='flex gap-4 items-start'
                >
                  <img
                    src={`/thumbnails/${doc.recordId}.jpg`}
                    alt={`Strona ${doc.pageNumber} z ${doc.newspaperTitle}`}
                    className='w-[5%] h-auto object-cover bg-[#b5a896] border-2 border-gray-500 rounded-md'
                  />
                  <div className='flex-1'>
                    <p className='text-sm mb-2'>
                      <strong>Słowa kluczowe:</strong> {doc.keywords.join(", ")}
                    </p>
                    <hr />
                    <h3 className='mt-2'>
                      <strong>Źródło:</strong> {doc.newspaperTitle}
                    </h3>
                    <p className='text-sm'>
                      <strong>Rok:</strong> {doc.year}, <strong>Strona:</strong> {doc.pageNumber}
                    </p>
                  </div>
                </a>
              </div>
            )}
            {/* translations */}
            {viewMode.showTranslations && (
              <div className='w-1/2'>
                {doc.translations.map((translation, idx) => (
                  <div key={idx} className='bg-[#F5F5DC] p-3 rounded mb-2'>
                    <p className='text-sm font-semibold mb-1 text-[#3C2A21]'>
                      Słowo kluczowe: {translation.keyword}
                    </p>
                    <p className='text-sm'>{translation.translatedText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
