import { Component } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Task, Priority, GridDataService } from 'src/app/services/grid-data.service';
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import DxDataGrid, { RowDraggingStartEvent, RowDraggingAddEvent, Column, Row } from "devextreme/ui/data_grid";
import CustomStore from 'devextreme/data/custom_store';
import { Options } from 'devextreme/data/data_source';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  statuses: Array<number>;
  priorities: Array<Priority>;
  tasksStore: CustomStore;
  dataSource: Options;
  shouldClearSelection: boolean = false;
  updateInProgress: Boolean = false;

  constructor(service: GridDataService) {
    const url = 'https://js.devexpress.com/Demos/Mvc/api/DnDBetweenGrids';

    this.priorities = service.getPriorities();
    this.statuses = [1, 2];
    this.tasksStore = AspNetData.createStore({
      key: 'ID',
      loadUrl: `${url}/Tasks`,
      updateUrl: `${url}/UpdateTask`,
      onBeforeSend(method, ajaxOptions) {
        ajaxOptions.xhrFields = { withCredentials: true };
      }
    });
    this.dataSource = {
      store: this.tasksStore,
      reshapeOnPush: true
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.canDrag = this.canDrag.bind(this);
  }

  onDragStart(e: RowDraggingStartEvent) {
    const selectedData: Task[] = e.component.getSelectedRowsData();
    e.itemData = this.getVisibleRowValues(selectedData, e.component);
    e.cancel = !this.canDrag(e);
  }

  onAdd(e: RowDraggingAddEvent) {
    const fromGrid = e.fromComponent as DxDataGrid;
    const toGrid = e.toComponent as DxDataGrid;
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
        type: "update",
        key,
        data: values
      });
    }

    Promise.all(updateProcess).then(() => {
      this.tasksStore.push(changes);
      fromGrid.endCustomLoading();
      toGrid.endCustomLoading();
      this.updateInProgress = false;

      fromGrid.clearSelection();
      if (!this.shouldClearSelection) {
        toGrid.selectRows(selectedRowKeys, true);
      }
    });
  }

  getVisibleRowValues(rowsData: Task[], grid: DxDataGrid) {
    const visibleColumns = grid.getVisibleColumns();
    const selectedData = rowsData.map((rowData: Task) => {
      const visibleValues: any = {};
      visibleColumns.forEach((column: Column) => {
        if (column.dataField)
          visibleValues[column.dataField] = this.getVisibleCellValue(column, rowData);
      });
      return visibleValues;
    });
    return selectedData;
  }

  getVisibleCellValue(column: Column, rowData: Task) {
    if (column.dataField) {
        const propKey = column.dataField as (keyof Task);
        const cellValue = rowData[propKey];
        return column.lookup && column.lookup.calculateCellValue ? column.lookup.calculateCellValue(cellValue) : cellValue;
    }
  }

  canDrag(e: RowDraggingStartEvent) {
    if (this.updateInProgress) return false;
    const visibleRows = e.component.getVisibleRows();
    return visibleRows.some((r: Row) => r.isSelected && r.rowIndex === e.fromIndex);
  }

  originalOrder(a: KeyValue<number, string>, b: KeyValue<number, string>): number {
    return 0;
  }
}
