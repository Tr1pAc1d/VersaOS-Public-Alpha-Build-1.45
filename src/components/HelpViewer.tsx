import React, { useState } from 'react';
import { Book, ChevronRight, ChevronDown, HelpCircle, ArrowLeft, ArrowRight, Home, ImageOff } from 'lucide-react';
import { HELP_TOPICS, HelpTopic } from '../utils/helpContent';

export const HelpViewer = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('welcome');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    new Set(['company_info', 'desktop_basics', 'file_management', 'network_services', 'applications', 'advanced_tools', 'developer_guide'])
  );
  const [history, setHistory] = useState<string[]>(['welcome']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const findTopic = (id: string, topics: HelpTopic[] = HELP_TOPICS): HelpTopic | undefined => {
    for (const topic of topics) {
      if (topic.id === id) return topic;
      if (topic.children) {
        const found = findTopic(id, topic.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedTopic = findTopic(selectedTopicId);

  const navigateTo = (id: string) => {
    setSelectedTopicId(id);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(id);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    // Auto-expand parent
    const autoExpand = (topics: HelpTopic[]): boolean => {
      for (const t of topics) {
        if (t.id === id) return true;
        if (t.children && autoExpand(t.children)) {
          setExpandedTopics(prev => new Set(prev).add(t.id));
          return true;
        }
      }
      return false;
    };
    autoExpand(HELP_TOPICS);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSelectedTopicId(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSelectedTopicId(history[newIndex]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderSidebarItem = (topic: HelpTopic, depth: number = 0) => {
    const isExpanded = expandedTopics.has(topic.id);
    const isSelected = selectedTopicId === topic.id;
    const hasChildren = topic.children && topic.children.length > 0;

    return (
      <div key={topic.id}>
        <div
          className={`flex items-center gap-1 py-0.5 px-1 cursor-default select-none text-[11px] ${isSelected ? 'bg-[#000080] text-white' : 'hover:bg-blue-100'}`}
          style={{ paddingLeft: depth * 12 + 4 }}
          onClick={() => navigateTo(topic.id)}
        >
          {hasChildren ? (
            <div
              className="w-3 h-3 flex items-center justify-center hover:bg-gray-400"
              onClick={(e) => { e.stopPropagation(); toggleExpand(topic.id); }}
            >
              {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </div>
          ) : (
            <div className="w-3" />
          )}
          <Book size={12} className={isSelected ? 'text-white' : 'text-blue-700'} />
          <span className="truncate">{topic.title}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {topic.children!.map(child => renderSidebarItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="flex h-full bg-[#c0c0c0] font-sans overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-52 shrink-0 flex flex-col border-r-2 border-r-gray-500">
        <div className="bg-[#000080] text-white text-[11px] font-bold px-2 py-1 flex items-center gap-2">
          <HelpCircle size={14} />
          Contents
        </div>
        <div className="flex-1 overflow-y-auto bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-1">
          {HELP_TOPICS.map(topic => renderSidebarItem(topic))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-8 border-b border-gray-500 bg-[#c0c0c0] flex items-center px-2 gap-4">
          <div className="flex gap-1">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold disabled:opacity-40"
            >
              <ArrowLeft size={10} /> Back
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold disabled:opacity-40"
            >
              Forward <ArrowRight size={10} />
            </button>
          </div>
          <button
            onClick={() => navigateTo('welcome')}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold"
          >
            <Home size={10} /> Home
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 bg-white m-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white scrollbar-thin">
          {selectedTopic && (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Title */}
              <div className="flex items-center gap-3 border-b-2 border-blue-800 pb-2 mb-4">
                {selectedTopic.icon && <selectedTopic.icon size={24} className="text-blue-800" />}
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{selectedTopic.title}</h1>
              </div>

              {/* Description */}
              <div className="text-sm leading-relaxed text-gray-800 font-medium">
                {selectedTopic.description}
              </div>

              {/* Single image */}
              {selectedTopic.image && !selectedTopic.images && (
                <div className="p-2 bg-gray-200 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-md inline-block max-w-full">
                  <img
                    src={selectedTopic.image}
                    alt={selectedTopic.title}
                    className="max-w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'flex items-center gap-2 text-gray-500 text-xs p-2';
                        placeholder.innerHTML = '<span>⚠️ Image not available</span>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                  <p className="text-[10px] text-gray-600 mt-1 italic text-center">Visual guide: {selectedTopic.title}</p>
                </div>
              )}

              {/* Multiple images gallery */}
              {selectedTopic.images && selectedTopic.images.length > 0 && (
                <div className="space-y-3 mt-2">
                  <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Screenshots & Visual Guide:</p>
                  <div className="flex flex-col gap-4">
                    {selectedTopic.images.map((img, i) => (
                      <div key={i} className="p-2 bg-gray-200 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-md">
                        <img
                          src={img.src}
                          alt={img.caption}
                          className="max-w-full h-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <p className="text-[10px] text-gray-600 mt-1 italic text-center">{img.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {selectedTopic.steps && (
                <div className="space-y-2 mt-4 bg-blue-50 border-l-4 border-blue-800 p-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900">Step-by-Step Guide:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-blue-950 font-semibold">
                    {selectedTopic.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Child topic links */}
              {selectedTopic.children && selectedTopic.children.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">Sub-topics:</p>
                  <div className="flex flex-col gap-1">
                    {selectedTopic.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => navigateTo(child.id)}
                        className="flex items-center gap-2 text-left text-[12px] text-[#000080] hover:underline px-2 py-1 hover:bg-blue-50 border border-transparent hover:border-blue-300"
                      >
                        <ChevronRight size={12} className="text-blue-600 shrink-0" />
                        <Book size={11} className="text-blue-600 shrink-0" />
                        {child.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-200 mt-8">
                <p className="text-[10px] text-gray-400 italic">Vespera OS Help Utility v1.1.0 - Documentation is subject to experimental Synap-C indexing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
