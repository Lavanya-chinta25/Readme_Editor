import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EditorPane from '../components/EditorPane';
import PreviewPane from '../components/PreviewPane';
import { fetchContentNodes, fetchNodeContent, updateNodeContent, createNode, deleteNode } from '../services/api';
import { Save, AlertTriangle, Check, RefreshCw, Menu, X, LayoutTemplate } from 'lucide-react';

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  
  const [editingColumn, setEditingColumn] = useState('content_eng');
  
  const [originalContent, setOriginalContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [error, setError] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview'
  
  const [createModal, setCreateModal] = useState(null); // { parentNode, type }
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isDirty = originalContent !== draftContent;

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setIsLoading(true);
    try {
      const { courseTree } = await fetchContentNodes();
      setNodes(courseTree);
      setError(null);
    } catch (err) {
      setError('Failed to load content nodes. Please check your Supabase connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNode = async (nodeId) => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to switch topics?');
      if (!confirm) return;
    }

    setSelectedNodeId(nodeId);
    setSaveStatus(null);
    
    try {
      const data = await fetchNodeContent(nodeId);
      setSelectedNodeData(data);
      
      let contentToEdit = '';
      let column = 'content_eng';
      
      // Auto-detect which column to edit based on the data
      if (!data.content_eng && data.content_tel) {
        contentToEdit = data.content_tel;
        column = 'content_tel';
      } else {
        contentToEdit = data.content_eng || '';
        column = 'content_eng';
      }
      
      setEditingColumn(column);
      setOriginalContent(contentToEdit);
      setDraftContent(contentToEdit);
      
      // On mobile, auto-close sidebar after selection
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Error fetching node details:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedNodeId) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateNodeContent(selectedNodeId, draftContent, editingColumn);
      setOriginalContent(draftContent);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!newNodeTitle.trim() || !createModal) return;

    setIsCreating(true);
    try {
      const { parentNode, type } = createModal;
      
      const payload = {
        title: newNodeTitle.trim(),
        type: type, // 'folder' or 'file'
        course_id: parentNode.isCourse ? parentNode.id : parentNode.course_id,
        parent_id: parentNode.isCourse ? null : parentNode.id
      };

      await createNode(payload);
      setCreateModal(null);
      setNewNodeTitle('');
      await loadNodes(); // Refresh tree
    } catch (err) {
      console.error('Error creating node:', err);
      alert('Failed to create item. Check your database permissions and constraints.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNode = async (node) => {
    if (!window.confirm(`Are you sure you want to delete "${node.title}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteNode(node.id);
      if (selectedNodeId === node.id) {
        setSelectedNodeId(null);
        setDraftContent('');
        setOriginalContent('');
      }
      await loadNodes(); // Refresh tree
    } catch (err) {
      console.error('Error deleting node:', err);
      alert('Failed to delete item. It might have child nodes that need to be deleted first.');
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-github-text font-sans overflow-hidden">
      {/* Header / Nav */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-[#010409] border-b border-github-border flex items-center justify-between px-3 md:px-4 z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            className="md:hidden p-1.5 text-github-muted hover:text-white rounded-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-7 h-7 md:w-8 md:h-8 bg-github-dark border border-github-border rounded-md flex items-center justify-center font-bold text-white shadow-sm text-sm md:text-base">
            R
          </div>
          <h1 className="text-white font-semibold text-base md:text-lg tracking-tight hidden sm:block">README Editor</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-1.5 rounded-full">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-yellow-400 text-xs font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                Unsaved changes
              </span>
            )}
            
            {saveStatus === 'success' && (
              <span className="text-github-success text-sm flex items-center gap-1.5 hidden sm:flex">
                <Check size={16} /> Saved
              </span>
            )}

            <div className="flex bg-[#21262d] rounded-md overflow-hidden border border-github-border mx-1 md:mx-2">
              <button onClick={() => setViewMode('edit')} className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium ${viewMode === 'edit' ? 'bg-[#373e47] text-white' : 'text-github-muted hover:text-white'}`}>Write</button>
              <button onClick={() => setViewMode('preview')} className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium ${viewMode === 'preview' ? 'bg-[#373e47] text-white' : 'text-github-muted hover:text-white'}`}>Preview</button>
            </div>

            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving || !selectedNodeId}
              className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
                !isDirty || !selectedNodeId
                  ? 'bg-[#21262d] text-github-muted cursor-not-allowed border border-transparent'
                  : 'bg-github-success hover:bg-github-successHover text-white border border-[rgba(240,246,252,0.1)]'
              }`}
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mt-14 h-[calc(100vh-56px)] relative">
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 absolute md:static top-0 left-0 h-full z-10 transition-transform duration-200 ease-in-out`}>
          <Sidebar 
            nodes={nodes} 
            selectedNodeId={selectedNodeId} 
            onSelectNode={handleSelectNode}
            onCreateNode={(parentNode, type) => {
              setCreateModal({ parentNode, type });
              setNewNodeTitle('');
            }}
            onDeleteNode={handleDeleteNode}
          />
        </div>
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div className="absolute inset-0 bg-black/50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className="flex flex-1 bg-[#0d1117] w-full min-w-0 flex-col">
          {selectedNodeId ? (
            <div className="flex w-full h-full flex-col">
              <div className={`w-full h-full flex-col ${viewMode === 'preview' ? 'hidden' : 'flex'}`}>
                <EditorPane content={draftContent} onChange={setDraftContent} />
              </div>
              <div className={`w-full h-full flex-col ${viewMode === 'edit' ? 'hidden' : 'flex'}`}>
                <PreviewPane content={draftContent} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-github-muted bg-[#0d1117]">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw size={24} className="animate-spin text-github-link" />
                  <p>Loading your courses...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                  <div className="w-16 h-16 bg-[#21262d] rounded-full flex items-center justify-center border border-github-border">
                    <Save size={24} className="text-github-muted" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 text-lg">No content selected</h3>
                    <p className="text-sm">Select a course or topic from the sidebar to start editing its README content.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-github-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-github-border flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">
                Create new {createModal.type} in {createModal.parentNode.title}
              </h3>
              <button 
                onClick={() => setCreateModal(null)}
                className="text-github-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNode} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-medium text-github-text mb-2">
                  Title
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder={`e.g. ${createModal.type === 'folder' ? 'Chapter 1' : 'Introduction'}`}
                  className="w-full bg-[#0d1117] border border-github-border text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-github-link focus:ring-1 focus:ring-github-link"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(null)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-github-text hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-github-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newNodeTitle.trim()}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-github-success hover:bg-github-successHover border border-[rgba(240,246,252,0.1)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <RefreshCw size={14} className="animate-spin" /> : null}
                  Create {createModal.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
