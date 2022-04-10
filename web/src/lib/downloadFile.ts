export function downloadFile(url: string, fileName: string) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onprogress = function (event) {
    if (event.lengthComputable) {
      var percentComplete = (event.loaded / event.total) * 100;
      //yourShowProgressFunction(percentComplete);
    }
  };

  xhr.onload = function (event) {
    if (this.status == 200) {
      _saveBlob(this.response, fileName);
    } else {
      //yourErrorFunction()
    }
  };

  xhr.onerror = function (event) {
    //yourErrorFunction()
  };

  xhr.send();
}

function _saveBlob(response: any, fileName: string) {
  // @ts-ignore
  if (navigator.msSaveBlob) {
    //OK for IE10+
    // @ts-ignore
    navigator.msSaveBlob(response, fileName);
  } else {
    _html5Saver(response, fileName);
  }
}

function _html5Saver(blob: any, fileName: string) {
  var a = document.createElement('a');
  document.body.appendChild(a);
  // @ts-ignore
  a.style = 'display: none';
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  document.body.removeChild(a);
}
