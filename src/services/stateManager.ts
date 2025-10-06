import fs from "fs-extra";
import path from "path";
import { getProjectDirForWorkspace, getProjectRootDir } from "../utils/env";

export type WorkspaceState = {
  workspacePath: string;
  codebaseId?: string;
  pathKey?: string;
  orthogonalTransformSeed?: number;
  // Ephemeral (not persisted):
  pendingChanges?: boolean;
};

function getWorkspaceStateFile(workspacePath: string): string {
  const dir = getProjectDirForWorkspace(workspacePath);
  return path.join(dir, "state.json");
}

export async function loadWorkspaceState(workspacePath: string): Promise<WorkspaceState> {
  const file = getWorkspaceStateFile(workspacePath);
  await fs.ensureDir(path.dirname(file));
  try {
    return (await fs.readJSON(file)) as WorkspaceState;
  } catch {
    return { workspacePath };
  }
}

export async function saveWorkspaceState(st: WorkspaceState): Promise<void> {
  const file = getWorkspaceStateFile(st.workspacePath);
  await fs.ensureDir(path.dirname(file));
  const toPersist: WorkspaceState = {
    workspacePath: st.workspacePath,
    codebaseId: st.codebaseId,
    pathKey: st.pathKey,
    orthogonalTransformSeed: st.orthogonalTransformSeed,
  };
  await fs.writeJSON(file, toPersist, { spaces: 2 });
}

export function getWorkspaceProjectDir(workspacePath: string): string {
  return getProjectDirForWorkspace(workspacePath);
}

export async function listIndexedWorkspaces(): Promise<string[]> {
  const root = getProjectRootDir();
  await fs.ensureDir(root);
  const out = new Set<string>();
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const dir = path.join(root, e.name);
      const stFile = path.join(dir, "state.json");
      try {
        const st = (await fs.readJSON(stFile)) as WorkspaceState;
        if (st && st.workspacePath) out.add(st.workspacePath);
      } catch {
        // ignore invalid state files
      }
    }
  } catch {
    // noop
  }
  return Array.from(out);
}


