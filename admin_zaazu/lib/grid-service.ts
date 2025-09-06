import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { GridRow, HomeGrid, GridItem } from "./types";

class GridService {
  private readonly gridsCollection = "grids";
  private readonly rowsCollection = "gridRows";

  // Grid CRUD Operations
  async createGrid(
    gridData: Omit<HomeGrid, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, this.gridsCollection), {
      ...gridData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async getGrids(): Promise<HomeGrid[]> {
    const querySnapshot = await getDocs(
      query(collection(db, this.gridsCollection), orderBy("createdAt", "desc"))
    );

    const grids: HomeGrid[] = [];
    for (const doc of querySnapshot.docs) {
      const gridData = { id: doc.id, ...doc.data() } as HomeGrid;
      // Load rows for each grid
      gridData.rows = await this.getGridRows(doc.id);
      grids.push(gridData);
    }

    return grids;
  }

  async getGrid(id: string): Promise<HomeGrid | null> {
    const docSnap = await getDoc(doc(db, this.gridsCollection, id));
    if (!docSnap.exists()) return null;

    const gridData = { id: docSnap.id, ...docSnap.data() } as HomeGrid;
    gridData.rows = await this.getGridRows(id);

    return gridData;
  }

  async updateGrid(id: string, updates: Partial<HomeGrid>): Promise<void> {
    await updateDoc(doc(db, this.gridsCollection, id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteGrid(id: string): Promise<void> {
    // Delete all rows first
    const rows = await this.getGridRows(id);
    for (const row of rows) {
      await this.deleteGridRow(row.id);
    }

    await deleteDoc(doc(db, this.gridsCollection, id));
  }

  // Grid Row CRUD Operations
  async createGridRow(
    gridId: string,
    rowData: Omit<GridRow, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, this.rowsCollection), {
      ...rowData,
      gridId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async getGridRows(gridId: string): Promise<GridRow[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, this.rowsCollection),
        where("gridId", "==", gridId),
        orderBy("order", "asc")
      )
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as GridRow[];
  }

  async updateGridRow(id: string, updates: Partial<GridRow>): Promise<void> {
    await updateDoc(doc(db, this.rowsCollection, id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteGridRow(id: string): Promise<void> {
    await deleteDoc(doc(db, this.rowsCollection, id));
  }

  // Grid Item Operations
  async addItemToRow(rowId: string, item: Omit<GridItem, "id">): Promise<void> {
    const rowDoc = await getDoc(doc(db, this.rowsCollection, rowId));
    if (!rowDoc.exists()) throw new Error("Row not found");

    const rowData = rowDoc.data() as GridRow;
    const newItems = [
      ...(rowData.items || []),
      { ...item, id: crypto.randomUUID() },
    ];

    await updateDoc(doc(db, this.rowsCollection, rowId), {
      items: newItems,
      updatedAt: Timestamp.now(),
    });
  }

  async removeItemFromRow(rowId: string, itemId: string): Promise<void> {
    const rowDoc = await getDoc(doc(db, this.rowsCollection, rowId));
    if (!rowDoc.exists()) throw new Error("Row not found");

    const rowData = rowDoc.data() as GridRow;
    const filteredItems = (rowData.items || []).filter(
      (item) => item.id !== itemId
    );

    await updateDoc(doc(db, this.rowsCollection, rowId), {
      items: filteredItems,
      updatedAt: Timestamp.now(),
    });
  }

  async reorderRowItems(rowId: string, items: GridItem[]): Promise<void> {
    await updateDoc(doc(db, this.rowsCollection, rowId), {
      items: items.map((item, index) => ({ ...item, order: index })),
      updatedAt: Timestamp.now(),
    });
  }

  async randomizeRowItems(rowId: string): Promise<void> {
    const rowDoc = await getDoc(doc(db, this.rowsCollection, rowId));
    if (!rowDoc.exists()) throw new Error("Row not found");

    const rowData = rowDoc.data() as GridRow;
    const shuffledItems = [...(rowData.items || [])].sort(
      () => Math.random() - 0.5
    );

    await this.reorderRowItems(rowId, shuffledItems);
  }

  // Grid Rows Reorder
  async reorderGridRows(gridId: string, rowIds: string[]): Promise<void> {
    const promises = rowIds.map((rowId, index) =>
      updateDoc(doc(db, this.rowsCollection, rowId), {
        order: index,
        updatedAt: Timestamp.now(),
      })
    );

    await Promise.all(promises);
  }

  // Get Active Grid for Home
  async getActiveGrid(): Promise<HomeGrid | null> {
    const querySnapshot = await getDocs(
      query(
        collection(db, this.gridsCollection),
        where("isActive", "==", true),
        orderBy("updatedAt", "desc")
      )
    );

    if (querySnapshot.empty) return null;

    const gridDoc = querySnapshot.docs[0];
    const gridData = { id: gridDoc.id, ...gridDoc.data() } as HomeGrid;
    gridData.rows = await this.getGridRows(gridDoc.id);

    return gridData;
  }
}

export const gridService = new GridService();
