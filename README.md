# W-Watch

lib js para diminuir a necessidade de criar script tags para eventos no seu template html
permitindo que que a lógica de atualização de componente fique no elemento
que precisa ser atualizado e não no elemento que irá gerar os gatilhos


## como usar?
* inclua no seu template
```html
<!-- w-watch via cdn -->
<script src="https://cdn.jsdelivr.net/gh/WellingtonNico/w_watch/w_watch.js"></script>

<!-- wellnotify arquivo local -->
<script src="/static/js/w_watch.js"></script>
```
* adicione atributos aos seus elementos
```html

  <!-- 
    a tag output irá observar click dentro do tbody, assim como mutações nas linhas
    a cada evento gerado o elemento irá atualizar o seu valor para a contagem
    de linhas da tabela
    -->
<span>A tabela contém
  <output 
      w-watch="#id_tbody:click,#id_tbody:childList"
      w-effect="this.value = this.watch.children.length"
  ></output> 
  linhas
</span>

<table>
  <thead>...</thead>
  <tbody id="id_tbody">...</tbody>
</table>
```
* você também pode ouvir seus próprios eventos, e para disparar estes eventos já temos um facilitador: `w-trigger`
```html

<!-- 
  exibe a contagem de quantas checkbox estão selecionadas e se mantém atualizado
  ouvindo o evento "checkBoxAlterada"
  -->
<span>
  <output 
      w-watch="document:checkBoxAlterada"
      w-effect="this.value = id_tbody.querySelectorAll('input:checked').length"
  ></output> 
  checkbox selecionadas
</span>

<tbody id="id_tbody">
<tr>
  <td>
    <!-- quando a checkbox for alterada pelo usuário irá disparar um evento chamado "checkBoxAlterada" -->
    <input w-trigger="change:checkBoxAlterada" type="checkbox">
  </td>
  <td>dado 1</td>
  <td>dado 2</td>
</tr>
</tbody>
```

## atributos W-Watchers
os atributos w-watchers são os atributos inseridos nos elementos que precisam
ser atualizados baseados em outros elementos

### `w-watch`
este atributo recebe uma lista de argumentos separados por ",", cada argumento deve conter
um target, um evento e um terceiro opcional, da seguinte maneira `<target>:<evento>:<rodar antes>`: 
* O "target" deve ser um seletor css ou uma das reservadas aceitas: document, window e this(o próprio elemento), ou ainda 
uma função como `closest tbody`, neste caso será chamada a função closest com `tbody` como argumento, para isso basta separar com um espaço vazio "` `".
* O "evento" pode ser qualquer evento disponível por elemento, ou ainda um evento assistido por observers
como `childList`, `attributes` ou `characterData`.
* O "rodar antes", define se o efeito deve rodar ao configurar o elemento a primeira vez, o padrão é `true`
indicando que todos os efeitos serão disparado ao menos uma vez mesmo que os eventos
a serem ouvidos ainda não tenham sido disparados
```html
<output w-watch="document:scroll:false,window:resize"></output>
```
o elemento `output` passa a ouvir os eventos `scroll` do `document` e também o evento
`resize` da window,

### `w-effect` e `w-effect-{index}`
este atributo deve conter a expressão javascript a ser executada após o alvo disparar o evento
especificado no atributo `w-watch`, como o atributo `w-watch` pode receber uma lista
de argumentos você pode atribuir um efeito para cada argumento inserindo o atributo
`w-effect` seguido do index do argumento definido em `w-watch`. Ex:
```html
<!-- 
  são redundantes, mas só para fins didáticos
  o elemento output está ouvindo as alterações na childList e click no botão de adicionar linha
  o attributo w-effect-0 será disparado quando houver alterações na tbody
  o attributo w-effect-1 será disparado quando o botão #id_button_add_row for clicado 
   -->
<output 
    w-watch="#id_tbody:childList,#id_button_add_row:click"
    w-effect-0="this.value = this.watch.children.length"
    w-effect-1="
      console.log('Usuário adicionou uma linha')
      this.value = this.watch.children.length
    "
></output>
```
se você não definir um `w-effect-{index}` será necessário um `w-effect` para ser usado
como padrão.

## atributo W-Trigger
para facilitar a disparada de eventos específicos sem a necessidade de muito javascrip
já le trago o atributos adicional `w-trigger`.
* `w-trigger` é um facilitador para disparada de eventos customizados quando necessário.
Muito simples de usar: Digamos que você tenha várias tabelas ou vários elementos de uma tabela
e por algum motivo pretende disparar um evento customizado, para isso você pode 
definir o atributo `w-trigger` no seu elemento. Ex:
```html
<input w-trigger="change:checkFeitoNaTabelaProdutos" type="checkbox">
```
neste caso será disparado o evento `checkFeitoNaTabelaProdutos` ao ser disparado o evento `change` do input.
Os eventos são despachados por padrão pelo `document`, e isso pode ser alterado da seguinte maneira:
O atributo `w-trigger` também recebe uma lista de argumentos separados por ",", e cada argumento 
também pode ser subdividido usando "`:`": `<evento>:<nome do evento customizado>:<seletor do despachante>`,
sendo que o seletor do despachante atua igual ao seletor do watch, podendo ser palavra reservada ou função com argumento separado por "` `".Ex:
```html
<input w-trigger="change:checkFeitoNaTabelaProdutos:closest tbody" type="checkbox">
```
neste caso o evento será disparado pela `tbody` que contém dentro o input acima podendo então
ou não que você defina o atribudo `w-watch` para ouvir o evento customizado `checkFeitoNaTabelaProdutos`
vindo especificamente da tabela que deseja


## Plus
como eventos tipo `change` e outros não são disparados ao alterar um elemento via javascript
temos que disparar eventos "manualmente", comumente usamos jquery, mas esta lib também te permite
não ser necessário jquery! Ao usar o atributo `w-watcher` ou `w-trigger` o alvo selecionado ou o despachante
ganha uma função que você pode chamar para disparar seu evento. Ex:

```html
<!-- neste caso o input abaixo ganha a funçnao "trigger_checkBoxAlterada" -->
<input id="id_input" w-trigger="change:checkBoxAlterada" type="checkbox">

<!-- neste caso o input com id "id_input" também recebe a função "trigger_checkBoxAlterada" -->
<output w-watch="#id_input:checkBoxAlterada"> </output>
```


