import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import { useCallback, useState } from 'react';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import Switch from 'devextreme-react/switch';
import { type ValueChangedEvent } from 'devextreme/ui/switch';
import Grid from './Grid';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DnDBetweenGrids';

const tasksStore = AspNetData.createStore({
  key: 'ID',
  loadUrl: `${url}/Tasks`,
  updateUrl: `${url}/UpdateTask`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function App(): JSX.Element {
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

  const switchValueChanged = useCallback((e: ValueChangedEvent) => {
    setShouldClearSelection(e.value);
  }, []);

  return (
    <div className="demo-container">
      <div className="demo-header">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <h3>DataGrid - Select multiple items and drag'n'drop between grids</h3>
        <div id="toggle-container">
          <span>Clear selection of dropped items</span>
          <Switch id="clean-after-drop-switch" value={shouldClearSelection} onValueChanged={switchValueChanged}></Switch>
        </div>
      </div>
      <div className="tables">
        <div className="column">
          <Grid tasksStore={tasksStore} status={1} shouldClearSelection={shouldClearSelection} />
        </div>
        <div className="column">
          <Grid tasksStore={tasksStore} status={2} shouldClearSelection={shouldClearSelection} />
        </div>
      </div>
    </div>
  );
}

export default App;
