import { useState, useCallback } from "react";
import { FSNode, INITIAL_FS } from "../constants/os";

export const useFileSystem = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [fileSystem] = useState<FSNode[]>(INITIAL_FS);

  const getDir = useCallback((path: string[]) => {
    let current: FSNode[] = fileSystem;
    for (const segment of path) {
      const found = current.find((n) => n.name === segment && n.type === "directory");
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
      .map((n) => (n.type === "directory" ? `[DIR] ${n.name}` : n.name))
      .join("\n");
  }, [currentPath, getDir]);

  const cd = useCallback((pathStr: string) => {
    if (pathStr === "/") {
      setCurrentPath([]);
      return "";
    }
    if (pathStr === "..") {
      if (currentPath.length > 0) {
        const newPath = [...currentPath];
        newPath.pop();
        setCurrentPath(newPath);
      }
      return "";
    }
    if (pathStr === ".") return "";

    const segments = pathStr.split("/").filter(Boolean);
    let tempPath = [...currentPath];
    
    for (const seg of segments) {
      const dir = getDir(tempPath);
      const found = dir?.find(n => n.name === seg && n.type === "directory");
      if (found) {
        tempPath.push(seg);
      } else {
        return `cd: no such directory: ${seg}`;
      }
    }
    
    setCurrentPath(tempPath);
    return "";
  }, [currentPath, getDir]);

  const cat = useCallback((fileName: string) => {
    const dir = getDir(currentPath);
    const file = dir?.find(n => n.name === fileName && n.type === "file");
    if (file) {
      return file.content || "";
    }
    return `cat: ${fileName}: No such file`;
  }, [currentPath, getDir]);

  const getPrompt = useCallback(() => {
    return `thorne@aetheris:/${currentPath.join("/")}$ `;
  }, [currentPath]);

  return { ls, cd, cat, getPrompt, currentPath };
};
