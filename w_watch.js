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
      const rodarSeco = watcher.getAttribute(`w-effect-${index}-dry-run`)??'true'=='true'
      const efeito = (
        watcher.getAttribute(`w-effect-${index}`) ?? ""
      ).trim();
      // se faltar a definição do evento ou o efeito para ordem do evento a configuração não ocorrerá
      if (!tipo || !efeito || !alvo) {
        console.warn(`WWatch: pulando configuração do seletor ${seletor}`);
      } else {
        watchConfigList.push({alvo, tipo, efeito,rodarSeco});
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
    watchConfigList.forEach((watcherConfig) => {
      const alvo = watcherConfig.alvo
      const func = new Function(watcherConfig.efeito)
      watcher['alvo'] = alvo
      if (this.chavesDeMutacao.includes(watcherConfig.tipo)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === watcherConfig.tipo) {
              func.call(watcher)
            }
          });
        });
        observer.observe(watcherConfig.alvo, {[watcherConfig.tipo]: true});
      } else {
        watcherConfig.alvo.addEventListener(watcherConfig.tipo, (event) => {
          func.call(watcher)
        })
      }
      if(watcherConfig.rodarSeco){
        func.call(watcher)
      }
    });
  }
  
  // TODO: add attributo para disparo de evento automático w-event-change="checkBoxAlterada" ou dinamico sendo w-event-mouseenter
  // TODO: add observer para rodar novamente a qualquer alteração na dom
  
  inicializar() {
    const listaWatchers = [...this.obterWatchers()]
    listaWatchers.forEach(watcher => {
      const wathcerConfigs = this.obterConfiguracoesDoWatcher(watcher)
      this.adicionarEventos(watcher, wathcerConfigs)
      watcher.setAttribute('w-watch-ready','')
    })
  }
}
