import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NodeType = 'folder' | 'text' | 'app' | 'system' | 'shortcut';

export interface VFSNode {
  id: string;
  parentId: string | null;
  name: string;
  type: NodeType;
  content?: string;
  target?: string;
  iconType?: string;
  customIcon?: string;
  createdAt: number;
  updatedAt: number;
}

interface FileSystemContextType {
  nodes: Record<string, VFSNode>;
  createNode: (parentId: string | null, name: string, type: NodeType, content?: string, target?: string, iconType?: string) => string;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  saveFileContent: (id: string, newContent: string) => void;
  getNode: (id: string) => VFSNode | undefined;
  getChildren: (parentId: string | null) => VFSNode[];
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

const INITIAL_VFS: Record<string, VFSNode> = {
  'root': { id: 'root', parentId: null, name: '/', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'usr': { id: 'usr', parentId: 'root', name: 'usr', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'usr-vespera': { id: 'usr-vespera', parentId: 'usr', name: 'vespera', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'home': { id: 'home', parentId: 'root', name: 'home', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'home-admin': { id: 'home-admin', parentId: 'home', name: 'admin', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'home-admin-desktop': { id: 'home-admin-desktop', parentId: 'home-admin', name: 'Desktop', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'var': { id: 'var', parentId: 'root', name: 'var', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'var-log': { id: 'var-log', parentId: 'var', name: 'log', type: 'folder', createdAt: Date.now(), updatedAt: Date.now() },
  'readme': { id: 'readme', parentId: 'home-admin-desktop', name: 'README.TXT', type: 'text', content: 'Welcome to VersaOS.\n\nProperty of Vespera Systems.\n\nUNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.', createdAt: Date.now(), updatedAt: Date.now() },
};

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Record<string, VFSNode>>(() => {
    const saved = localStorage.getItem('versa_vfs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse VFS from localStorage', e);
      }
    }
    return INITIAL_VFS;
  });

  useEffect(() => {
    localStorage.setItem('versa_vfs', JSON.stringify(nodes));
  }, [nodes]);

  const createNode = (parentId: string | null, name: string, type: NodeType, content: string = '', target?: string, iconType?: string) => {
    const id = crypto.randomUUID();
    const newNode: VFSNode = {
      id,
      parentId,
      name,
      type,
      content: type === 'text' ? content : undefined,
      target: type === 'shortcut' ? target : undefined,
      iconType: type === 'shortcut' ? iconType : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNodes(prev => ({ ...prev, [id]: newNode }));
    return id;
  };

  const deleteNode = (id: string) => {
    setNodes(prev => {
      const newNodes = { ...prev };
      const deleteRecursive = (nodeId: string) => {
        Object.values(newNodes).forEach((node: VFSNode) => {
          if (node.parentId === nodeId) {
            deleteRecursive(node.id);
          }
        });
        delete newNodes[nodeId];
      };
      deleteRecursive(id);
      return newNodes;
    });
  };

  const renameNode = (id: string, newName: string) => {
    setNodes(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], name: newName, updatedAt: Date.now() }
      };
    });
  };

  const saveFileContent = (id: string, newContent: string) => {
    setNodes(prev => {
      if (!prev[id] || prev[id].type !== 'text') return prev;
      return {
        ...prev,
        [id]: { ...prev[id], content: newContent, updatedAt: Date.now() }
      };
    });
  };

  const getNode = (id: string) => nodes[id];
  
  const getChildren = (parentId: string | null) => {
    return Object.values(nodes).filter((node: VFSNode) => node.parentId === parentId);
  };

  return (
    <FileSystemContext.Provider value={{ nodes, createNode, deleteNode, renameNode, saveFileContent, getNode, getChildren }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) throw new Error('useFileSystem must be used within a FileSystemProvider');
  return context;
};
