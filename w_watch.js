class WWatch {
  /**
   * @typedef {Object} WWatcherConfig
   * @property {Element} watch - seletor css do alvo
   * @property {string} tipo - pode ser um evento específico ou algum evento de mutação
   * @property {string} efeito - string sendo a função a ser disparada ao rodar o evento
   * @property {boolean} rodarSeco - se verdadeiro irá rodar um evento seco se possível
   */
  
  /**
   * @typedef {Object} WTriggerConfig
   * @property {string} tipo - pode ser um evento específico ou algum evento de mutação
   * @property {Element} dispatcher - elemento que vai disparar o evento
   * @property {string} nomeEvento - nome do evento a ser disparado
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
   * @returns {WWatcherConfig[]} lista de configurações do elemento
   */
  obterConfiguracoesDoWWatcher(watcher) {
    const watchList = watcher.getAttribute("w-watch").split(",");
    /** @type {WWatcherConfig[]} */
    const watchConfigList = [];
    const efeitoPadrao = watcher.getAttribute('w-effect') ?? ''
    watchList.forEach((config, index) => {
      const [seletor, tipo] = config.split(":");
      let watch;
      try {
        if (['document', 'window'].includes(seletor)) {
          watch = eval(seletor)
        } else if (seletor === 'this') {
          watch = watcher
        } else {
          watch = document.querySelector(seletor);
        }
        if (!watch) {
          throw new Error()
        }
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
   * @param {HTMLElement} wwatcher
   * @param {WWatcherConfig[]} wwatcherConfigs
   */
  adicionarWWatchEventos(wwatcher, wwatcherConfigs) {
    wwatcherConfigs.forEach((wwatcherConfig) => {
      const watch = wwatcherConfig.watch
      const func = new Function(wwatcherConfig.efeito)
      wwatcher.watch = watch
      if (this.chavesDeMutacao.includes(wwatcherConfig.tipo)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === wwatcherConfig.tipo) {
              func.call(wwatcher)
            }
          });
        });
        observer.observe(wwatcherConfig.watch, {[wwatcherConfig.tipo]: true});
      } else {
        wwatcherConfig.watch.addEventListener(wwatcherConfig.tipo, (event) => {
          func.call(wwatcher)
        })
      }
      if (wwatcherConfig.rodarSeco) {
        func.call(wwatcher)
      }
    });
  }
  
  /**
   * @param {HTMLElement} wtrigger
   * @returns {WTriggerConfig[]}
   */
  obterConfiguracoesDoWTrigger(wtrigger) {
    const triggers = wtrigger.getAttribute('w-trigger').split(',')
    /** @type {WTriggerConfig[]} */
    const wtriggerConfigs = []
    triggers.forEach(trigger => {
      let [tipo, nomeEvento, seletorDispatcher] = trigger.split(':')
      if (!seletorDispatcher) {
        seletorDispatcher = 'document'
      }
      let dispatcher
      try {
        if (['document', 'window'].includes(seletorDispatcher)) {
          dispatcher = eval(seletorDispatcher)
        } else if (seletorDispatcher === 'this') {
          dispatcher = seletorDispatcher
        } else {
          dispatcher = document.querySelector(seletorDispatcher);
        }
        if (!dispatcher) {
          throw new Error()
        }
        if (!tipo || !nomeEvento) {
          console.warn(`WWatch: pulando configuração do wtrigger `, wtrigger);
        } else {
          wtriggerConfigs.push({dispatcher, nomeEvento, tipo})
        }
      } catch (_) {
        console.warn(`WWatch: não foi possível localizar dispatcher`)
      }
    })
    return wtriggerConfigs
  }
  
  // TODO: add attributo para disparo de evento automático w-event-change="checkBoxAlterada" ou dinamico sendo w-event-mouseenter
  // TODO: add observer para rodar novamente a qualquer alteração na dom
  
  inicializarWWatchers() {
    [...this.obterWWatchers()].forEach(watcher => {
      this.adicionarWWatchEventos(watcher, this.obterConfiguracoesDoWWatcher(watcher))
      watcher.setAttribute(this.atributoWWatcherConfigurado, '')
    })
  }
  
  /**
   * @param {string} nome
   * @param {Element} target
   * @param {Element} dispacher
   */
  despacharEvento(nome, target, dispacher) {
    const wEvento = new Event(nome, {bubbles: true, cancelable: true})
    wEvento.target = target
    dispacher.dispatchEvent(wEvento)
  }
  
  /**
   * @param {Element} wtrigger
   * @param {WTriggerConfig[]} wtriggerConfigs
   */
  adicionarWTriggerEventos(wtrigger, wtriggerConfigs) {
    wtriggerConfigs.forEach(wtriggerConfig => {
      if (this.chavesDeMutacao.includes(wtriggerConfig.tipo)) {
        const observer = new MutationObserver((mutationsList, _) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === wtriggerConfig.tipo) {
              this.despacharEvento(wtriggerConfig.nomeEvento, wtrigger, wtriggerConfig.dispatcher)
            }
          });
        });
        observer.observe(wtrigger, {[wtriggerConfig.tipo]: true});
      } else {
        wtrigger.addEventListener(wtriggerConfig.tipo, (event) => {
          this.despacharEvento(wtriggerConfig.nomeEvento, wtrigger, wtriggerConfig.dispatcher)
        })
      }
    })
  }
  
  inicializarWTriggers() {
    [...this.obterWTriggers()].forEach(wtrigger => {
      this.adicionarWTriggerEventos(wtrigger, this.obterConfiguracoesDoWTrigger(wtrigger))
      wtrigger.setAttribute(this.atributoWTriggerConfigurado, '')
    })
  }
  
  inicializar() {
    this.inicializarWWatchers()
    this.inicializarWTriggers()
  }
}
