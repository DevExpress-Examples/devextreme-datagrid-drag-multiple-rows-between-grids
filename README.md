<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/629412578/22.2.3%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1160747)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# DataGrid for DevExtreme - How to drag multiple rows between two grids

This example demonstrates how to simultaneously drag and drop multiple selected rows between two grids.

![datagrid-drag-multiple-rows-between-grids](https://user-images.githubusercontent.com/21377435/232749557-c2557670-e658-4680-a58c-35092a9529f7.gif)

This implementation is based on our demo that illustrates how to drag a single row between two grids using the same data source: [Drag & Drop Between Two Grids](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/DnDBetweenGrids/jQuery/Light/).

Although this example only illustrates a solution for DataGrid with remote data sources, the same solution also works for local data sources.

For remote data sources, multiple requests are sent to update the order index of every dropped row. If your back-end supports batch updates, you can simultaneously send all data updates in a custom way.

## Implementation Details

Use the [DataGrid.rowDragging](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/rowDragging/) object to configure the drag and drop functionality:
1) Handle the [RowDragging.onDragStart](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/rowDragging/#onDragStart) event to collect selected rows and cancel the drag operation if a user attempts to drag non-selected rows.
2) Handle the [RowDragging.onAdd](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/rowDragging/#onAdd) event to update rows in the data source.
3) Define [RowDragging.dragTemplate](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/rowDragging/#dragTemplate) to arrange cell values of selected rows for the dragged item.

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
- **Vue**
    - [HomeContent.vue](Vue/src/components/HomeContent.vue)
    - [Grid.vue](Vue/src/components/Grid.vue)
- **React**
    - [App.tsx](React/src/App.tsx)
    - [Grid.tsx](React/src/Grid.tsx)
- **NetCore**    
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)
    - [DnDBetweenGridsPartial.cshtml](ASP.NET%20Core/Views/Home/DnDBetweenGridsPartial.cshtml)

## Documentation

[DataGrid.rowDragging](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/rowDragging/)

## More Examples

- [DevExtreme TreeView - How to drag and drop multiple items](https://github.com/DevExpress-Examples/devextreme-treeview-drag-and-drop-multiple-items)
- [DataGrid for DevExtreme - How to drag multiple rows](https://github.com/DevExpress-Examples/devextreme-datagrid-drag-multiple-rows)
