<script setup lang="ts">
import DxDataGrid, { DxColumn, DxRowDragging, DxScrolling, DxLookup, DxSelection } from 'devextreme-vue/data-grid';
import type dxDataGrid from 'devextreme/ui/data_grid';
import type { DxDataGridTypes } from 'devextreme-vue/data-grid';
import type { Task } from '../data';
import { priorities } from '../data';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';

type CellValue = Task[keyof Task] | string | undefined;

let updateInProgress: Boolean = false;

const props = defineProps({
  tasksStore: { type: CustomStore, required: true },
  status: { type: Number, default: 0 },
  shouldClearSelection: { type: Boolean, default: false },
});

const filterExpr = ['Status', '=', props.status];

const dataSource = new DataSource({
  store: props.tasksStore,
  reshapeOnPush: true,
});

function getVisibleRowValues(rowsData: Task[], grid: dxDataGrid): Record<string, CellValue>[] {
  const visibleColumns = grid.getVisibleColumns();
  const selectedData = rowsData.map((rowData: Task) => {
    const visibleValues: Record<string, CellValue> = {};
    visibleColumns.forEach((column: DxDataGridTypes.Column) => {
      if (column.dataField)
      { visibleValues[column.dataField] = getVisibleCellValue(column, rowData); }
    });
    return visibleValues;
  });
  return selectedData;
}

function getVisibleCellValue(column: DxDataGridTypes.Column, rowData: Task): CellValue {
  if (column.dataField) {
    const propKey = column.dataField as keyof Task;
    const cellValue = rowData[propKey];
    return column?.lookup?.calculateCellValue
      ? column.lookup.calculateCellValue(cellValue) as CellValue
      : cellValue as CellValue;
  }
  return undefined;
}

function canDrag(e: DxDataGridTypes.RowDraggingStartEvent): boolean {
  if (updateInProgress) return false;
  const visibleRows = e.component.getVisibleRows();
  return visibleRows.some((r: DxDataGridTypes.Row) => r.isSelected && r.rowIndex === e.fromIndex);
}

function onDragStart(e: DxDataGridTypes.RowDraggingStartEvent): void {
  const selectedData: Task[] = e.component.getSelectedRowsData();
  e.itemData = getVisibleRowValues(selectedData, e.component);
  e.cancel = !canDrag(e);
}

async function onAdd(e: DxDataGridTypes.RowDraggingAddEvent): Promise<void> {
  const fromGrid = e.fromComponent as dxDataGrid;
  const toGrid = e.toComponent as dxDataGrid;
  const selectedRowKeys: (keyof Task)[] = fromGrid.getSelectedRowKeys();
  const updateProcess: (Promise<any> | undefined)[] = [];
  const changes: any[] = [];

  updateInProgress = true;
  fromGrid.beginCustomLoading('Loading...');
  toGrid.beginCustomLoading('Loading...');
  for (let key of selectedRowKeys) {
    const values = { Status: e.toData };
    updateProcess.push(props.tasksStore?.update(key, values));
    changes.push({
      type: 'update',
      key,
      data: values,
    });
  }
  try {
    await Promise.all(updateProcess);
    let gridStore = props.tasksStore;
    gridStore?.push(changes);
    fromGrid.endCustomLoading();
    toGrid.endCustomLoading();
    updateInProgress = false;

    fromGrid.clearSelection();
    if (!props.shouldClearSelection) {
      await toGrid.selectRows(selectedRowKeys, true);
    }
  } catch (error: unknown) {
    notify(error, 'error', 1000);
  }
}

</script>
<template>
  <DxDataGrid
    :data-source="dataSource"
    :height="440"
    :show-borders="true"
    :filter-value="filterExpr"
  >
    <DxRowDragging
      :data="status"
      :on-add="onAdd as unknown as () => void"
      :on-drag-start="onDragStart as () => void"
      drag-template="dragItems"
      group="tasksGroup"
    />

    <template #dragItems="{ data }">
      <table className="drag-container">
        <tbody>
          <tr
            v-for="(item, rowIndex) in data.itemData"
            :key="'row' + rowIndex"
          >
            <td
              v-for="(key, dataIndex) in Object.keys(item)"
              :key="'key' + dataIndex"
            >
              {{ item[key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <DxSelection mode="multiple"/>
    <DxScrolling mode="virtual"/>
    <DxColumn
      data-field="Subject"
      data-type="string"
    />
    <DxColumn
      :width="80"
      data-field="Priority"
      data-type="number"
    >
      <DxLookup
        :data-source="priorities"
        value-expr="id"
        display-expr="text"
      />
    </DxColumn>
    <DxColumn
      :visible="false"
      data-field="Status"
      data-type="number"
    />

  </DxDataGrid>
</template>
