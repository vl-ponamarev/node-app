jest.mock('../models/folders-model');
jest.mock('../models/files-store-model');

const FolderModel = require('../models/folders-model');
const FilesStoreModel = require('../models/files-store-model');
const DataService = require('../service/data-service');

const ALICE = 'alice-id';
const BOB = 'bob-id';

function makeStore() {
  const folders = [];
  const files = [];
  let nextId = 1000;
  const newId = () => `gen-${nextId++}`;

  FolderModel.findOne.mockImplementation(async q => {
    return folders.find(f => f._id === q._id && f.owner === q.owner) || null;
  });
  FolderModel.find.mockImplementation(async q => {
    return folders.filter(f => f.rootFolderId === q.rootFolderId && f.owner === q.owner);
  });
  FolderModel.create.mockImplementation(async data => {
    const doc = { ...data, _id: newId(), toObject() { return { ...this }; } };
    folders.push(doc);
    return doc;
  });

  FilesStoreModel.find.mockImplementation(async q => {
    return files.filter(f => f.folderId === q.folderId && f.owner === q.owner);
  });
  FilesStoreModel.findOne.mockImplementation(async q => {
    return files.find(f => f._id === q._id && f.owner === q.owner) || null;
  });
  FilesStoreModel.create.mockImplementation(async data => {
    const doc = { ...data, _id: newId(), toObject() { return { ...this }; } };
    files.push(doc);
    return doc;
  });

  const seed = (...docs) => {
    docs.forEach(d => {
      const target = d.kind === 'file' ? files : folders;
      target.push({ ...d, toObject() { return { ...this }; } });
    });
  };

  return { folders, files, seed };
}

describe('DataService.copyItems', () => {
  beforeEach(() => jest.clearAllMocks());

  test('recursively copies a folder with nested folder and file (preserving owner)', async () => {
    const store = makeStore();
    store.seed(
      { _id: 'A', foldername: 'A', rootFolderId: 'root', owner: ALICE },
      { _id: 'B', foldername: 'B', rootFolderId: 'A', owner: ALICE },
      { _id: 'f1', kind: 'file', folderId: 'B', owner: ALICE, originalname: 'doc.pdf', filename: 'doc-1.pdf', mimetype: 'application/pdf', size: '1' },
    );

    const result = await DataService.copyItems(
      { data: { rootFolderId: 'dest', items: { folders: ['A'], files: [] } } },
      ALICE,
    );

    expect(result.success).toBe(true);

    const copiedA = store.folders.find(f => f.foldername === 'A' && f.rootFolderId === 'dest');
    expect(copiedA).toBeDefined();
    expect(copiedA.owner).toBe(ALICE);

    const copiedB = store.folders.find(f => f.foldername === 'B' && f.rootFolderId === copiedA._id);
    expect(copiedB).toBeDefined();

    const copiedFile = store.files.find(f => f.folderId === copiedB._id);
    expect(copiedFile).toBeDefined();
    expect(copiedFile.originalname).toBe('doc.pdf');
    expect(copiedFile.owner).toBe(ALICE);
  });

  test('does not copy folders or files belonging to another owner', async () => {
    const store = makeStore();
    store.seed(
      { _id: 'X', foldername: 'X', rootFolderId: 'root', owner: BOB },
      { _id: 'f-bob', kind: 'file', folderId: 'X', owner: BOB, originalname: 'secret.txt', filename: 's.txt', mimetype: 'text/plain', size: '1' },
    );

    const before = { folders: store.folders.length, files: store.files.length };

    const result = await DataService.copyItems(
      { data: { rootFolderId: 'dest', items: { folders: ['X'], files: ['f-bob'] } } },
      ALICE,
    );

    expect(result.success).toBe(true);
    expect(store.folders.length).toBe(before.folders);
    expect(store.files.length).toBe(before.files);
  });

  test('copies a standalone file selection into the destination folder', async () => {
    const store = makeStore();
    store.seed(
      { _id: 'f1', kind: 'file', folderId: 'src', owner: ALICE, originalname: 'a.txt', filename: 'a-1.txt', mimetype: 'text/plain', size: '1' },
    );

    const result = await DataService.copyItems(
      { data: { rootFolderId: 'dest', items: { folders: [], files: ['f1'] } } },
      ALICE,
    );

    expect(result.success).toBe(true);
    const copied = store.files.find(f => f.originalname === 'a.txt' && f.folderId === 'dest');
    expect(copied).toBeDefined();
    expect(copied.owner).toBe(ALICE);
  });
});
