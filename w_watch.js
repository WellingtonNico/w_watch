class WWatch {
  /**
   * @typedef {Object} WatchNodeConfig
   * @property {HTMLElement} alvo - seletor css do alvo
   * @property {string} tipoWatch - pode ser um evento específico ou algum evento de mutação
   * @property {string} watchEffect - string sendo a função a ser disparada ao rodar o evento
   */
  
  chavesDeMutacao = ["childList", "attributes", "characterData", "subtree"];
  
  obterWatchersConfigurados() {
    return document.querySelectorAll("[w-watch]:not([w-watch-ready])");
  }
  
  /**
   * @param {HTMLElement} watcher
   * @returns {WatchNodeConfig[]} lista de configurações do elemento
   */
  obterConfiguracoesDoWatcher(watcher) {
    const watchList = watcher.getAttribute("w-watch").split(",");
    const watchConfigList = [];
    watchList.forEach((watch, index) => {
      const [seletor, tipoWatch] = watch.split(":");
      let alvo;
      try {
        alvo = document.querySelector(seletor);
      } catch {
        console.warn(`WWatch: não foi possível localizar o alvo`);
      }
      const watchEffect = (
        watcher.getAttribute(`w-effect-${index}`) ?? ""
      ).trim();
      // se faltar a definição do evento ou o efeito para ordem do evento a configuração não ocorrerá
      if (!tipoWatch || !watchEffect || !alvo) {
        console.warn(`WWatch: pulando configuração do seletor ${seletor}`);
      } else {
        watchConfigList.push({alvo, tipoWatch, watchEffect});
      }
    });
    return watchConfigList;
  }
  
  /**
   *
   * @param {HTMLElement} watcher
   * @param {WatchNodeConfig[]} watchConfigList
   */
  adicionarEventos(watcher, watchConfigList) {
    watchConfigList.forEach((watchConfig) => {
      const alvo = watchConfig.alvo
      const func = new Function(watchConfig.watchEffect)
      watcher['alvo'] = alvo
      
      if (this.chavesDeMutacao.includes(watchConfig.tipoWatch)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === watchConfig.tipoWatch) {
              func.call(watcher)
            }
          });
        });
        observer.observe(watchConfig.alvo, {[watchConfig.tipoWatch]: true});
      } else {
        watchConfig.alvo.addEventListener(watchConfig.tipoWatch, (event) => {
          func.call(watcher)
        })
      }
    });
  }
  
  inicializar() {
    const listaWatchers = [...this.obterWatchersConfigurados()]
    listaWatchers.forEach(watcher => {
      const wathcerConfigs = this.obterConfiguracoesDoWatcher(watcher)
      this.adicionarEventos(watcher, wathcerConfigs)
      watcher.setAttribute('w-watch-ready','')
    })
  }
}
