$(function() {
  const store = DevExpress.data.AspNet.createStore({
    key: 'ID',
    loadUrl: `${url}/Tasks`,
    updateUrl: `${url}/UpdateTask`,
    onBeforeSend(method, ajaxOptions) {
      ajaxOptions.xhrFields = {
        withCredentials: true
      };
    },
  });
  let updateInProgress = false;

  function getDataGridConfiguration(index) {
    return {
      height: 440,
      dataSource: {
        store,
        reshapeOnPush: true,
      },
      showBorders: true,
      filterValue: ['Status', '=', index],
      selection: {
        mode: "multiple"
      },
      rowDragging: {
        data: index,
        group: 'tasksGroup',
        onAdd,
        onDragStart(e) {
          const selectedData = e.component.getSelectedRowsData();
          e.itemData = getVisibleRowValues(selectedData, e.component);
          e.cancel = !canDrag(e);
        },
        dragTemplate(dragData) {
          const itemsContainer = $("<table>").addClass("drag-container");
          dragData.itemData.forEach((rowData => {
            const itemContainer = $("<tr>");
            for (field in rowData) {
              itemContainer.append($("<td>").text(rowData[field]));
            }
            itemsContainer.append(itemContainer);
          }));
          return $("<div>").append(itemsContainer);
        }
      },
      scrolling: {
        mode: 'virtual',
      },
      columns: [{
        dataField: 'Subject',
        dataType: 'string',
      }, {
        dataField: 'Priority',
        dataType: 'number',
        width: 80,
        lookup: {
          dataSource: priorities,
          valueExpr: 'id',
          displayExpr: 'text',
        },
      }, {
        dataField: 'Status',
        dataType: 'number',
        visible: false,
      }],
    };
  }

  $('#grid1').dxDataGrid(getDataGridConfiguration(1));

  $('#grid2').dxDataGrid(getDataGridConfiguration(2));

  function onAdd(e) {
    const selectedRowKeys = e.fromComponent.getSelectedRowKeys();
    const updateProcess = [];
    const changes = [];
    updateInProgress = true;
    e.fromComponent.beginCustomLoading("Loading...");
    e.toComponent.beginCustomLoading("Loading...");
    for (key of selectedRowKeys) {
      const values = { Status: e.toData };
      updateProcess.push(store.update(key, values));
      changes.push({
        type: 'update',
        key,
        data: values,
      });
    }
    Promise.all(updateProcess).then(() => {
      store.push(changes);
      e.fromComponent.endCustomLoading();
      e.toComponent.endCustomLoading();
      updateInProgress = false;

      e.fromComponent.clearSelection();
      if (!shouldClearSelection()) {
        e.toComponent.selectRows(selectedRowKeys, true);
      }
    });
  }

  function canDrag(e) {
    if (updateInProgress) return false;
    const visibleRows = e.component.getVisibleRows();
    return visibleRows.some(r => r.isSelected && r.rowIndex === e.fromIndex);
  }

  function getVisibleRowValues(rowsData, grid) {
    const visColumns = grid.getVisibleColumns().filter(c => c.dataField);
    const selectedData = rowsData.map(s => {
        const visibleValues = {};
        visColumns.forEach(column => {
          visibleValues[column.dataField] = column.lookup ?
            column.lookup.calculateCellValue(s[column.dataField]) :
            s[column.dataField];
        });
      return visibleValues;
    });
    return selectedData;
  }

  function shouldClearSelection() {
    return $("#clearAfterDropSwitch").dxSwitch("option", "value");
  }
  
  $("#clearAfterDropSwitch").dxSwitch({});  
});