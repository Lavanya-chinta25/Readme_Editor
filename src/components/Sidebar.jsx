import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, FileText, Folder, FolderPlus, FilePlus, Trash2 } from 'lucide-react';

export default function Sidebar({ nodes, selectedNodeId, onSelectNode, onCreateNode, onDeleteNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTree = (nodesToRender, level = 0) => {
    return nodesToRender.map(node => {
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedNodeId === node.id;
      const hasChildren = node.children && node.children.length > 0;
      const isFolder = node.type === 'folder' || node.isCourse || hasChildren;
      
      const matchSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
      const anyChildMatchSearch = hasChildren && node.children.some(child => 
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (searchQuery && !matchSearch && !anyChildMatchSearch) {
        return null; // Skip if no search match
      }

      return (
        <div key={node.id} className="w-full">
          <div 
            className={`group flex items-center px-2 py-1 cursor-pointer select-none text-sm relative
              ${isSelected ? 'bg-[#373e47] text-white rounded-md font-medium' : 'text-github-text hover:bg-[#21262d] rounded-md'}
            `}
            style={{ paddingLeft: `${(level * 12) + 8}px` }}
              onClick={() => {
                if (hasChildren) {
                  toggleNode(node.id);
                }
                if (!node.isCourse) {
                  onSelectNode(node.id);
                }
              }}
          >
            <span className="mr-1 text-github-muted w-4 h-4 flex items-center justify-center">
              {isFolder ? (
                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                <span className="w-4" />
              )}
            </span>
            <span className="mr-2 text-github-muted">
              {isFolder ? <Folder size={14} /> : <FileText size={14} />}
            </span>
            <span className="truncate flex-1">
              {(!isFolder && !node.content_eng && node.content_tel) ? `${node.title}_tel` : node.title}
            </span>
            
            {/* Create & Delete Actions */}
            <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-[#21262d] px-1 rounded">
              {isFolder && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onCreateNode(node, 'folder'); }} 
                    className="p-1 hover:text-white hover:bg-[#30363d] rounded text-github-muted"
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onCreateNode(node, 'file'); }} 
                    className="p-1 hover:text-white hover:bg-[#30363d] rounded text-github-muted"
                    title="New File"
                  >
                    <FilePlus size={14} />
                  </button>
                </>
              )}
              {!node.isCourse && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteNode(node); }} 
                  className="p-1 hover:text-red-400 hover:bg-[#30363d] rounded text-github-muted"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          
          {hasChildren && (isExpanded || (searchQuery && anyChildMatchSearch)) && (
            <div className="w-full">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-64 h-full bg-[#0d1117] border-r border-github-border flex flex-col flex-shrink-0 overflow-hidden">
      <div className="p-3 border-b border-github-border">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <FileText size={18} className="text-github-text" />
          Content Nodes
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-github-muted" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#010409] border border-github-border text-github-text rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-github-link focus:ring-1 focus:ring-github-link"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
        {nodes.length > 0 ? (
          renderTree(nodes)
        ) : (
          <div className="text-github-muted text-sm text-center mt-10">
            No content found
          </div>
        )}
      </div>
    </div>
  );
}
