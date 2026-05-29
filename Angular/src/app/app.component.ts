import { Component } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Task, Priority, GridDataService } from 'src/app/services/grid-data.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import dxDataGrid from 'devextreme/ui/data_grid';
import type { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { DataSourceOptions } from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { DxDataGridModule, DxSwitchModule } from 'devextreme-angular';

type CellValue = Task[keyof Task] | string | undefined;

@Component({
  imports: [DxDataGridModule, DxSwitchModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  statuses: number[];

  priorities: Priority[];

  tasksStore: CustomStore;

  dataSource: DataSourceOptions;

  shouldClearSelection = false;

  updateInProgress: Boolean = false;

  constructor(service: GridDataService) {
    const url = 'https://js.devexpress.com/Demos/Mvc/api/DnDBetweenGrids';

    this.priorities = service.getPriorities();
    this.statuses = [1, 2];
    this.tasksStore = AspNetData.createStore({
      key: 'ID',
      loadUrl: `${url}/Tasks`,
      updateUrl: `${url}/UpdateTask`,
      onBeforeSend(_method, ajaxOptions) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
    this.dataSource = {
      store: this.tasksStore,
      reshapeOnPush: true,
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.canDrag = this.canDrag.bind(this);
  }

  onDragStart(e: DxDataGridTypes.RowDraggingStartEvent): void {
    const selectedData: Task[] = e.component.getSelectedRowsData();
    e.itemData = this.getVisibleRowValues(selectedData, e.component);
    e.cancel = !this.canDrag(e);
  }

  async onAdd(e: DxDataGridTypes.RowDraggingAddEvent): Promise<void> {
    const fromGrid = e.fromComponent as dxDataGrid;
    const toGrid = e.toComponent as dxDataGrid;
    const selectedRowKeys: (keyof Task)[] = fromGrid.getSelectedRowKeys();
    const updateProcess: Promise<any>[] = [];
    const changes: any[] = [];

    this.updateInProgress = true;
    fromGrid.beginCustomLoading('Loading...');
    toGrid.beginCustomLoading('Loading...');

    for (let key of selectedRowKeys) {
      const values: Task = { Status: e.toData };

      updateProcess.push(this.tasksStore.update(key, values));
      changes.push({
        type: 'update',
        key,
        data: values,
      });
    }

    try {
      await Promise.all(updateProcess);
      this.tasksStore.push(changes);
      fromGrid.endCustomLoading();
      toGrid.endCustomLoading();
      this.updateInProgress = false;

      fromGrid.clearSelection();
      if (!this.shouldClearSelection) {
        await toGrid.selectRows(selectedRowKeys, true);
      }
    } catch {
      notify('An error occurred while saving changes.', 'error', 3000);
    }
  }

  getVisibleRowValues(rowsData: Task[], grid: dxDataGrid): Record<string, CellValue>[] {
    const visibleColumns = grid.getVisibleColumns();
    const selectedData = rowsData.map((rowData: Task) => {
      const visibleValues: Record<string, CellValue> = {};
      visibleColumns.forEach((column: DxDataGridTypes.Column) => {
        if (column.dataField) {
          visibleValues[column.dataField] = this.getVisibleCellValue(column, rowData);
        }
      });
      return visibleValues;
    });
    return selectedData;
  }

  getVisibleCellValue(column: DxDataGridTypes.Column, rowData: Task): CellValue {
    const cellValue = rowData[column.dataField as keyof Task];
    return column.lookup?.calculateCellValue
      ? String(column.lookup.calculateCellValue(cellValue))
      : cellValue;
  }

  canDrag(e: DxDataGridTypes.RowDraggingStartEvent): DxDataGridTypes.Row | Boolean {
    if (this.updateInProgress) return false;
    const visibleRows = e.component.getVisibleRows();
    return visibleRows.some((r: DxDataGridTypes.Row) => r.isSelected && r.rowIndex === e.fromIndex);
  }

  originalOrder(_a: KeyValue<number, string>, _b: KeyValue<number, string>): number {
    return 0;
  }
}
