import type { OpfsUsage } from '../../../lib/types';
import { normalize, resolve } from '../../../lib/opfsPath';
import { once } from '../../../lib/sundry';
import { callContentScriptOpfs, getOpfsUsage, saveToOpfs } from './helper';
import { Emitter } from '../../../lib/event';
import type { FileSystemItem } from '../../../js/entries/content-script';

function checkPathValidity(path: string) {
  const isValid = path.startsWith(ROOT_DIR);
  if (isValid === false) {
    throw new Error(`Invalid path: ${path}`);
  }
}

const ROOT_DIR = '/';

export class FileService {
  private static instance: FileService;
  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }
  private _currentPath: string = ROOT_DIR;
  private _onRefreshing = new Emitter<boolean>();
  onRefreshing = this._onRefreshing.event;

  currentItems: FileSystemItem[] = [];
  usage: OpfsUsage = {
    usage: 0,
    percent: 0,
    quota: 0,
    quotaStr: '0',
    usageStr: '0',
  };

  get currentPath() {
    return this._currentPath;
  }

  set currentPath(path: string) {
    this._currentPath = normalize(path);
  }

  get isRefreshing() {
    return this.refresh.isRunning();
  }

  get canGoBack() {
    return this.currentPath !== ROOT_DIR;
  }

  refresh = once(async () => {
    this._onRefreshing.fire(true);
    const currentPath = this.currentPath;
    const res = await callContentScriptOpfs('readDir', currentPath);
    const usage = await getOpfsUsage();
    this.usage = usage;
    this.currentItems = res;
    this._onRefreshing.fire(false);
    return res;
  });

  /**
   * @description Jump relative to the current path
   */
  jumpRelative = async (path: string) => {
    const newPath = resolve(this.currentPath, path);
    checkPathValidity(newPath);
    this.currentPath = newPath;
    await this.refresh();
  };

  /**
   * @description Jump to the specified path
   */
  jumpAbsolute = async (path: string) => {
    checkPathValidity(path);
    this.currentPath = path;
    await this.refresh();
  };

  mkdir = async (name: string) => {
    const newPath = resolve(this.currentPath, name);
    checkPathValidity(newPath);
    await callContentScriptOpfs('mkdir', newPath);
    await this.refresh();
  };

  save = async (handles: FileSystemHandle[]) => {
    await saveToOpfs(this.currentPath, handles);
    await this.refresh();
  };

  remove = async (paths: string[]) => {
    const promises = paths.map((path) => {
      const newPath = resolve(this.currentPath, path);
      checkPathValidity(newPath);
      return callContentScriptOpfs('remove', newPath);
    });
    await Promise.all(promises);
    await this.refresh();
  };

  saveToDisk = async (paths: string[]) => {
    await callContentScriptOpfs('saveToDisk', paths);
  };

  createFile = async (name: string) => {
    const newPath = resolve(this.currentPath, name);
    checkPathValidity(newPath);
    await callContentScriptOpfs('createFile', newPath);
    await this.refresh();
  };
}
