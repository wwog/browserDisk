import { dirname, resolve } from '../../lib/opfsPath';
import { pipeToProgress } from '../../lib/stream';
import {
  asyncIteratorToArray,
  isDirectoryHandle,
  isFileHandle,
} from '../../lib/sundry';
import {
  decodeSAHPoolFilename,
  HEADER_OFFSET_DATA,
  SAHPoolDirName,
} from './sqliteSAHPool';

export interface SaveHandleOptions {
  onProgress?: (payload: {
    name: string;
    path: string;
    loaded: number;
    percent: number;
    totalSize: number;
  }) => void;
  onUploaded?: (payload: { name: string; path: string }) => void;
  onCompleted?: () => void;
}

export async function saveToDisk(
  targetDirHandle: FileSystemDirectoryHandle,
  items: {
    path: string;
    handle: FileSystemHandle;
  }[],
  hooks?: SaveHandleOptions
) {
  const uploadHandle = async (handle: FileSystemHandle, path: string) => {
    if (isFileHandle(handle)) {
      const dir = dirname(path);
      let filename = handle.name;
      let offset = 0;
      const file = await handle.getFile();
      console.log({
        dir,
        SAHPoolDirName,
        endsWith: dir.endsWith(SAHPoolDirName),
      });
      if (dir.endsWith(SAHPoolDirName)) {
        const SAHName = await decodeSAHPoolFilename(file);
        if (SAHName) {
          filename = SAHName.slice(1);
          offset = HEADER_OFFSET_DATA;
        }
      }
      const opfsFileHandle = await targetDirHandle.getFileHandle(filename, {
        create: true,
      });
      const writable = await opfsFileHandle.createWritable();

      await pipeToProgress(file.stream(), writable, file.size, {
        offset,
        onProgress(loaded, percent, totalSize) {
          if (hooks?.onProgress) {
            hooks.onProgress({
              loaded,
              percent,
              name: handle.name,
              path,
              totalSize,
            });
          }
        },
        onDone() {
          if (hooks?.onUploaded) {
            hooks.onUploaded({
              name: handle.name,
              path,
            });
          }
        },
      });
      return;
    }
    if (isDirectoryHandle(handle)) {
      const dirHandle = await targetDirHandle.getDirectoryHandle(handle.name, {
        create: true,
      });
      const handles = (await asyncIteratorToArray(handle.values())).map(
        (item) => {
          return {
            handle: item,
            path: resolve(path, item.name),
          };
        }
      );
      return saveToDisk(dirHandle, handles, hooks);
    }
  };

  for (const { handle, path } of items) {
    await uploadHandle(handle, path);
  }

  if (hooks?.onCompleted) {
    hooks.onCompleted();
  }
}
