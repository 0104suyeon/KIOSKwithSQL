'use strict';

let defaultData;

fetch('./data/default-item.json')
.then(response => {
   return response.json();
})
.then(jsondata => {
  defaultData = jsondata;
});
