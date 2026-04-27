import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- DATA MODEL ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'mymemo.notes';

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "브랜드 컬러 가이드라인을 준수하며 모바일 퍼스트 디자인으로 진행합니다. 여백은 8px 배수 시스템을 사용하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링 2판\n3. 구글 엔지니어는 이렇게 일한다",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "개인화된 대시보드 기능을 갖춘 투두 리스트 앱 개발. 다크모드 필수.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString()
  }
];

export default function App() {
  // --- STATE ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
        setNotes(INITIAL_NOTES);
      }
    } else {
      setNotes(INITIAL_NOTES);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // --- COMPUTED VALUES ---
  const allTags = useMemo(() => {
    const tagsCount: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagsCount).map(([name, count]) => ({ name, count }));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm, selectedTag]);

  // --- HANDLERS ---
  const handleAddNote = () => {
    if (!title.trim() && !body.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: title || "제목 없음",
      body: body,
      tags: tagsInput.split(',').map(s => s.trim()).filter(s => s !== ''),
      updatedAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    resetModal();
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("정말로 이 메모를 삭제하시겠습니까?")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const resetModal = () => {
    setTitle('');
    setBody('');
    setTagsInput('');
    setIsModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="min-h-screen flex bg-[#F9F7F2] text-[#1A1A1A] font-sans selection:bg-gray-200">
      {/* SIDEBAR */}
      <aside className="w-[300px] border-r border-[#E5E1DA] p-10 flex flex-col justify-between sticky top-0 h-screen hidden lg:flex">
        <div>
          <h1 className="font-serif italic text-4xl mb-16 tracking-tight">MyMemo</h1>
          
          <nav className="space-y-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 font-bold">Categories</p>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className={`group flex justify-between items-center w-full cursor-pointer transition-all duration-300 ${
                      selectedTag === null ? 'font-bold' : 'opacity-50 hover:opacity-100 hover:pl-2'
                    }`}
                  >
                    <span className="text-[15px]">All Notes</span>
                    <span className="text-[10px] tabular-nums opacity-40">{notes.length}</span>
                  </button>
                </li>
                {allTags.map(tag => (
                  <li key={tag.name}>
                    <button 
                      onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                      className={`group flex justify-between items-center w-full cursor-pointer transition-all duration-300 ${
                        selectedTag === tag.name ? 'font-bold' : 'opacity-50 hover:opacity-100 hover:pl-2'
                      }`}
                    >
                      <span className="text-[15px] truncate mr-2">{tag.name}</span>
                      <span className="text-[10px] tabular-nums opacity-40">{tag.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="space-y-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-5 border border-[#1A1A1A] font-serif italic text-xl hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 active:scale-[0.98]"
          >
            New Entry
          </button>
          <div className="text-center space-y-1">
            <p className="text-[9px] opacity-30 uppercase tracking-[0.2em] font-bold">Local Archive • Edition 2026</p>
            <p className="text-[9px] opacity-20 uppercase tracking-[0.3em]">Built for Minimalist Focus</p>
          </div>
        </div>
      </aside>

      {/* MOBILE TRIGGER (visible when sidebar hidden) */}
      <div className="lg:hidden fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1A1A1A] text-white p-5 rounded-full shadow-2xl active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 md:p-14 lg:p-20 flex flex-col min-w-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div className="space-y-2">
            <h2 className="text-[11px] uppercase tracking-[0.4em] font-black opacity-30">Archive View</h2>
            <h3 className="font-serif text-5xl md:text-7xl leading-none tracking-tighter">
              {selectedTag ? <span className="italic">{selectedTag}</span> : "Curated Thoughts"}
            </h3>
          </div>
          
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search archives..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-[#1A1A1A]/20 focus:border-[#1A1A1A] py-3 outline-none font-serif italic text-lg placeholder:opacity-20 transition-all"
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20" size={16} />
          </div>
        </header>

        {/* CARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-10">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map(note => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative pt-8 pb-10 border-t border-[#1A1A1A] flex flex-col justify-between min-h-[240px]"
              >
                <div className="absolute right-0 top-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 text-[10px] uppercase font-black tracking-widest hover:underline decoration-2"
                  >
                    Discard Entry
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-3 opacity-40 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black">
                      {formatDate(note.updatedAt)}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-[#1A1A1A]" />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black">
                      ID: {note.id.toString().slice(-4)}
                    </p>
                  </div>
                  
                  <h4 className="font-serif text-3xl md:text-4xl leading-tight mb-6 group-hover:italic transition-all duration-500 cursor-default">
                    {note.title}
                  </h4>
                  
                  <p className="text-[15px] leading-relaxed opacity-70 mb-8 line-clamp-4 font-light text-justify hyphens-auto">
                    {note.body}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 border border-[#1A1A1A]/10 rounded-full hover:border-[#1A1A1A] transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length === 0 && (
                    <span className="text-[9px] uppercase tracking-[0.2em] opacity-20 font-bold italic">No tags associated</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="col-span-full py-40 border-t border-b border-[#1A1A1A]/10 flex flex-col items-center">
              <h4 className="font-serif italic text-3xl opacity-20 mb-4">The page is blank</h4>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 text-center max-w-xs leading-loose">
                Your search yielded no results in the current collection. 
                Consider adding a new entry to your archive.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#F9F7F2]/95 backdrop-blur-md"
              onClick={resetModal}
            />
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative bg-white border border-[#1A1A1A] w-full max-w-3xl p-8 md:p-16 shadow-2xl"
            >
              <button 
                onClick={resetModal} 
                className="absolute top-8 right-8 text-4xl font-serif text-gray-200 hover:text-[#1A1A1A] transition-colors"
                aria-label="Close"
              >
                ×
              </button>
              
              <h2 className="font-serif text-5xl mb-16 tracking-tighter italic">Create New Entry</h2>
              
              <div className="space-y-12">
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-4 group-focus-within:opacity-100 transition-opacity">Entry Headline</label>
                  <input 
                    type="text" 
                    placeholder="Enter headline..."
                    className="w-full border-b border-[#1A1A1A] py-4 outline-none font-serif text-3xl md:text-4xl placeholder:opacity-10 bg-transparent focus:italic transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-4 group-focus-within:opacity-100 transition-opacity">Manifesto</label>
                  <textarea 
                    placeholder="Write your thoughts..."
                    rows={6}
                    className="w-full border-b border-[#1A1A1A] py-4 outline-none text-xl md:text-2xl font-light leading-relaxed resize-none placeholder:opacity-10 bg-transparent"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 group-focus-within:opacity-100 transition-opacity">Tagging</label>
                    <span className="text-[9px] opacity-20 italic">Comma separated nomenclature</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Design, Editorial, Philosophy"
                    className="w-full border-b border-[#1A1A1A] py-4 outline-none font-serif italic text-lg placeholder:opacity-10 bg-transparent"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="pt-10 flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={handleAddNote}
                    disabled={!title.trim() && !body.trim()}
                    className="flex-1 bg-[#1A1A1A] text-white px-10 py-5 font-serif italic text-2xl hover:bg-transparent hover:text-[#1A1A1A] border border-[#1A1A1A] transition-all duration-500 disabled:opacity-20 active:scale-95 shadow-xl shadow-gray-200"
                  >
                    Archive Entry
                  </button>
                  <button 
                    onClick={resetModal}
                    className="px-10 py-5 text-[11px] uppercase tracking-[0.4em] font-black opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-8 left-[340px] hidden xl:block opacity-10">
        <p className="text-[8px] uppercase tracking-[0.5em] font-black">All rights reserved to the author</p>
      </footer>
    </div>
  );
}

