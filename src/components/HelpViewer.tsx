import React, { useState } from 'react';
import { Book, ChevronRight, ChevronDown, HelpCircle, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { HELP_TOPICS, HelpTopic } from '../utils/helpContent';

export const HelpViewer = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('welcome');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['company_info', 'desktop_basics', 'file_management']));

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
          onClick={() => setSelectedTopicId(topic.id)}
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

  return (
    <div className="flex h-full bg-[#c0c0c0] font-sans overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-48 shrink-0 flex flex-col border-r-2 border-r-gray-500">
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
            <button className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold grayscale opacity-50">
              <ArrowLeft size={10} /> Back
            </button>
            <button className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold grayscale opacity-50">
               Forward <ArrowRight size={10} />
            </button>
          </div>
          <button 
            onClick={() => setSelectedTopicId('welcome')}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold"
          >
            <Home size={10} /> Home
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 bg-white m-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white scrollbar-thin">
          {selectedTopic && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-blue-800 pb-2 mb-4">
                {selectedTopic.icon && <selectedTopic.icon size={24} className="text-blue-800" />}
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{selectedTopic.title}</h1>
              </div>

              <div className="text-sm leading-relaxed text-gray-800 font-medium">
                {selectedTopic.description}
              </div>

              {selectedTopic.image && (
                <div className="p-2 bg-gray-200 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-md inline-block max-w-full">
                  <img 
                    src={selectedTopic.image} 
                    alt={selectedTopic.title} 
                    className="max-w-full h-auto"
                    onError={(e) => {
                      (e.target as any).src = 'https://placehold.co/400x300?text=Help+Image+Missing';
                    }}
                  />
                  <p className="text-[10px] text-gray-600 mt-1 italic text-center">Visual guide: {selectedTopic.title}</p>
                </div>
              )}

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

              <div className="pt-8 border-t border-gray-200 mt-8">
                <p className="text-[10px] text-gray-400 italic">Vespera OS Help Utility v1.0.2 - Documentation is subject to experimental Synap-C indexing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
