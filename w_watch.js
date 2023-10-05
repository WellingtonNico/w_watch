class WWatch {
  /**
   * @typedef {Object} WatcherConfig
   * @property {HTMLElement} alvo - seletor css do alvo
   * @property {string} tipo - pode ser um evento específico ou algum evento de mutação
   * @property {string} efeito - string sendo a função a ser disparada ao rodar o evento
   * @property {boolean} rodarSeco - se verdadeiro irá rodar um evento seco se possível
   */
  
  chavesDeMutacao = ["childList", "attributes", "characterData", "subtree"];
  
  obterWatchers() {
    return document.querySelectorAll("[w-watch]:not([w-watch-ready])");
  }
  
  /**
   * @param {HTMLElement} watcher
   * @returns {WatcherConfig[]} lista de configurações do elemento
   */
  obterConfiguracoesDoWatcher(watcher) {
    const watchList = watcher.getAttribute("w-watch").split(",");
    const watchConfigList = [];
    watchList.forEach((watch, index) => {
      const [seletor, tipo] = watch.split(":");
      let alvo;
      try {
        alvo = document.querySelector(seletor);
      } catch {
        console.warn(`WWatch: não foi possível localizar o alvo`);
      }
      const efeito = (
        watcher.getAttribute(`w-effect-${index}`) ?? ""
      ).trim();
      // se faltar a definição do evento ou o efeito para ordem do evento a configuração não ocorrerá
      if (!tipo || !efeito || !alvo) {
        console.warn(`WWatch: pulando configuração do seletor ${seletor}`);
      } else {
        watchConfigList.push({alvo, tipo, efeito});
      }
    });
    return watchConfigList;
  }
  
  /**
   *
   * @param {HTMLElement} watcher
   * @param {WatcherConfig[]} watchConfigList
   */
  adicionarEventos(watcher, watchConfigList) {
    watchConfigList.forEach((watchConfig) => {
      const alvo = watchConfig.alvo
      const func = new Function(watchConfig.efeito)
      watcher['alvo'] = alvo
      
      if (this.chavesDeMutacao.includes(watchConfig.tipo)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === watchConfig.tipo) {
              func.call(watcher)
            }
          });
        });
        observer.observe(watchConfig.alvo, {[watchConfig.tipo]: true});
      } else {
        watchConfig.alvo.addEventListener(watchConfig.tipo, (event) => {
          func.call(watcher)
        })
      }
    });
  }
  
  inicializar() {
    const listaWatchers = [...this.obterWatchers()]
    listaWatchers.forEach(watcher => {
      const wathcerConfigs = this.obterConfiguracoesDoWatcher(watcher)
      this.adicionarEventos(watcher, wathcerConfigs)
      watcher.setAttribute('w-watch-ready','')
    })
  }
}
