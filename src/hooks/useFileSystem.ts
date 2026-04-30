import { useState, useCallback } from "react";
import { FSNode, INITIAL_FS } from "../constants/os";

// ── Helpers ────────────────────────────────────────────────────────────────────

function cloneTree(nodes: FSNode[]): FSNode[] {
  return nodes.map(n => ({
    ...n,
    children: n.children ? cloneTree(n.children) : undefined,
  }));
}

function getChildrenAt(nodes: FSNode[], path: string[]): FSNode[] | null {
  let current = nodes;
  for (const seg of path) {
    const found = current.find(n => n.name === seg && n.type === "directory");
    if (found && found.children) {
      current = found.children;
    } else {
      return null;
    }
  }
  return current;
}

// Sanitize a GUI VFS name to be terminal-friendly (no spaces, DOS-ish)
function sanitizeName(name: string): string {
  return name.replace(/\s+/g, "_");
}

const IMAGE_EXT = /\.(png|jpg|jpeg|bmp|ico|gif|svg)$/i;

// ── Option A: Read-only bridge from the GUI VFS (localStorage) ─────────────────

interface GuiNode {
  id: string;
  name: string;
  type: "file" | "directory" | "shortcut";
  parentId: string | null;
  content?: string;
  customIcon?: string;
  isApp?: boolean;
  targetId?: string;
}

/**
 * Recursively build a terminal FSNode tree from the flat GUI VFS array.
 * Returns null if localStorage has no GUI VFS data.
 */
function buildCDrive(): FSNode | null {
  try {
    const raw = localStorage.getItem("vespera_vfs");
    if (!raw) return null;
    const guiNodes: GuiNode[] = JSON.parse(raw);

    const buildNode = (parentId: string): FSNode[] => {
      return guiNodes
        .filter(n => n.parentId === parentId)
        .map(n => {
          const safeName = sanitizeName(n.name);

          if (n.type === "directory") {
            return {
              name: safeName,
              type: "directory" as const,
              children: buildNode(n.id),
            };
          }

          // Shortcut → show as .LNK file
          if (n.type === "shortcut") {
            const lnkName = safeName.endsWith(".LNK") ? safeName : `${safeName}.LNK`;
            return {
              name: lnkName,
              type: "file" as const,
              content: `[Shortcut File]\nTarget: ${n.content || n.targetId || "(unknown)"}\n\nUse 'startgui' to launch the Desktop Environment and open this shortcut.`,
            };
          }

          // Regular file
          const isImage = IMAGE_EXT.test(n.name);
          const content =
            n.content && n.content.trim()
              ? n.content
              : n.isApp
              ? `[Application Binary — ${n.name}]`
              : isImage
              ? `[Image file — use 'imgview ${safeName}' to view]`
              : "[Binary data — no viewer available]";
          return {
            name: safeName,
            type: "file" as const,
            content,
            imagePath: isImage && n.customIcon ? n.customIcon : undefined,
          };
        });
    };


    // The GUI root node is id='root' (name 'C:')
    const rootNode = guiNodes.find(n => n.id === "root");
    if (!rootNode) return null;

    return {
      name: "c",
      type: "directory",
      children: buildNode("root"),
    };
  } catch {
    return null;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export const useFileSystem = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<FSNode[]>(() => {
    const cDrive = buildCDrive();
    return cDrive ? [...INITIAL_FS, cDrive] : [...INITIAL_FS];
  });

  const getDir = useCallback((path: string[]) => {
    let current: FSNode[] = fileSystem;
    for (const segment of path) {
      const seg = segment.toLowerCase();
      const found = current.find(n => n.name.toLowerCase() === seg && n.type === "directory");
      if (found && found.children) {
        current = found.children;
      } else {
        return null;
      }
    }
    return current;
  }, [fileSystem]);

  const ls = useCallback((pathStr?: string) => {
    let targetPath = [...currentPath];
    if (pathStr) {
      if (pathStr === "..") {
        targetPath.pop();
      } else {
        targetPath.push(pathStr);
      }
    }
    const dir = getDir(targetPath);
    if (!dir) return "ls: directory not found";
    return dir
      .filter(n => !n.hidden)
      .map(n => (n.type === "directory" ? `[DIR] ${n.name}` : n.name))
      .join("\n");
  }, [currentPath, getDir]);

  const cd = useCallback((pathStr: string) => {
    if (pathStr === "/") { setCurrentPath([]); return ""; }
    if (pathStr === "..") {
      if (currentPath.length > 0) {
        setCurrentPath(prev => prev.slice(0, -1));
      }
      return "";
    }
    if (pathStr === ".") return "";

    const segments = pathStr.split("/").filter(Boolean);
    let tempPath = [...currentPath];
    for (const seg of segments) {
      const dir = getDir(tempPath);
      // Case-insensitive match; preserve the actual stored name for the path
      const found = dir?.find(n => n.name.toLowerCase() === seg.toLowerCase() && n.type === "directory");
      if (found) {
        tempPath.push(found.name); // use canonical casing
      } else {
        return `cd: no such directory: ${seg}`;
      }
    }
    setCurrentPath(tempPath);
    return "";
  }, [currentPath, getDir]);

  const cat = useCallback((fileName: string) => {
    const dir = getDir(currentPath);
    const file = dir?.find(n => n.name.toLowerCase() === fileName.toLowerCase() && n.type === "file");
    if (file) return file.content || "";
    return `cat: ${fileName}: No such file`;
  }, [currentPath, getDir]);

  /** Returns the raw FSNode so callers can inspect imagePath, etc. */
  const getFileNode = useCallback((fileName: string) => {
    const dir = getDir(currentPath);
    return dir?.find(n => n.name.toLowerCase() === fileName.toLowerCase() && n.type === "file") ?? null;
  }, [currentPath, getDir]);

  /** Write (create or overwrite) a file in the current directory. */
  const writeFile = useCallback((fileName: string, content: string): string => {
    const newTree = cloneTree(fileSystem);
    const dir = getChildrenAt(newTree, currentPath);
    if (!dir) return "write: cannot determine current directory";
    const existing = dir.find(n => n.name === fileName);
    if (existing) {
      if (existing.type === "directory") return `write: ${fileName}: Is a directory`;
      existing.content = content;
    } else {
      dir.push({ name: fileName, type: "file", content });
    }
    setFileSystem(newTree);
    return "";
  }, [fileSystem, currentPath]);

  const getPrompt = useCallback(() => {
    return `thorne@aetheris:/${currentPath.join("/")}$ `;
  }, [currentPath]);

  return { ls, cd, cat, getFileNode, writeFile, getPrompt, currentPath };
};
