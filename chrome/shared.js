function lf_checkReadyState(parsingFunction) {
    return new Promise((resolve) => {
      if(document.readyState === 'complete') {
        console.log('readyState is complete');
        parsingFunction().then(resolve);
      } else {
        console.log('readyState is not complete');
        setTimeout(() => lf_checkReadyState().then(resolve), 1000);
      }
    });
  }