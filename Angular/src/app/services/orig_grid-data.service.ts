import { Injectable } from '@angular/core';

export interface Task {
  ID?: number;
  Priority?: number;
  Status?: number;
  Subject?: string;
}

export interface Priority {
  id?: number;
  text?: string;
}

const priorities: Priority[] = [{
  id: 1, text: 'Low',
}, {
  id: 2, text: 'Normal',
}, {
  id: 3, text: 'High',
}, {
  id: 4, text: 'Urgent',
}];

@Injectable({
  providedIn: 'root'
})
export class GridDataService {
  getPriorities() {
    return priorities;
  }
}
