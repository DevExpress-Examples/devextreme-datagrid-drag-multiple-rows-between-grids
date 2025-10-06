<script setup lang="ts">
import { ref } from 'vue';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import type CustomStore from 'devextreme/data/custom_store';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import DxSwitch from 'devextreme-vue/switch';
import Grid from './CustomGrid.vue';

const shouldClearSelection = ref(false);

const url = 'https://js.devexpress.com/Demos/Mvc/api/DnDBetweenGrids';

const tasksStore: CustomStore = createStore({
  key: 'ID',
  loadUrl: `${url}/Tasks`,
  updateUrl: `${url}/UpdateTask`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
</script>
<template>
  <div>
    <div className="demo-header">
      <h3>DataGrid - Select multiple items and drag'n'drop</h3>
      <div id="toggle-container">
        <span>Clear selection after drop</span>
        <DxSwitch
          id="clearAfterDropSwitch"
          v-model:value="shouldClearSelection"
        />
      </div>
    </div>
    <div class="tables">
      <Grid
        :tasks-store="tasksStore"
        :status="1"
        :should-clear-selection="shouldClearSelection"
        class="column"
      />
      <Grid
        :tasks-store="tasksStore"
        :status="2"
        :should-clear-selection="shouldClearSelection"
        class="column"
      />
    </div>
  </div>
</template>
<style scoped>
  .demo-container {
      margin: 50px 50px;
      width: 90vh;
  }
  .demo-header {
      display: flex;
      justify-content: space-between;
  }
  #toggle-container {
      padding-top: 20px;
  }
  #clearAfterDropSwitch {
      vertical-align: text-bottom;
  }
  #toggle-container span {
      padding-right: 10px;
  }
  :global(.drag-container) {
      padding: 10px;
  }
  :global(.drag-container td) {
      padding: 0px 10px 0px 10px;
  }
  .tables {
    display: flex;
  }
  .column:first-child {
    width: 50%;
    padding-right: 15px;
  }
  .column:last-child {
    width: 50%;
    padding-left: 15px;
  }
</style>
