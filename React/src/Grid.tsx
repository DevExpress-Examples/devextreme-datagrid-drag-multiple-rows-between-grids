import { useState, useMemo, useCallback } from 'react';
import DataGrid, {
  Column, RowDragging, Scrolling, Lookup, Selection,
} from 'devextreme-react/data-grid';
import type { DataGridTypes } from 'devextreme-react/data-grid';
import type dxDataGrid from 'devextreme/ui/data_grid';
import type { DragTemplateData } from 'devextreme/ui/draggable';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { type Task, priorities } from './data';

type CellValue = Task[keyof Task] | string | undefined;

interface GridDemoComponentProps {
  status?: number;
  tasksStore?: CustomStore;
  shouldClearSelection: boolean;
}

function draggedItemsRender(data: DragTemplateData): JSX.Element {
  const draggedItems = data.itemData.map((item: Task, rowIndex: number) => {
    const cellValues = (Object.keys(item) as (keyof Task)[]).map((key: keyof Task, dataIndex: number) => <td key={`key${dataIndex}`}>{item[key]}</td>);
    return (<tr key={`row${rowIndex}`}>{cellValues}</tr>);
  });
  return (<table className="drag-container">
    <tbody>{draggedItems}</tbody>
  </table>);
}

function getVisibleRowValues(rowsData: Task[], grid: dxDataGrid): Record<string, CellValue>[] {
  const visibleColumns = grid.getVisibleColumns();
  const selectedData = rowsData.map((rowData: Task) => {
    const visibleValues: Record<string, CellValue> = {};
    visibleColumns.forEach((column: DataGridTypes.Column) => {
      if (column.dataField) { visibleValues[column.dataField] = getVisibleCellValue(column, rowData); }
    });
    return visibleValues;
  });
  return selectedData;
}

function getVisibleCellValue(column: DataGridTypes.Column, rowData: Task): CellValue {
  if (column.dataField) {
    const propKey = column.dataField as keyof Task;
    const cellValue = rowData[propKey];
    return column?.lookup?.calculateCellValue
      ? column.lookup.calculateCellValue(cellValue) as CellValue
      : cellValue as CellValue;
  }
  return undefined;
}

export default function Grid({ status, tasksStore, shouldClearSelection }: GridDemoComponentProps): JSX.Element {
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const filterExpr = useMemo(() => ['Status', '=', status], [status]);

  const dataSource = useMemo(() => ({
    store: tasksStore,
    reshapeOnPush: true,
  }), [tasksStore]);

  const canDrag = useCallback((e: DataGridTypes.RowDraggingStartEvent): boolean => {
    if (updateInProgress) return false;
    const visibleRows = e.component.getVisibleRows();
    return visibleRows.some((r: DataGridTypes.Row) => r.isSelected && r.rowIndex === e.fromIndex);
  }, [updateInProgress]);

  const onDragStart = useCallback((e: DataGridTypes.RowDraggingStartEvent): void => {
    const selectedData: Task[] = e.component.getSelectedRowsData();
    e.itemData = getVisibleRowValues(selectedData, e.component);
    e.cancel = !canDrag(e);
  }, [canDrag]);

  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  const onAdd = useCallback(async(e: DataGridTypes.RowDraggingAddEvent): Promise<void> => {
    const fromGrid = e.fromComponent as dxDataGrid;
    const toGrid = e.toComponent as dxDataGrid;
    const selectedRowKeys: (keyof Task)[] = fromGrid.getSelectedRowKeys();
    const updateProcess: (Promise<any> | undefined)[] = [];
    const changes: any[] = [];

    setUpdateInProgress(true);
    fromGrid.beginCustomLoading('Loading...');
    toGrid.beginCustomLoading('Loading...');
    for (let key of selectedRowKeys) {
      const values = { Status: e.toData };
      updateProcess.push(tasksStore?.update(key, values));
      changes.push({
        type: 'update',
        key,
        data: values,
      });
    }
    try {
      await Promise.all(updateProcess);
      tasksStore?.push(changes);
      fromGrid.endCustomLoading();
      toGrid.endCustomLoading();
      setUpdateInProgress(false);

      fromGrid.clearSelection();
      if (!shouldClearSelection) {
        await toGrid.selectRows(selectedRowKeys, true);
      }
    } catch (error: unknown) {
      notify(error, 'error', 1000);
    }
  }, [tasksStore, shouldClearSelection]);

  return (
    <DataGrid
      dataSource={dataSource}
      height={440}
      showBorders={true}
      filterValue={filterExpr}
    >
      <RowDragging
        data={status}
        group="tasksGroup"
        onAdd={onAdd as unknown as () => void}
        onDragStart={onDragStart as () => void}
        dragRender={draggedItemsRender}
      />
      <Selection mode="multiple" />
      <Scrolling mode="virtual" />
      <Column
        dataField="Subject"
        dataType="string"
      />
      <Column
        dataField="Priority"
        dataType="number"
        width={80}
      >
        <Lookup
          dataSource={priorities}
          valueExpr="id"
          displayExpr="text"
        />
      </Column>
      <Column
        dataField="Status"
        dataType="number"
        visible={false}
      />
    </DataGrid>
  );
}
