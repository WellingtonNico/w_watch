class WWatch {
  /**
   * @typedef {Object} WatcherConfig
   * @property {HTMLElement} watch - seletor css do alvo
   * @property {string} tipo - pode ser um evento específico ou algum evento de mutação
   * @property {string} efeito - string sendo a função a ser disparada ao rodar o evento
   * @property {boolean} rodarSeco - se verdadeiro irá rodar um evento seco se possível
   */
  
  atributoWWatcherConfigurado = 'w-watch-ready'
  atributoWTriggerConfigurado = 'w-trigger-ready'
  
  chavesDeMutacao = ["childList", "attributes", "characterData", "subtree"];
  
  obterWTriggers() {
    return document.querySelectorAll(`[w-trigger]:not([${this.atributoWTriggerConfigurado}])`);
  }
  
  obterWWatchers() {
    return document.querySelectorAll(`[w-watch]:not([${this.atributoWWatcherConfigurado}])`);
  }
  
  /**
   * @param {HTMLElement} watcher
   * @returns {WatcherConfig[]} lista de configurações do elemento
   */
  obterConfiguracoesDoWatcher(watcher) {
    const watchList = watcher.getAttribute("w-watch").split(",");
    const watchConfigList = [];
    const efeitoPadrao = watcher.getAttribute('w-effect') ?? ''
    watchList.forEach((config, index) => {
      const [seletor, tipo] = config.split(":");
      let watch;
      try {
        watch = document.querySelector(seletor);
      } catch {
        console.warn(`WWatch: não foi possível localizar o alvo`);
      }
      const rodarSeco = watcher.getAttribute(`w-effect-${index}-dry-run`) ?? 'true' == 'true'
      let efeito = (
        watcher.getAttribute(`w-effect-${index}`) ?? ""
      ).trim();
      efeito = efeito ? efeito : efeitoPadrao
      // se faltar a definição do evento ou o efeito para ordem do evento a configuração não ocorrerá
      if (!tipo || !efeito || !watch) {
        console.warn(`WWatch: pulando configuração do seletor ${seletor}`);
      } else {
        watchConfigList.push({watch, tipo, efeito, rodarSeco});
      }
    });
    return watchConfigList;
  }
  
  /**
   *
   * @param {HTMLElement} watcher
   * @param {WatcherConfig[]} watchConfigList
   */
  adicionarWWatchEventos(watcher, watchConfigList) {
    watchConfigList.forEach((watcherConfig) => {
      const watch = watcherConfig.watch
      const func = new Function(watcherConfig.efeito)
      watcher.watch = watch
      if (this.chavesDeMutacao.includes(watcherConfig.tipo)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === watcherConfig.tipo) {
              func.call(watcher)
            }
          });
        });
        observer.observe(watcherConfig.watch, {[watcherConfig.tipo]: true});
      } else {
        watcherConfig.watch.addEventListener(watcherConfig.tipo, (event) => {
          func.call(watcher)
        })
      }
      if (watcherConfig.rodarSeco) {
        func.call(watcher)
      }
    });
  }
  
  
  // TODO: add attributo para disparo de evento automático w-event-change="checkBoxAlterada" ou dinamico sendo w-event-mouseenter
  // TODO: add observer para rodar novamente a qualquer alteração na dom
  
  inicializarWWatchers() {
    [...this.obterWWatchers()].forEach(watcher => {
      this.adicionarWWatchEventos(watcher, this.obterConfiguracoesDoWatcher(watcher))
      watcher.setAttribute(this.atributoWWatcherConfigurado, '')
    })
  }
  
  inicializarWTriggers(){
    const listaWTriggers = [...this.obterWTriggers()]
  }
  
  inicializar() {
    this.inicializarWWatchers()
  }
}
