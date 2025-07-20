<script setup lang="ts">
import DxDataGrid, { DxColumn, DxRowDragging, DxScrolling, DxLookup, DxSelection } from 'devextreme-vue/data-grid';
import type dxDataGrid from 'devextreme/ui/data_grid';
import type { RowDraggingStartEvent, RowDraggingAddEvent, Column, Row } from 'devextreme/ui/data_grid';
import CustomStore from "devextreme/data/custom_store";
import type { Task } from '../data';
import { priorities } from '../data';
import DataSource from "devextreme/data/data_source";

let updateInProgress: Boolean = false;

const props = defineProps({
  tasksStore: CustomStore,
  status: Number,
  shouldClearSelection: Boolean,
});

const filterExpr = ['Status', '=', props.status];

const dataSource = new DataSource({
  store: props.tasksStore,
  reshapeOnPush: true,
});

function getVisibleRowValues(rowsData: Task[], grid: dxDataGrid) {
    const visibleColumns = grid.getVisibleColumns();
    const selectedData = rowsData.map((rowData: Task) => {
        const visibleValues: any = {};
        visibleColumns.forEach((column: Column) => {
            if (column.dataField)
                visibleValues[column.dataField] = getVisibleCellValue(column, rowData);
        });
        return visibleValues;
    });
    return selectedData;
}

function getVisibleCellValue(column: Column, rowData: Task) {
    if (column.dataField) {
        const propKey = column.dataField as (keyof Task);
        const cellValue = rowData[propKey];
        return column.lookup && column.lookup.calculateCellValue ? column.lookup.calculateCellValue(cellValue) : cellValue;
    }
}

function canDrag(e: RowDraggingStartEvent) {
  if (updateInProgress) return false;
  const visibleRows = e.component.getVisibleRows();
  return visibleRows.some((r: Row) => r.isSelected && r.rowIndex === e.fromIndex);
}

function onDragStart(e: RowDraggingStartEvent) {
  const selectedData: Task[] = e.component.getSelectedRowsData();
  e.itemData = getVisibleRowValues(selectedData, e.component);
  e.cancel = !canDrag(e);
}

function onAdd(e: RowDraggingAddEvent) {
  const fromGrid = e.fromComponent as dxDataGrid;
  const toGrid = e.toComponent as dxDataGrid;
  const selectedRowKeys: (keyof Task)[] = fromGrid.getSelectedRowKeys();
  const updateProcess: (Promise<any> | undefined)[] = [];
  const changes: any[] = [];

  updateInProgress = true;
  fromGrid.beginCustomLoading("Loading...");
  toGrid.beginCustomLoading("Loading...");
  for (let key of selectedRowKeys) {
    const values = { Status: e.toData };
    updateProcess.push(props.tasksStore?.update(key, values));
    changes.push({
      type: 'update',
      key,
      data: values,
    });
  }
  Promise.all(updateProcess).then(() => {
    props.tasksStore?.push(changes);
    fromGrid.endCustomLoading();
    toGrid.endCustomLoading();
    updateInProgress = false;

    fromGrid.clearSelection();
    if (!props.shouldClearSelection) {
      toGrid.selectRows(selectedRowKeys, true);
    }
  });
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
      :on-add="onAdd"
      :on-drag-start="onDragStart"
      drag-template="dragItems"
      group="tasksGroup"
    />

    <template #dragItems="{ data }">
      <table className="drag-container">
        <tbody>
          <tr
            v-for="(item, rowIndex) in data.itemData"
            v-bind:key="'row' + rowIndex"
          >
            <td
              v-for="(key, dataIndex) in Object.keys(item)"
              v-bind:key="'key' + dataIndex"
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