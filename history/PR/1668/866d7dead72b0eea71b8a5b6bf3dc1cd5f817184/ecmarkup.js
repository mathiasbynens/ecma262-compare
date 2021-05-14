'use strict';
let sdoBox = {
  init() {
    this.$alternativeId = null;
    this.$outer = document.createElement('div');
    this.$outer.classList.add('toolbox-container');
    this.$container = document.createElement('div');
    this.$container.classList.add('toolbox');
    this.$displayLink = document.createElement('a');
    this.$displayLink.setAttribute('href', '#');
    this.$displayLink.textContent = 'Syntax-Directed Operations';
    this.$displayLink.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      referencePane.showSDOs(sdoMap[this.$alternativeId] || {}, this.$alternativeId);
    });
    this.$container.appendChild(this.$displayLink);
    this.$outer.appendChild(this.$container);
    document.body.appendChild(this.$outer);
  },

  activate(el) {
    clearTimeout(this.deactiveTimeout);
    Toolbox.deactivate();
    this.$alternativeId = el.id;
    let numSdos = Object.keys(sdoMap[this.$alternativeId] || {}).length;
    this.$displayLink.textContent = 'Syntax-Directed Operations (' + numSdos + ')';
    this.$outer.classList.add('active');
    let top = el.offsetTop - this.$outer.offsetHeight;
    let left = el.offsetLeft + 50 - 10; // 50px = padding-left(=75px) + text-indent(=-25px)
    this.$outer.setAttribute('style', 'left: ' + left + 'px; top: ' + top + 'px');
    if (top < document.body.scrollTop) {
      this.$container.scrollIntoView();
    }
  },

  deactivate() {
    clearTimeout(this.deactiveTimeout);
    this.$outer.classList.remove('active');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof sdoMap == 'undefined') {
    console.error('could not find sdo map');
    return;
  }
  sdoBox.init();

  let insideTooltip = false;
  sdoBox.$outer.addEventListener('pointerenter', () => {
    insideTooltip = true;
  });
  sdoBox.$outer.addEventListener('pointerleave', () => {
    insideTooltip = false;
    sdoBox.deactivate();
  });

  sdoBox.deactiveTimeout = null;
  [].forEach.call(document.querySelectorAll('emu-grammar[type=definition] emu-rhs'), node => {
    node.addEventListener('pointerenter', function () {
      sdoBox.activate(this);
    });

    node.addEventListener('pointerleave', () => {
      sdoBox.deactiveTimeout = setTimeout(() => {
        if (!insideTooltip) {
          sdoBox.deactivate();
        }
      }, 500);
    });
  });

  document.addEventListener(
    'keydown',
    debounce(e => {
      if (e.code === 'Escape') {
        sdoBox.deactivate();
      }
    })
  );
});

'use strict';
function Search(menu) {
  this.menu = menu;
  this.$search = document.getElementById('menu-search');
  this.$searchBox = document.getElementById('menu-search-box');
  this.$searchResults = document.getElementById('menu-search-results');

  this.loadBiblio();

  document.addEventListener('keydown', this.documentKeydown.bind(this));

  this.$searchBox.addEventListener(
    'keydown',
    debounce(this.searchBoxKeydown.bind(this), { stopPropagation: true })
  );
  this.$searchBox.addEventListener(
    'keyup',
    debounce(this.searchBoxKeyup.bind(this), { stopPropagation: true })
  );

  // Perform an initial search if the box is not empty.
  if (this.$searchBox.value) {
    this.search(this.$searchBox.value);
  }
}

Search.prototype.loadBiblio = function () {
  if (typeof biblio === 'undefined') {
    console.error('could not find biblio');
    this.biblio = { refToClause: {}, entries: [] };
  } else {
    this.biblio = biblio;
    this.biblio.clauses = this.biblio.entries.filter(e => e.type === 'clause');
    this.biblio.byId = this.biblio.entries.reduce((map, entry) => {
      map[entry.id] = entry;
      return map;
    }, {});
    let refParentClause = Object.create(null);
    this.biblio.refParentClause = refParentClause;
    let refsByClause = this.biblio.refsByClause;
    Object.keys(refsByClause).forEach(clause => {
      refsByClause[clause].forEach(ref => {
        refParentClause[ref] = clause;
      });
    });
  }
};

Search.prototype.documentKeydown = function (e) {
  if (e.keyCode === 191) {
    e.preventDefault();
    e.stopPropagation();
    this.triggerSearch();
  }
};

Search.prototype.searchBoxKeydown = function (e) {
  e.stopPropagation();
  e.preventDefault();
  if (e.keyCode === 191 && e.target.value.length === 0) {
    e.preventDefault();
  } else if (e.keyCode === 13) {
    e.preventDefault();
    this.selectResult();
  }
};

Search.prototype.searchBoxKeyup = function (e) {
  if (e.keyCode === 13 || e.keyCode === 9) {
    return;
  }

  this.search(e.target.value);
};

Search.prototype.triggerSearch = function () {
  if (this.menu.isVisible()) {
    this._closeAfterSearch = false;
  } else {
    this._closeAfterSearch = true;
    this.menu.show();
  }

  this.$searchBox.focus();
  this.$searchBox.select();
};
// bit 12 - Set if the result starts with searchString
// bits 8-11: 8 - number of chunks multiplied by 2 if cases match, otherwise 1.
// bits 1-7: 127 - length of the entry
// General scheme: prefer case sensitive matches with fewer chunks, and otherwise
// prefer shorter matches.
function relevance(result) {
  let relevance = 0;

  relevance = Math.max(0, 8 - result.match.chunks) << 7;

  if (result.match.caseMatch) {
    relevance *= 2;
  }

  if (result.match.prefix) {
    relevance += 2048;
  }

  relevance += Math.max(0, 255 - result.entry.key.length);

  return relevance;
}

Search.prototype.search = function (searchString) {
  if (searchString === '') {
    this.displayResults([]);
    this.hideSearch();
    return;
  } else {
    this.showSearch();
  }

  if (searchString.length === 1) {
    this.displayResults([]);
    return;
  }

  let results;

  if (/^[\d.]*$/.test(searchString)) {
    results = this.biblio.clauses
      .filter(clause => clause.number.substring(0, searchString.length) === searchString)
      .map(clause => ({ entry: clause }));
  } else {
    results = [];

    for (let i = 0; i < this.biblio.entries.length; i++) {
      let entry = this.biblio.entries[i];
      if (!entry.key) {
        // biblio entries without a key aren't searchable
        continue;
      }

      let match = fuzzysearch(searchString, entry.key);
      if (match) {
        results.push({ entry, match });
      }
    }

    results.forEach(result => {
      result.relevance = relevance(result, searchString);
    });

    results = results.sort((a, b) => b.relevance - a.relevance);
  }

  if (results.length > 50) {
    results = results.slice(0, 50);
  }

  this.displayResults(results);
};
Search.prototype.hideSearch = function () {
  this.$search.classList.remove('active');
};

Search.prototype.showSearch = function () {
  this.$search.classList.add('active');
};

Search.prototype.selectResult = function () {
  let $first = this.$searchResults.querySelector('li:first-child a');

  if ($first) {
    document.location = $first.getAttribute('href');
  }

  this.$searchBox.value = '';
  this.$searchBox.blur();
  this.displayResults([]);
  this.hideSearch();

  if (this._closeAfterSearch) {
    this.menu.hide();
  }
};

Search.prototype.displayResults = function (results) {
  if (results.length > 0) {
    this.$searchResults.classList.remove('no-results');

    let html = '<ul>';

    results.forEach(result => {
      let entry = result.entry;
      let id = entry.id;
      let cssClass = '';
      let text = '';

      if (entry.type === 'clause') {
        let number = entry.number ? entry.number + ' ' : '';
        text = number + entry.key;
        cssClass = 'clause';
        id = entry.id;
      } else if (entry.type === 'production') {
        text = entry.key;
        cssClass = 'prod';
        id = entry.id;
      } else if (entry.type === 'op') {
        text = entry.key;
        cssClass = 'op';
        id = entry.id || entry.refId;
      } else if (entry.type === 'term') {
        text = entry.key;
        cssClass = 'term';
        id = entry.id || entry.refId;
      }

      if (text) {
        // prettier-ignore
        html += `<li class=menu-search-result-${cssClass}><a href="${makeLinkToId(id)}">${text}</a></li>`;
      }
    });

    html += '</ul>';

    this.$searchResults.innerHTML = html;
  } else {
    this.$searchResults.innerHTML = '';
    this.$searchResults.classList.add('no-results');
  }
};

function Menu() {
  this.$toggle = document.getElementById('menu-toggle');
  this.$menu = document.getElementById('menu');
  this.$toc = document.querySelector('menu-toc > ol');
  this.$pins = document.querySelector('#menu-pins');
  this.$pinList = document.getElementById('menu-pins-list');
  this.$toc = document.querySelector('#menu-toc > ol');
  this.$specContainer = document.getElementById('spec-container');
  this.search = new Search(this);

  this._pinnedIds = {};
  this.loadPinEntries();

  // toggle menu
  this.$toggle.addEventListener('click', this.toggle.bind(this));

  // keydown events for pinned clauses
  document.addEventListener('keydown', this.documentKeydown.bind(this));

  // toc expansion
  let tocItems = this.$menu.querySelectorAll('#menu-toc li');
  for (let i = 0; i < tocItems.length; i++) {
    let $item = tocItems[i];
    $item.addEventListener('click', event => {
      $item.classList.toggle('active');
      event.stopPropagation();
    });
  }

  // close toc on toc item selection
  let tocLinks = this.$menu.querySelectorAll('#menu-toc li > a');
  for (let i = 0; i < tocLinks.length; i++) {
    let $link = tocLinks[i];
    $link.addEventListener('click', event => {
      this.toggle();
      event.stopPropagation();
    });
  }

  // update active clause on scroll
  window.addEventListener('scroll', debounce(this.updateActiveClause.bind(this)));
  this.updateActiveClause();

  // prevent menu scrolling from scrolling the body
  this.$toc.addEventListener('wheel', e => {
    let target = e.currentTarget;
    let offTop = e.deltaY < 0 && target.scrollTop === 0;
    if (offTop) {
      e.preventDefault();
    }
    let offBottom = e.deltaY > 0 && target.offsetHeight + target.scrollTop >= target.scrollHeight;

    if (offBottom) {
      e.preventDefault();
    }
  });
}

Menu.prototype.documentKeydown = function (e) {
  e.stopPropagation();
  if (e.keyCode === 80) {
    this.togglePinEntry();
  } else if (e.keyCode > 48 && e.keyCode < 58) {
    this.selectPin(e.keyCode - 49);
  }
};

Menu.prototype.updateActiveClause = function () {
  this.setActiveClause(findActiveClause(this.$specContainer));
};

Menu.prototype.setActiveClause = function (clause) {
  this.$activeClause = clause;
  this.revealInToc(this.$activeClause);
};

Menu.prototype.revealInToc = function (path) {
  let current = this.$toc.querySelectorAll('li.revealed');
  for (let i = 0; i < current.length; i++) {
    current[i].classList.remove('revealed');
    current[i].classList.remove('revealed-leaf');
  }

  current = this.$toc;
  let index = 0;
  outer: while (index < path.length) {
    let children = current.children;
    for (let i = 0; i < children.length; i++) {
      if ('#' + path[index].id === children[i].children[1].hash) {
        children[i].classList.add('revealed');
        if (index === path.length - 1) {
          children[i].classList.add('revealed-leaf');
          let rect = children[i].getBoundingClientRect();
          // this.$toc.getBoundingClientRect().top;
          let tocRect = this.$toc.getBoundingClientRect();
          if (rect.top + 10 > tocRect.bottom) {
            this.$toc.scrollTop =
              this.$toc.scrollTop + (rect.top - tocRect.bottom) + (rect.bottom - rect.top);
          } else if (rect.top < tocRect.top) {
            this.$toc.scrollTop = this.$toc.scrollTop - (tocRect.top - rect.top);
          }
        }
        current = children[i].querySelector('ol');
        index++;
        continue outer;
      }
    }
    console.log('could not find location in table of contents', path);
    break;
  }
};

function findActiveClause(root, path) {
  let clauses = getChildClauses(root);
  path = path || [];

  for (let $clause of clauses) {
    let rect = $clause.getBoundingClientRect();
    let $header = $clause.querySelector('h1');
    let marginTop = Math.max(
      parseInt(getComputedStyle($clause)['margin-top']),
      parseInt(getComputedStyle($header)['margin-top'])
    );

    if (rect.top - marginTop <= 1 && rect.bottom > 0) {
      return findActiveClause($clause, path.concat($clause)) || path;
    }
  }

  return path;
}

function* getChildClauses(root) {
  for (let el of root.children) {
    switch (el.nodeName) {
      // descend into <emu-import>
      case 'EMU-IMPORT':
        yield* getChildClauses(el);
        break;

      // accept <emu-clause>, <emu-intro>, and <emu-annex>
      case 'EMU-CLAUSE':
      case 'EMU-INTRO':
      case 'EMU-ANNEX':
        yield el;
    }
  }
}

Menu.prototype.toggle = function () {
  this.$menu.classList.toggle('active');
};

Menu.prototype.show = function () {
  this.$menu.classList.add('active');
};

Menu.prototype.hide = function () {
  this.$menu.classList.remove('active');
};

Menu.prototype.isVisible = function () {
  return this.$menu.classList.contains('active');
};

Menu.prototype.showPins = function () {
  this.$pins.classList.add('active');
};

Menu.prototype.hidePins = function () {
  this.$pins.classList.remove('active');
};

Menu.prototype.addPinEntry = function (id) {
  let entry = this.search.biblio.byId[id];
  if (!entry) {
    // id was deleted after pin (or something) so remove it
    delete this._pinnedIds[id];
    this.persistPinEntries();
    return;
  }

  if (entry.type === 'clause') {
    let prefix;
    if (entry.number) {
      prefix = entry.number + ' ';
    } else {
      prefix = '';
    }
    // prettier-ignore
    this.$pinList.innerHTML += `<li><a href="${makeLinkToId(entry.id)}">${prefix}${entry.titleHTML}</a></li>`;
  } else {
    this.$pinList.innerHTML += `<li><a href="${makeLinkToId(entry.id)}">${entry.key}</a></li>`;
  }

  if (Object.keys(this._pinnedIds).length === 0) {
    this.showPins();
  }
  this._pinnedIds[id] = true;
  this.persistPinEntries();
};

Menu.prototype.removePinEntry = function (id) {
  let item = this.$pinList.querySelector(`a[href="${makeLinkToId(id)}"]`).parentNode;
  this.$pinList.removeChild(item);
  delete this._pinnedIds[id];
  if (Object.keys(this._pinnedIds).length === 0) {
    this.hidePins();
  }

  this.persistPinEntries();
};

Menu.prototype.persistPinEntries = function () {
  try {
    if (!window.localStorage) return;
  } catch (e) {
    return;
  }

  localStorage.pinEntries = JSON.stringify(Object.keys(this._pinnedIds));
};

Menu.prototype.loadPinEntries = function () {
  try {
    if (!window.localStorage) return;
  } catch (e) {
    return;
  }

  let pinsString = window.localStorage.pinEntries;
  if (!pinsString) return;
  let pins = JSON.parse(pinsString);
  for (let i = 0; i < pins.length; i++) {
    this.addPinEntry(pins[i]);
  }
};

Menu.prototype.togglePinEntry = function (id) {
  if (!id) {
    id = this.$activeClause[this.$activeClause.length - 1].id;
  }

  if (this._pinnedIds[id]) {
    this.removePinEntry(id);
  } else {
    this.addPinEntry(id);
  }
};

Menu.prototype.selectPin = function (num) {
  document.location = this.$pinList.children[num].children[0].href;
};

let menu;
function init() {
  menu = new Menu();
  let $container = document.getElementById('spec-container');
  $container.addEventListener(
    'mouseover',
    debounce(e => {
      Toolbox.activateIfMouseOver(e);
    })
  );
  document.addEventListener(
    'keydown',
    debounce(e => {
      if (e.code === 'Escape' && Toolbox.active) {
        Toolbox.deactivate();
      }
    })
  );
}

document.addEventListener('DOMContentLoaded', init);

function debounce(fn, opts) {
  opts = opts || {};
  let timeout;
  return function (e) {
    if (opts.stopPropagation) {
      e.stopPropagation();
    }
    let args = arguments;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn.apply(this, args);
    }, 150);
  };
}

let CLAUSE_NODES = ['EMU-CLAUSE', 'EMU-INTRO', 'EMU-ANNEX'];
function findLocalReferences($elem) {
  let name = $elem.innerHTML;
  let references = [];

  let parentClause = $elem.parentNode;
  while (parentClause && CLAUSE_NODES.indexOf(parentClause.nodeName) === -1) {
    parentClause = parentClause.parentNode;
  }

  if (!parentClause) return;

  let vars = parentClause.querySelectorAll('var');

  for (let i = 0; i < vars.length; i++) {
    let $var = vars[i];

    if ($var.innerHTML === name) {
      references.push($var);
    }
  }

  return references;
}

function toggleFindLocalReferences($elem) {
  let references = findLocalReferences($elem);
  if ($elem.classList.contains('referenced')) {
    references.forEach($reference => {
      $reference.classList.remove('referenced');
    });
  } else {
    references.forEach($reference => {
      $reference.classList.add('referenced');
    });
  }
}

function installFindLocalReferences() {
  document.addEventListener('click', e => {
    if (e.target.nodeName === 'VAR') {
      toggleFindLocalReferences(e.target);
    }
  });
}

document.addEventListener('DOMContentLoaded', installFindLocalReferences);

// The following license applies to the fuzzysearch function
// The MIT License (MIT)
// Copyright © 2015 Nicolas Bevacqua
// Copyright © 2016 Brian Terlson
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
function fuzzysearch(searchString, haystack, caseInsensitive) {
  let tlen = haystack.length;
  let qlen = searchString.length;
  let chunks = 1;
  let finding = false;

  if (qlen > tlen) {
    return false;
  }

  if (qlen === tlen) {
    if (searchString === haystack) {
      return { caseMatch: true, chunks: 1, prefix: true };
    } else if (searchString.toLowerCase() === haystack.toLowerCase()) {
      return { caseMatch: false, chunks: 1, prefix: true };
    } else {
      return false;
    }
  }

  let j = 0;
  outer: for (let i = 0; i < qlen; i++) {
    let nch = searchString[i];
    while (j < tlen) {
      let targetChar = haystack[j++];
      if (targetChar === nch) {
        finding = true;
        continue outer;
      }
      if (finding) {
        chunks++;
        finding = false;
      }
    }

    if (caseInsensitive) {
      return false;
    }

    return fuzzysearch(searchString.toLowerCase(), haystack.toLowerCase(), true);
  }

  return { caseMatch: !caseInsensitive, chunks, prefix: j <= qlen };
}

let Toolbox = {
  init() {
    this.$outer = document.createElement('div');
    this.$outer.classList.add('toolbox-container');
    this.$container = document.createElement('div');
    this.$container.classList.add('toolbox');
    this.$outer.appendChild(this.$container);
    this.$permalink = document.createElement('a');
    this.$permalink.textContent = 'Permalink';
    this.$pinLink = document.createElement('a');
    this.$pinLink.textContent = 'Pin';
    this.$pinLink.setAttribute('href', '#');
    this.$pinLink.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      menu.togglePinEntry(this.entry.id);
    });

    this.$refsLink = document.createElement('a');
    this.$refsLink.setAttribute('href', '#');
    this.$refsLink.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      referencePane.showReferencesFor(this.entry);
    });
    this.$container.appendChild(this.$permalink);
    this.$container.appendChild(this.$pinLink);
    this.$container.appendChild(this.$refsLink);
    document.body.appendChild(this.$outer);
  },

  activate(el, entry, target) {
    if (el === this._activeEl) return;
    sdoBox.deactivate();
    this.active = true;
    this.entry = entry;
    this.$outer.classList.add('active');
    this.top = el.offsetTop - this.$outer.offsetHeight;
    this.left = el.offsetLeft - 10;
    this.$outer.setAttribute('style', 'left: ' + this.left + 'px; top: ' + this.top + 'px');
    this.updatePermalink();
    this.updateReferences();
    this._activeEl = el;
    if (this.top < document.body.scrollTop && el === target) {
      // don't scroll unless it's a small thing (< 200px)
      this.$outer.scrollIntoView();
    }
  },

  updatePermalink() {
    this.$permalink.setAttribute('href', makeLinkToId(this.entry.id));
  },

  updateReferences() {
    this.$refsLink.textContent = `References (${this.entry.referencingIds.length})`;
  },

  activateIfMouseOver(e) {
    let ref = this.findReferenceUnder(e.target);
    if (ref && (!this.active || e.pageY > this._activeEl.offsetTop)) {
      let entry = menu.search.biblio.byId[ref.id];
      this.activate(ref.element, entry, e.target);
    } else if (
      this.active &&
      (e.pageY < this.top || e.pageY > this._activeEl.offsetTop + this._activeEl.offsetHeight)
    ) {
      this.deactivate();
    }
  },

  findReferenceUnder(el) {
    while (el) {
      let parent = el.parentNode;
      if (el.nodeName === 'EMU-RHS' || el.nodeName === 'EMU-PRODUCTION') {
        return null;
      }
      if (
        el.nodeName === 'H1' &&
        parent.nodeName.match(/EMU-CLAUSE|EMU-ANNEX|EMU-INTRO/) &&
        parent.id
      ) {
        return { element: el, id: parent.id };
      } else if (el.nodeName === 'EMU-NT') {
        if (
          parent.nodeName === 'EMU-PRODUCTION' &&
          parent.id &&
          parent.id[0] !== '_' &&
          parent.firstElementChild === el
        ) {
          // return the LHS non-terminal element
          return { element: el, id: parent.id };
        }
        return null;
      } else if (
        el.nodeName.match(/EMU-(?!CLAUSE|XREF|ANNEX|INTRO)|DFN/) &&
        el.id &&
        el.id[0] !== '_'
      ) {
        if (
          el.nodeName === 'EMU-FIGURE' ||
          el.nodeName === 'EMU-TABLE' ||
          el.nodeName === 'EMU-EXAMPLE'
        ) {
          // return the figcaption element
          return { element: el.children[0].children[0], id: el.id };
        } else {
          return { element: el, id: el.id };
        }
      }
      el = parent;
    }
  },

  deactivate() {
    this.$outer.classList.remove('active');
    this._activeEl = null;
    this.active = false;
  },
};

let referencePane = {
  init() {
    this.$container = document.createElement('div');
    this.$container.setAttribute('id', 'references-pane-container');

    let $spacer = document.createElement('div');
    $spacer.setAttribute('id', 'references-pane-spacer');

    this.$pane = document.createElement('div');
    this.$pane.setAttribute('id', 'references-pane');

    this.$container.appendChild($spacer);
    this.$container.appendChild(this.$pane);

    this.$header = document.createElement('div');
    this.$header.classList.add('menu-pane-header');
    this.$headerText = document.createElement('span');
    this.$header.appendChild(this.$headerText);
    this.$headerRefId = document.createElement('a');
    this.$header.appendChild(this.$headerRefId);
    this.$closeButton = document.createElement('span');
    this.$closeButton.setAttribute('id', 'references-pane-close');
    this.$closeButton.addEventListener('click', () => {
      this.deactivate();
    });
    this.$header.appendChild(this.$closeButton);

    this.$pane.appendChild(this.$header);
    let tableContainer = document.createElement('div');
    tableContainer.setAttribute('id', 'references-pane-table-container');

    this.$table = document.createElement('table');
    this.$table.setAttribute('id', 'references-pane-table');

    this.$tableBody = this.$table.createTBody();

    tableContainer.appendChild(this.$table);
    this.$pane.appendChild(tableContainer);

    menu.$specContainer.appendChild(this.$container);
  },

  activate() {
    this.$container.classList.add('active');
  },

  deactivate() {
    this.$container.classList.remove('active');
    this.state = null;
  },

  showReferencesFor(entry) {
    this.activate();
    this.state = { type: 'ref', id: entry.id };
    this.$headerText.textContent = 'References to ';
    let newBody = document.createElement('tbody');
    let previousId;
    let previousCell;
    let dupCount = 0;
    this.$headerRefId.textContent = '#' + entry.id;
    this.$headerRefId.setAttribute('href', makeLinkToId(entry.id));
    this.$headerRefId.style.display = 'inline';
    entry.referencingIds
      .map(id => {
        let cid = menu.search.biblio.refParentClause[id];
        let clause = menu.search.biblio.byId[cid];
        if (clause == null) {
          throw new Error('could not find clause for id ' + cid);
        }
        return { id, clause };
      })
      .sort((a, b) => sortByClauseNumber(a.clause, b.clause))
      .forEach(record => {
        if (previousId === record.clause.id) {
          previousCell.innerHTML += ` (<a href="${makeLinkToId(record.id)}">${dupCount + 2}</a>)`;
          dupCount++;
        } else {
          let row = newBody.insertRow();
          let cell = row.insertCell();
          cell.innerHTML = record.clause.number;
          cell = row.insertCell();
          cell.innerHTML = `<a href="${makeLinkToId(record.id)}">${record.clause.titleHTML}</a>`;
          previousCell = cell;
          previousId = record.clause.id;
          dupCount = 0;
        }
      }, this);
    this.$table.removeChild(this.$tableBody);
    this.$tableBody = newBody;
    this.$table.appendChild(this.$tableBody);
  },

  showSDOs(sdos, alternativeId) {
    let rhs = document.getElementById(alternativeId);
    let parentName = rhs.parentNode.getAttribute('name');
    let colons = rhs.parentNode.querySelector('emu-geq');
    rhs = rhs.cloneNode(true);
    rhs.querySelectorAll('emu-params,emu-constraints').forEach(e => {
      e.remove();
    });
    rhs.querySelectorAll('[id]').forEach(e => {
      e.removeAttribute('id');
    });
    rhs.querySelectorAll('a').forEach(e => {
      e.parentNode.replaceChild(document.createTextNode(e.textContent), e);
    });

    // prettier-ignore
    this.$headerText.innerHTML = `Syntax-Directed Operations for<br><a href="${makeLinkToId(alternativeId)}" class="menu-pane-header-production"><emu-nt>${parentName}</emu-nt> ${colons.outerHTML} </a>`;
    this.$headerText.querySelector('a').append(rhs);
    this.showSDOsBody(sdos, alternativeId);
  },

  showSDOsBody(sdos, alternativeId) {
    this.activate();
    this.state = { type: 'sdo', id: alternativeId, html: this.$headerText.innerHTML };
    this.$headerRefId.style.display = 'none';
    let newBody = document.createElement('tbody');
    Object.keys(sdos).forEach(sdoName => {
      let pair = sdos[sdoName];
      let clause = pair.clause;
      let ids = pair.ids;
      let first = ids[0];
      let row = newBody.insertRow();
      let cell = row.insertCell();
      cell.innerHTML = clause;
      cell = row.insertCell();
      let html = '<a href="' + makeLinkToId(first) + '">' + sdoName + '</a>';
      for (let i = 1; i < ids.length; ++i) {
        html += ' (<a href="' + makeLinkToId(ids[i]) + '">' + (i + 1) + '</a>)';
      }
      cell.innerHTML = html;
    });
    this.$table.removeChild(this.$tableBody);
    this.$tableBody = newBody;
    this.$table.appendChild(this.$tableBody);
  },
};

function sortByClauseNumber(clause1, clause2) {
  let c1c = clause1.number.split('.');
  let c2c = clause2.number.split('.');

  for (let i = 0; i < c1c.length; i++) {
    if (i >= c2c.length) {
      return 1;
    }

    let c1 = c1c[i];
    let c2 = c2c[i];
    let c1cn = Number(c1);
    let c2cn = Number(c2);

    if (Number.isNaN(c1cn) && Number.isNaN(c2cn)) {
      if (c1 > c2) {
        return 1;
      } else if (c1 < c2) {
        return -1;
      }
    } else if (!Number.isNaN(c1cn) && Number.isNaN(c2cn)) {
      return -1;
    } else if (Number.isNaN(c1cn) && !Number.isNaN(c2cn)) {
      return 1;
    } else if (c1cn > c2cn) {
      return 1;
    } else if (c1cn < c2cn) {
      return -1;
    }
  }

  if (c1c.length === c2c.length) {
    return 0;
  }
  return -1;
}

function makeLinkToId(id) {
  let hash = '#' + id;
  if (typeof idToSection === 'undefined' || !idToSection[id]) {
    return hash;
  }
  let targetSec = idToSection[id];
  return (targetSec === 'index' ? './' : targetSec + '.html') + hash;
}

document.addEventListener('DOMContentLoaded', () => {
  Toolbox.init();
  referencePane.init();
});

'use strict';
let decimalBullet = Array.from({ length: 100 }, (a, i) => '' + (i + 1));
let alphaBullet = Array.from({ length: 26 }, (a, i) => String.fromCharCode('a'.charCodeAt(0) + i));

// prettier-ignore
let romanBullet = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv'];
// prettier-ignore
let bullets = [decimalBullet, alphaBullet, romanBullet, decimalBullet, alphaBullet, romanBullet];

function addStepNumberText(ol, parentIndex) {
  for (let i = 0; i < ol.children.length; ++i) {
    let child = ol.children[i];
    let index = parentIndex.concat([i]);
    let applicable = bullets[Math.min(index.length - 1, 5)];
    let span = document.createElement('span');
    span.textContent = (applicable[i] || '?') + '. ';
    span.style.fontSize = '0';
    span.setAttribute('aria-hidden', 'true');
    child.prepend(span);
    let sublist = child.querySelector('ol');
    if (sublist != null) {
      addStepNumberText(sublist, index);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('emu-alg > ol').forEach(ol => {
    addStepNumberText(ol, []);
  });
});

let sdoMap = JSON.parse(`{"prod-cQDX7f7E":{"BoundNames":{"clause":"8.1.1","ids":["prod-Yc3dQCIS"]},"BindingInitialization":{"clause":"8.5.2","ids":["prod-AUuPIcte"]}},"prod-l0m7C_i-":{"BoundNames":{"clause":"8.1.1","ids":["prod-0oRvH9Oa"]},"BindingInitialization":{"clause":"8.5.2","ids":["prod-mvAZKdLR"]},"StringValue":{"clause":"13.1.2","ids":["prod-ZpP1WoNY"]}},"prod-5cBn3SHb":{"BoundNames":{"clause":"8.1.1","ids":["prod-eP6tRBFI"]},"BindingInitialization":{"clause":"8.5.2","ids":["prod-SuKbQr-p"]},"StringValue":{"clause":"13.1.2","ids":["prod-fu2iq4OH"]}},"prod-10DUWE8d":{"BoundNames":{"clause":"8.1.1","ids":["prod-WhUrx1KG"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-jGNpgH6g"]}},"prod-FYQ2Ly4e":{"BoundNames":{"clause":"8.1.1","ids":["prod-pdmM8758"]}},"prod-l3Hg2UJ0":{"BoundNames":{"clause":"8.1.1","ids":["prod-SIbbs3t0"]}},"prod-FppJpMK8":{"BoundNames":{"clause":"8.1.1","ids":["prod-WfIK7IbR"]}},"prod-kqbqpKlK":{"BoundNames":{"clause":"8.1.1","ids":["prod-PvG06doO"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-HsuXutdb"]}},"prod-IeHby7A3":{"BoundNames":{"clause":"8.1.1","ids":["prod-TRoL9A8A"]}},"prod-MhsdViui":{"BoundNames":{"clause":"8.1.1","ids":["prod-uemJBnZk"]}},"prod-Zq1KBCx2":{"BoundNames":{"clause":"8.1.1","ids":["prod-HmBRwRUL"]},"BindingInitialization":{"clause":"8.5.2","ids":["prod-lV7YKS21"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-zkT2lhLy"]}},"prod-ZImPf3XQ":{"BoundNames":{"clause":"8.1.1","ids":["prod-VrgiRc7B"]},"BindingInitialization":{"clause":"8.5.2","ids":["prod--Bap0q1J","prod-qC471RM1"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-wtzT9EiN"]}},"prod-GTLtfjt0":{"BoundNames":{"clause":"8.1.1","ids":["prod-e52_ta72","prod-gapTHhxd"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-tsjeAqRc","prod--IC6X92I","prod-NrdrIJZT"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-h16qYz6B","prod-1FzGu7Lp"]}},"prod-ZEEMEcAo":{"BoundNames":{"clause":"8.1.1","ids":["prod-uQApgi98","prod-UADb9W1C"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-KgRoomIq","prod-jvZ0PZvK"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-rkwjGbA6","prod-J6x8FZJI"]}},"prod-TkJ_upuv":{"BoundNames":{"clause":"8.1.1","ids":["prod-hRHC-ltw"]},"PropertyBindingInitialization":{"clause":"14.3.3.1","ids":["prod-jhtKd-Y5"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-OZ7bBYfO"]}},"prod-QAGJVJ9v":{"BoundNames":{"clause":"8.1.1","ids":["prod-HS4vlt-j"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-JkWX9ITf"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-Pbu7NeJV"]}},"prod-eAKFkNTn":{"BoundNames":{"clause":"8.1.1","ids":["prod-C9gIgbxU"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-mMA3BDq4"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-l7kFOPKe"]}},"prod-VmvTFDAY":{"BoundNames":{"clause":"8.1.1","ids":["prod-MJIzQe4_"]},"PropertyBindingInitialization":{"clause":"14.3.3.1","ids":["prod-1euONYQ-"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-eeXd9umu"]}},"prod-8lbkfoVZ":{"BoundNames":{"clause":"8.1.1","ids":["prod-T0DsYQHz"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-SVSt7_f4"]},"KeyedBindingInitialization":{"clause":"14.3.3.3","ids":["prod-v4J727kL"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-4G21hRBK","prod-8U9yuoPy"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-0qUANoiw","prod-b6-qn4pg"]},"HasInitializer":{"clause":"15.1.4","ids":["prod-Qjr24iGe","prod-6kCXjXJH"]}},"prod-qY39_uPQ":{"BoundNames":{"clause":"8.1.1","ids":["prod-XX1yN-l7"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-m05a8O_b"]},"KeyedBindingInitialization":{"clause":"14.3.3.3","ids":["prod-kKvAd4Kx"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-1LlZEk6k"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-iu5DldfN","prod-qrNno2ET"]},"HasInitializer":{"clause":"15.1.4","ids":["prod-HBo05lrR","prod-3n6oU9Uv"]}},"prod-ygJ0cdk1":{"BoundNames":{"clause":"8.1.1","ids":["prod-Wj-eaJJJ"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-gowHZDoa"]},"ForDeclarationBindingInitialization":{"clause":"14.7.5.3","ids":["prod-S5lZ05os"]},"ForDeclarationBindingInstantiation":{"clause":"14.7.5.4","ids":["prod-bTiDTykL"]}},"prod-lEQdX6hk":{"BoundNames":{"clause":"8.1.1","ids":["prod-AAggAe5k"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-5tjiqCsV"]},"Contains":{"clause":"8.4.1","ids":["prod-JYruL-G6"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-mfAdULQi"]},"InstantiateOrdinaryFunctionObject":{"clause":"15.2.4","ids":["prod-oT86BVb2"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-cYRKXADu"]}},"prod-eqpHaG0r":{"BoundNames":{"clause":"8.1.1","ids":["prod-rmB8ZP2j"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-Fqj8pzpb"]},"Contains":{"clause":"8.4.1","ids":["prod-RYB8pT4v"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-f7nt2HkW"]},"InstantiateOrdinaryFunctionObject":{"clause":"15.2.4","ids":["prod-TjR6TGOd"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-fA8Y53Jv"]}},"prod-X0L442RA":{"BoundNames":{"clause":"8.1.1","ids":["prod-NuuiWZ7v"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-1uizUnEF"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-i4esWmfn"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-tfjykC09"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-X-TC2nAd"]}},"prod-aTWifksv":{"BoundNames":{"clause":"8.1.1","ids":["prod-po75ZBLy"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-uQ_NTpHd"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-ffwfOKFy"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-90MekD57"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod--tdGBtde"]}},"prod-7NFUmaIc":{"BoundNames":{"clause":"8.1.1","ids":["prod-dSRi9b3k"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-F7oEv_fM"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-Z488vACK"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-CdQEr4_m"]},"HasInitializer":{"clause":"15.1.4","ids":["prod-YlncCUel"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-2HGoRaSl"]}},"prod-K4CbCiCx":{"BoundNames":{"clause":"8.1.1","ids":["prod-B1jl1kwZ"]},"Contains":{"clause":"8.4.1","ids":["prod-CNqH7XEc"]},"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-F51qoUgS"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-l6d_kFqp"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-46y1StQq"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-2fYMCaig"]}},"prod-oJNsRhfl":{"BoundNames":{"clause":"8.1.1","ids":["prod-t6vQVPUG"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-FmAf4OGl"]},"Contains":{"clause":"8.4.1","ids":["prod-YglW_lFm"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-BE72OMfT"]},"InstantiateGeneratorFunctionObject":{"clause":"15.5.3","ids":["prod-x_w-E_WI"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-Uf4haGDs"]}},"prod-bWfHg6Xe":{"BoundNames":{"clause":"8.1.1","ids":["prod-qJNJRowC"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-2O3Y8NX3"]},"Contains":{"clause":"8.4.1","ids":["prod-hMB2st0D"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-9FriOUuY"]},"InstantiateGeneratorFunctionObject":{"clause":"15.5.3","ids":["prod-zyQVJwqE"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-7bSRnJkd"]}},"prod-cOKIJmRw":{"BoundNames":{"clause":"8.1.1","ids":["prod-D36uGDV1"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-wRhLbuAn"]},"Contains":{"clause":"8.4.1","ids":["prod-ow6TXQ_a"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-MBXIRXX3"]},"InstantiateAsyncGeneratorFunctionObject":{"clause":"15.6.3","ids":["prod-JvNVLw_7"]}},"prod-1L17zU6t":{"BoundNames":{"clause":"8.1.1","ids":["prod-Fiyc5-gj"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-_1WUvl3J"]},"Contains":{"clause":"8.4.1","ids":["prod-lLs4pRL8"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-0BnnuWOV"]},"InstantiateAsyncGeneratorFunctionObject":{"clause":"15.6.3","ids":["prod-G-CKcSEp"]}},"prod-kd27yk51":{"BoundNames":{"clause":"8.1.1","ids":["prod-_x3zvham"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-J5Ultzy7"]},"BindingClassDeclarationEvaluation":{"clause":"15.7.13","ids":["prod-JmEOsNvO"]}},"prod-bStNnwN_":{"BoundNames":{"clause":"8.1.1","ids":["prod-0u78ulHy"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-v6ZGEAMc"]},"BindingClassDeclarationEvaluation":{"clause":"15.7.13","ids":["prod-qOUNT0OA"]}},"prod-iAuKx0s9":{"BoundNames":{"clause":"8.1.1","ids":["prod-G-h1FrC4"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-w95osZOA"]},"Contains":{"clause":"8.4.1","ids":["prod-vPfDfZVz"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-cpVe0Sep"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-k_4DyjCo"]},"InstantiateAsyncFunctionObject":{"clause":"15.8.2","ids":["prod-VjNDNC25"]}},"prod-TaHP58mu":{"BoundNames":{"clause":"8.1.1","ids":["prod-NaC_U8xV"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-6nHiQ-2B"]},"Contains":{"clause":"8.4.1","ids":["prod-PDvYlV0q"]},"InstantiateFunctionObject":{"clause":"8.5.1","ids":["prod-g0-rNkU8"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-TdFyphFg"]},"InstantiateAsyncFunctionObject":{"clause":"15.8.2","ids":["prod-QVYl6PrK"]}},"prod-HT-vtkeW":{"BoundNames":{"clause":"8.1.1","ids":["prod-kRyJKqmR"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-bCpQszCG"]}},"prod-WzAgO-V_":{"BoundNames":{"clause":"8.1.1","ids":["prod-jZE2c8MZ"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-Fii3Jv-w"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod-4FL2ok6-"]}},"prod-CDGJVPkq":{"BoundNames":{"clause":"8.1.1","ids":["prod-me1fjwho"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod--ST7ch2j"]}},"prod-kEa0XgB6":{"BoundNames":{"clause":"8.1.1","ids":["prod-gnkPkMbr"]},"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-ejkMSdRd"]}},"prod-wyOKxI9w":{"BoundNames":{"clause":"8.1.1","ids":["prod-WTIt04mh"]},"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-0jSzNM4w"]}},"prod-SkqVKtrZ":{"BoundNames":{"clause":"8.1.1","ids":["prod-2q0gunUG"]},"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-Cg-QzVAj"]}},"prod-UCgvcMcb":{"BoundNames":{"clause":"8.1.1","ids":["prod-phtlO1Je"]},"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-nXrDLJR0"]}},"prod-Pd4rUvEL":{"BoundNames":{"clause":"8.1.1","ids":["prod-QscPeL5E"]},"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-Qq5Ok86W"]}},"prod-xWvkB_EQ":{"BoundNames":{"clause":"8.1.1","ids":["prod-OyREyUBO"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-w8mrwXF1"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-IxEr0QE9"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-ShgW98pi"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-V3c4HtRK"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-Upv45R4X"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-Pw78KQtD"]}},"prod---2Mdo2Q":{"BoundNames":{"clause":"8.1.1","ids":["prod-sOWb3AM5"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-mTdGbVUU"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-DEMJzdJ7"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-x1UQSoBl"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-OFghu2j_"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-VQKcYkbx"]}},"prod-w_WAVAwX":{"BoundNames":{"clause":"8.1.1","ids":["prod-wpPb0--4"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-cMreMYU5"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-vvvIsXz5"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-IJxf-Cdm"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-n6JkNQnf"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-vHJuGFG0"]}},"prod-60Xh0dpZ":{"BoundNames":{"clause":"8.1.1","ids":["prod-yl8Kvf8S"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-xsgJyOoQ"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-GV0VESxu"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-PahxJv8L"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-NjdAgwQZ"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-7BCAocpR"]}},"prod-bE4rfMak":{"BoundNames":{"clause":"8.1.1","ids":["prod-oqm8ado6"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-cRTDqnfl"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-VYqY45eE"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-Ltk1AbDn"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-iOoR-XLv"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-rg_YnEcS"]}},"prod-KPFnW3Lq":{"BoundNames":{"clause":"8.1.1","ids":["prod-pmSnaEkm"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-4yMGuqEs"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-bcC47tAa"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-kSrXZybF"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-BuNuTBV9"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-A54_tyTm"]}},"prod-GUPXSqcT":{"BoundNames":{"clause":"8.1.1","ids":["prod-fy8WSBrE"]},"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-K87ApD92"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-XTfiw-G1"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-GGFgV72D"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-tftEFTtX"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-fWfjxGVB"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-04PQQ9j2"]}},"prod-L8T23W53":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-g7IOVGn1"]}},"prod-CsuSm934":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-sN7udk5J"]}},"prod-Mj0BF5Ng":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-jjBSfSof"]}},"prod-_n4x_0B4":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-KvSTEPI7"]}},"prod-atbkfQ3e":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-kBBrFjaX"]}},"prod-DEQYio0_":{"DeclarationPart":{"clause":"8.1.2","ids":["prod-GAkiMJN6"]}},"prod-YHzPmgz1":{"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-Iol_vN-I"]}},"prod-G1Hf7gBn":{"IsConstantDeclaration":{"clause":"8.1.3","ids":["prod-xwFhJZXb"]}},"prod-30nvN6ck":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-mPEvRR9d"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-4f3fXSme"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod--ycd0kFi"]},"TopLevelLexicallyScopedDeclarations":{"clause":"8.1.9","ids":["prod-ZOlGIUjg"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-ie-RAx6L"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-ELUpDRIL"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-SpvJf5dZ"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-YsZID3li"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-eptReca1"]}},"prod--OFVjnjw":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-ZFtxhsq0"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-dqBS0eQw"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-ikslLJyV"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-r8z3UV58"]},"TopLevelLexicallyDeclaredNames":{"clause":"8.1.8","ids":["prod-s6Vb3QUL"]},"TopLevelLexicallyScopedDeclarations":{"clause":"8.1.9","ids":["prod-fSl8sbck"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-_Kx3fMtB"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-MxUpZ-t-"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-IG220ePF"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-v3tH_xWo"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-Vrq9L4TL"]}},"prod-EQzE7F8u":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-Rrf-OST4"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-MlufDCPG"]},"TopLevelLexicallyDeclaredNames":{"clause":"8.1.8","ids":["prod-DWksqgz-"]},"TopLevelLexicallyScopedDeclarations":{"clause":"8.1.9","ids":["prod-68OgfJw9"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-CxIyq9Kn"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-wmlLZdyg"]}},"prod-GRF71K6E":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-9AEMspNg"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-IYBZJ2CF"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-mb72lTih"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-zHpAsUUQ"]},"TopLevelLexicallyDeclaredNames":{"clause":"8.1.8","ids":["prod-ReRATT6e"]},"TopLevelLexicallyScopedDeclarations":{"clause":"8.1.9","ids":["prod--BAI6AhR"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-l-2kGEcB"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-OvMm0IpZ"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-OH037R2P"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-ndTQ-Fse"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-QrxFmsVC"]}},"prod-q66ZlOHI":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod--_BgAjEq"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-bhogjJ1W"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-DTgBd2wQ"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-BX82yRxg"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-8Uz0YNaN"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-MxUCmZej"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-wESl6-va"]},"CaseBlockEvaluation":{"clause":"14.12.2","ids":["prod--oXyocga","prod-n6COrqbY"]}},"prod-JuWwIrcZ":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-mSnfTK7z"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-am_Z4H66"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-e2BPI-N_"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-aW8QiumN"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-UcaBQzki"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-a3dtTxDp"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-L1SF9WLb"]},"CaseBlockEvaluation":{"clause":"14.12.2","ids":["prod-bc5B_Aaw"]}},"prod-sjZo1Z65":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-7Gkp_Ikd"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-LxvbRJKF"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-_zisH9m7"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-nuKGUlOU"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-yJHneCFO"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-mWAyGNz1"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-Mf-FlzJR"]}},"prod-A-5Q_6I5":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-LyDmmUT5"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-tORmzQQv"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-Gdv5Uzyo"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-mzP2If-y"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-YbPvJc_D"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-xKDcEL_e"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-YLBmIA_U"]}},"prod-HPF3iA_C":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-JWPhP_ev"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-84xBBiJA"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-ocDhl-eB"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-ZPHZRUV6"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-__iQJPEb"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-WyF-LUeK"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-ycWJ_ozd"]}},"prod-0GG8m5VC":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-BptUBlCG"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-V7zVpmtw"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-xypmC2Rc"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-i-A4iWeY"]},"TopLevelLexicallyDeclaredNames":{"clause":"8.1.8","ids":["prod-vPjzf01U"]},"TopLevelLexicallyScopedDeclarations":{"clause":"8.1.9","ids":["prod-VoYdAOt3"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-gviukyGv"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-sPvwm3DB"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-UiQoMdIo"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-zsR5iLZH"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-8au0KFQe"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-GnWrgP5w"]}},"prod-ZdaBUa3q":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-FwgSl19M"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-3Vc5meav"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-jtk1iKc9"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-h55yOiCC"]}},"prod-9bKQMexM":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-_jhHTL9Z"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-nL_6JlM9"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-TKnUh23n"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-ntkJlgei"]},"TopLevelVarDeclaredNames":{"clause":"8.1.10","ids":["prod-5RFYGz0t"]},"TopLevelVarScopedDeclarations":{"clause":"8.1.11","ids":["prod-aZ77pE36"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-j-zK1vJK"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-Mu3VhVjD"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-I9dzHyBf"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-3whCJM4e"]}},"prod-jJULW0Hz":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-8YrmfaA1","prod-yRWpcHmG"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-gtaAB-x7","prod-aKFk9Ijn"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-ic6_wi6x","prod-Fovz-BpD"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-vvqmH-2l","prod-x8eD4P1T"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-cn79vCHf"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-fN52Tgzf"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-zb1__ND8"]}},"prod-UOsd7muB":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-2xZloP4O"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-4B0l6Nwq"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-kKbHUs1e"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-UWG_9qGM"]},"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-ph5_rCcA"]},"ConciseBodyContainsUseStrict":{"clause":"15.3.2","ids":["prod-paSxtgKv"]},"EvaluateConciseBody":{"clause":"15.3.3","ids":["prod-WWzcef1e"]}},"prod-Dfs5WPuP":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-tdMR5_9c"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-0qrVz5hX"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-IDrLWHWU"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-VllrABp8"]},"EvaluateBody":{"clause":"10.2.1.3","ids":["prod--uh40sBe"]},"AsyncConciseBodyContainsUseStrict":{"clause":"15.9.2","ids":["prod-ua51hPgJ"]},"EvaluateAsyncConciseBody":{"clause":"15.9.3","ids":["prod-NeT6IfHf"]}},"prod-he3lY70e":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-m6bh3GpA"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-1WkoNRM_"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-_GPKA3Cb"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-MCeJZE_U"]}},"prod-GXF21Ewo":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-t-OtLQL7"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-rZF3AogZ"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-WMKjW5iz"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-oVpqQZka"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-FlDPQVjo"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-gDhjMfCK"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-9GocAvXy"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-9OD1gHQa"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod-8cqfbQ1C"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-hxF0P9sA"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-Td0h-qi5"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-paVpIqc4"]}},"prod-0vrrEsBm":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-vXiSx9wh"]},"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-zqmuSkfM"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-lGybrnks"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-TBDbISuB"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-hjcOowKc"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-T8hjI_vu"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-GeitVMt4"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-_KDGI2fs"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-HgfJHgi9"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-lSM0kaNt"]}},"prod-WCJmhvY4":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-v-PqD2SJ"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-5uRXjJj7"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-f75VYPkN"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-OcbYq9se"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-SLqg0yKr"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-JQIpAjs-"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod-haUIYXQl"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-ebSwvFft"]}},"prod-jXCkpXv4":{"LexicallyDeclaredNames":{"clause":"8.1.4","ids":["prod-XYalkd2A"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-pGkooQP4"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod-hUPyQqYi"]},"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-ExniQRjB"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-TCq0u4jM"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-TW56DY7O"]}},"prod-J1Dzjg4f":{"LexicallyScopedDeclarations":{"clause":"8.1.5","ids":["prod-eWnfpwM7"]},"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-YneO94W1"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-g_wYfia1"]},"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-KwkKYyRj"]},"ImportEntries":{"clause":"16.2.2.2","ids":["prod-65kV3a3C"]},"ExportEntries":{"clause":"16.2.3.4","ids":["prod-VtH9KIhP"]}},"prod-tLSm97IT":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-TvRo0Jzz"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-CXBIcQtz"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-X3W5RktU"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-T0wQwLQ_"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-NBGwhRuE"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-E9WZy4XN"]}},"prod--E29oaLq":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-x3WiVh1X"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-4cf8z78V"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-tPl3NUyn"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-kUTRcwOP"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-E6M7T9Em"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-JaqknT0A"]}},"prod-3eO1A4mA":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-cXTIOEn1"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-UIiAeivR"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-5amcoTln"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-LpKI1NOa"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-OTAMsoQb"]}},"prod-1mMhFDto":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-PhLm_cqX"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-R2NCFAfM"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-SRoeq51F"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-V2tQVOUI"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-7zXkEnhZ"]}},"prod-bep3gsuf":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-bMjWoX52"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-8C3zNXp6"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-sjee5Pog"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-s5sTXkkT"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-jJUZqLJS"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-P_sTorcs"]}},"prod-3chu9X3V":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-OPyZZ0FU"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-QgvbQ6qN"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-iv3GJbNA"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-CeDAPMUu"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-BNxhQmvf"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-UhENwxgv"]}},"prod-5Kl0FUSw":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-6wmxzhRC"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-nkERSk1r"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-VdiHdMbL"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-81RguExk"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-B3-Yz0aF"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-TbDRWisB"]}},"prod-03w8p9mr":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-_o07UyGN"]}},"prod-_lf1EvXT":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-5Ab4YMrd"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-B7KHfByo"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-iIi7e4Mv"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-OZMT2LO1"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-MYTRO2yV"]}},"prod--e2u-nCd":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-Jj9iNkQT"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-yyIeKAQ3"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-M7d89bkQ"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-kiVPWNCJ"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-idT2m0fR"]}},"prod-9vnoeXX4":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-MQNHAeo7"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-QkEPe1CC"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-CSwsyonC"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-JiuempzE"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-1k-PvIQ6"]},"DoWhileLoopEvaluation":{"clause":"14.7.2.2","ids":["prod-3uzJdijq"]}},"prod-Tx40AFG0":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-6MiGg7LY"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-jrq4eHFJ"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-UWs53aWN"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-NfepJ8d-"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-nqE7jDen"]},"WhileLoopEvaluation":{"clause":"14.7.3.2","ids":["prod-0mdwhc7l"]}},"prod-NvPgd2yM":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-22bMsY8a"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-5lKKTAkN"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-GgLrXaaO"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-_bYykgU2"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-sdOZ0OVe"]},"ForLoopEvaluation":{"clause":"14.7.4.2","ids":["prod-qUCVnDNm"]}},"prod-pYXfSJG_":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-iNfrCk_F"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-13ohOiCm"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-di1-cm7_"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-0RGYYYa8"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-38R1spHk"]},"ForLoopEvaluation":{"clause":"14.7.4.2","ids":["prod-HwfL-Win"]}},"prod-0Y0bZAvD":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-N2GkbzwH"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-eqKiNSk1"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-zOnkGPoB"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-gRSHgUm2"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-GQ9tF3ug"]},"ForLoopEvaluation":{"clause":"14.7.4.2","ids":["prod-PMtIFugG"]}},"prod-Za8VIr4f":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-polenv5I"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-KgxDtGf4"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-rNKuYq6q"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-mui4tXHs"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-ilROtw6r"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-dhS3iRZF"]}},"prod-xutvwaXc":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-cQmWs6F4"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-AWnFzjE8"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-zBPUdTbl"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-xkRBC0p_"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-mKAcS051"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-zcGoySgU"]}},"prod-nLtPS4oB":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-6rXrz7RR"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-5TY9-yea"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-zoCqTANq"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-3FISwBIz"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-MPaED8xy"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-xXfkt6k0"]}},"prod-EoyoF5LI":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-LH0otfP0"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-t9Ps-Sf3"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-dRwtb2-L"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-0EPuBRtw"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-G_08fu0g"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-OIo-GNlm"]}},"prod-ReDwT2-b":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-UE8msfiB"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-IEEeV8La"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-kCZrLuMF"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-bxXqpHGf"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-xuMzWdW7"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-Z4scLosS"]}},"prod-jY1gwM9V":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-Xl42xW5D"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-WOgH08rb"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-SKvXy5l6"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-eDdhr4db"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-Ii0_W2zX"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-KdWnMB6i"]}},"prod-_N8Q-kim":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-eiN5tOgj"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-SyVO6l8T"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-jKYdRg__"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-tYmMbbAK"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-RXKTOvxD"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-A6rVBZNm"]}},"prod-M1zjKbr6":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-dkeW5WMH"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-o2HaUKnD"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-zqf8dZti"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-3UTSN7Q_"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-SLsBgk8L"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-pPrWP7Ph"]}},"prod-ut_uoPzp":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-dXd3oD1j"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-kZcYMT8d"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-1mQl-EgZ"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-DVohExfz"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-xVs7Y4Vv"]},"ForInOfLoopEvaluation":{"clause":"14.7.5.5","ids":["prod-5PDN6AV3"]}},"prod-3HlNX-pI":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-kf6BzwpI"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-otI6GMSS"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-92qu0ILT"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-wq9kNHey"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-qti0YV4g"]}},"prod-3xRnqKfC":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-lB_U5kUv"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-FjNXiCI7"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-OMSfPp_0"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-zEFnXzdo"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-yGASkGus"]}},"prod-wD-TPYub":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-K6wLfAiN"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-RhYCwWQZ"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-iFqlj7Lz"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-Yr89pOXp"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-bHqvfllk"]}},"prod-EYIEedje":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-naQihl7z"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-0GInHInm"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-DkNjzLGB"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-3_4iLynl"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-MPDlN7RI"]}},"prod-cfkI0NCS":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-F1kslF5t"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-pi8GJ951"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-Aa8IOm4z"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-KaiFSIRm"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-fYVcY74b"]}},"prod-IbvHsEaf":{"VarDeclaredNames":{"clause":"8.1.6","ids":["prod-1jr14zqX"]},"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-H8Sf_rsN"]},"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-K0PcnMLw"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-_CFhQEhr"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-WfIkG4rU"]},"CatchClauseEvaluation":{"clause":"14.15.2","ids":["prod-tivA4mFO"]}},"prod-b7kFpx81":{"VarScopedDeclarations":{"clause":"8.1.7","ids":["prod-r4VwMPwM"]}},"prod-zzZIrcve":{"ContainsDuplicateLabels":{"clause":"8.2.1","ids":["prod-5segouA8"]},"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-fZ1-o-5P"]},"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-HhlDWDz1"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-nGqcJdt_"]}},"prod-Jyx4vreG":{"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-YN_w7WcD"]}},"prod-_aoH2Ltk":{"ContainsUndefinedBreakTarget":{"clause":"8.2.2","ids":["prod-sVlKX7KO"]}},"prod-00LpqzuX":{"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-PptGj0zd"]},"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-pR7DNQsN"]}},"prod-rfM2mnQY":{"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-P3ParQAP"]}},"prod-w6m19zWs":{"ContainsUndefinedContinueTarget":{"clause":"8.2.3","ids":["prod-ngwxJt1P"]}},"prod-Lu7YZ_Gz":{"HasName":{"clause":"8.3.1","ids":["prod-sGIyUYN_"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Xr5TwVeJ"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-nAbs7Q-f"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-mytcbPJI"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-sMvtbPMk"]}},"prod--zvLR38c":{"HasName":{"clause":"8.3.1","ids":["prod-lYeq4upI","prod-M26qeGCy"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ZCX-L7VJ"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-pLzR2hGq"]},"Contains":{"clause":"8.4.1","ids":["prod-Jc3hxjyv"]},"InstantiateOrdinaryFunctionExpression":{"clause":"15.2.5","ids":["prod-M2Odxhb_","prod-ZT_oXgSx"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-DKZGJMJp"]}},"prod-haubt72j":{"HasName":{"clause":"8.3.1","ids":["prod-yNYR71Xj","prod-_5BKcJSD"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-mP4b69Ye"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod--NqycDNV"]},"Contains":{"clause":"8.4.1","ids":["prod-5B9biisJ"]},"InstantiateGeneratorFunctionExpression":{"clause":"15.5.4","ids":["prod-FnOrbSnb","prod-sxTe1ywL"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-RyrSiZbO"]}},"prod-s18yr2Ij":{"HasName":{"clause":"8.3.1","ids":["prod--vrKJ_CQ","prod-2Vz4PDlE"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-o3PaoPru"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-2hHyfg58"]},"Contains":{"clause":"8.4.1","ids":["prod-_doZ_xN0"]},"InstantiateAsyncGeneratorFunctionExpression":{"clause":"15.6.4","ids":["prod-A3m5kV04","prod-7PTlQqLp"]}},"prod-LFCRNt3l":{"HasName":{"clause":"8.3.1","ids":["prod-8SfxZRyk","prod-OXrRSTMk"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-3ftZlYCP"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-WZTY8BeC"]},"Contains":{"clause":"8.4.1","ids":["prod-0p21L8en"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-6Zw1EmQC","prod-nEJuWHii"]},"InstantiateAsyncFunctionExpression":{"clause":"15.8.3","ids":["prod-3RN98Vrc","prod-iEhgnbem"]}},"prod-AtXUMYu3":{"HasName":{"clause":"8.3.1","ids":["prod-yzK8_iQh"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-2_XE6Qur"]},"Contains":{"clause":"8.4.1","ids":["prod-o1L20JNH"]},"InstantiateArrowFunctionExpression":{"clause":"15.3.4","ids":["prod-C8uAwDLj"]}},"prod-YIoJOc1p":{"HasName":{"clause":"8.3.1","ids":["prod-WTqF0fRI"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-acGpB7So"]},"Contains":{"clause":"8.4.1","ids":["prod-hmHHRRG6"]},"InstantiateAsyncArrowFunctionExpression":{"clause":"15.9.4","ids":["prod-kBFLOl9Q"]}},"prod-WTX_aban":{"HasName":{"clause":"8.3.1","ids":["prod-Wvi-SSNj"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-AntIZd-c"]},"Contains":{"clause":"8.4.1","ids":["prod-0dGKszgN"]},"InstantiateAsyncArrowFunctionExpression":{"clause":"15.9.4","ids":["prod-YQv2CZBp"]}},"prod-Vthx67sj":{"HasName":{"clause":"8.3.1","ids":["prod-_uck0Y8U","prod-IuRXWsQe"]},"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-nQpbEu0v"]},"NamedEvaluation":{"clause":"8.3.5","ids":["prod-_NxRxZOJ"]}},"prod-Joc9-5i9":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-og13oFFN"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-JN8cu1mT"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-n7xyt9Uq"]}},"prod-WzC_-Tli":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-pnNZChTM"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-ztGhnTck"]}},"prod-kFKvlIew":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-XEikQQGc"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-NBAafh2L"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-FYG1zcQs"]}},"prod-izgqBKzQ":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-wyk8qHUC"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-jZlT8Bef"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-jL-uFKFZ"]}},"prod-rL0KzAka":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ITCaMx3s"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-bDA2HTuE"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-qSA3mL7y"]}},"prod-l_l2o01x":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Q2nhWNO_"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-jR1Utmsf"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-byz46S5D"]}},"prod-ScOzt1wW":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-iMjjH1kL"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-CUNEQPp0"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-iQVGoPgT"]}},"prod-IScPEVPu":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-z2eYriJH"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod--KgzMgsO"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-Z77CzX6A"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-nfrnC2qv"]}},"prod-BTxM7XK0":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-v71UqLpH"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-CwZtsPgL"]},"Contains":{"clause":"8.4.1","ids":["prod-mlsPerHg"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-fBP_qjj3"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-pVCOt4bB"]}},"prod-hF7lIb25":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-mDSr9u1p"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-MPSxl2zi"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-A3Jt723U"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-IOJOqU1K"]}},"prod-CbDen9pR":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-YGwVcrrX"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-ho2yxuiE"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-u_EHmedU"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-ju7bhK7a"]}},"prod-ROYaXrl2":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Kbec_67R"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-LISRqOgO"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-XukR8W1f"]}},"prod-BRZkuqi1":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-b4gkKBW4"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-zcFyOLGC"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-AM7YtKeO"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-vPeih5lN"]}},"prod-20SfjmEZ":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-lY5Cy7Sa"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-2i2KMoZq"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-Ca71SmWs"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-IWE0dD8s"]},"AllPrivateIdentifiersValid":{"clause":"15.7.7","ids":["prod-hH1hyF7o"]}},"prod-NMg_0YQR":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-iarxBSr7"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-ELtmHyea"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-cHsc8BCy"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-fNvFZX0j"]}},"prod-RmIHX089":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-N8pxX1Sd"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-xF2zhbkz"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-ag9Jf7uA"]}},"prod-hKgp5YBB":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-0oosxnZc"]},"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-cJUP0nVQ"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-GfYjfQgH"]},"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-QtossHb7"]}},"prod-w05b3u14":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Vmis9Cmj"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-EEgk-Yff"]}},"prod-ij__hpSO":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Ou259nvv"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-RKIk04i1"]}},"prod-qnUAnDpi":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-TCON8m02"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-hxMCs-2O"]}},"prod-an6Vm9J4":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-pFhFynwZ"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-YQ2Qj3z4"]}},"prod-n3f1x4OA":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-0dgjtiQ7"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-JRAAw485"]}},"prod-bEnaiUfM":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-9gYsYykc"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-L28J0B-W"]}},"prod-oOmRMvU8":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ol3I6Y7A"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-_pp9tysE"]}},"prod-55Xz_E0Z":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Csq5hMXB"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-vWffOcNW"]}},"prod-yxAmCDj1":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod--Zmi0P07"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-mkCLwyla"]}},"prod-nw8eIftf":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-QujNq09F"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-vQJ1qlPd"]}},"prod-4lEraLTO":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-BcCJ4AWM"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-2t1vDiwJ"]}},"prod-nl8w2g65":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-OilJQSvS"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ba17c3GF"]}},"prod-EEr7dA-y":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-jkAKpcKK"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-zzL8pmfg"]}},"prod-D9vYTSYe":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ycvianKq"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-8czRO4ZP"]}},"prod--RZPkEex":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod--l26TQ9y"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ORYKa--f"]}},"prod-XorHFOnH":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-jEr8YSqe"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-oZVlZzKh"]}},"prod-fBlf7SId":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-q04_MZWd"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-je3cRB7F"]}},"prod--QVo0NY2":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-1-75ya8a"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-SgrZC9mm"]}},"prod-VbX7s-GB":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-JHagwt8S"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-SrzEhL0f"]}},"prod-KibMHocH":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-_TEzVLPJ"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ZtojqFO1"]}},"prod-W1sKvRa9":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-WH_Xpcdf"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-oCA1ZhR8"]}},"prod-H5jP53q2":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-CcYM3Atg"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-F2jVn7Gn"]}},"prod-g28T6iwt":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-24rx6YNr"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-1_mlatk2"]}},"prod-abEstsgg":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-r0l0CEXN"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-V44oc_oI"]}},"prod-8_yvvfCY":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-3O9Aii8g"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-I3ilBqyQ"]}},"prod-UHCaQLr6":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ryf2K57J"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-9wMtfL2T"]}},"prod-J7HEcFq2":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-kpZwfqRO"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-pkhka4W_"]}},"prod-ugTHi1aM":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-TnQABgBJ"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-zJL_pZsv"]}},"prod-6Ta8WxmN":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-RsN8Nsde"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-H08KK39f"]}},"prod-wrUN23HO":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-yP2rVm0A"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ZtMQjV14"]}},"prod-9YKtCpIQ":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-acZRdH_C"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-b8QyJMjt"]}},"prod-AgJdAkQg":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-FwH99KM9"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-E016H1hu"]}},"prod-vZbQbZtn":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-FOQIZ2Ww"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-pL4CmROv"]}},"prod-ACEMYh2d":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-0Mz2aish"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-9euGX5p6"]}},"prod-au86anjM":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-KPaiyU4J"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-CUQk8yb8"]}},"prod-mR1mZxSc":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-CMdoN6cr"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod--rPEOl_h"]}},"prod-R8ryvMfV":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-rzpmPN5D"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-qtkSJIt3"]}},"prod-eXKFjh2J":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-F_LSmUck"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod--dpqOTdc"]}},"prod-shfKC2mw":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-t02tAu6_"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-DZjLGTZE"]}},"prod-hQLdzapj":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-jgF9l9Ty"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-7LWIIJBX"]}},"prod-w-48XpMo":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-U8uU_bab"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-Bj3Q77v8"]}},"prod-7NM9KEaO":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-ooZHsevq"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-Lo8Q8Acu"]}},"prod-lT8vYmn_":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-1V2XVvzG"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-PrI2fhmx"]}},"prod-Z4PEVU4t":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Gi9vUOcN"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-SmIedoOa"]}},"prod-_eOvXLbd":{"IsFunctionDefinition":{"clause":"8.3.2","ids":["prod-Xvt3pq-p"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ovlJaju5"]}},"prod-2GG08dnr":{"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-qDGWvs6X"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ERpBYrCG"]}},"prod-BjlPLEoy":{"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-s_EYcmqv"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-8X4gnT8X"]}},"prod-qRYwqON3":{"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-ol9pQ3OI"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-yT2Snepb"]}},"prod-4f1krUyY":{"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-6S4OZBnv"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-fwZnfA7O"]}},"prod-Hseyu0a-":{"IsIdentifierRef":{"clause":"8.3.4","ids":["prod-oszQ0h58"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-ZxMoVw8b"]}},"prod-m5AWMC3P":{"NamedEvaluation":{"clause":"8.3.5","ids":["prod-Q_6y5mca"]}},"prod-mIr25y7h":{"Contains":{"clause":"8.4.1","ids":["prod-cKFrJVUo"]},"ClassDefinitionEvaluation":{"clause":"15.7.12","ids":["prod-AcPtObVs"]}},"prod-HvcUscDA":{"Contains":{"clause":"8.4.1","ids":["prod-bGWft0ts"]}},"prod-JP-jcLhQ":{"Contains":{"clause":"8.4.1","ids":["prod-wul2dpOd"]},"PropName":{"clause":"8.5.5","ids":["prod-u_yMpuq5"]}},"prod-6y-_egWQ":{"Contains":{"clause":"8.4.1","ids":["prod-GysYUEUH"]}},"prod-EOA2Fe3-":{"Contains":{"clause":"8.4.1","ids":["prod-uIhOYzuO"]},"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-H084cqoS"]}},"prod-JoCAeM_3":{"Contains":{"clause":"8.4.1","ids":["prod-Aeadd-iM"]},"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-9T4kB2jq"]}},"prod-25V7_u74":{"Contains":{"clause":"8.4.1","ids":["prod-o08cCHMJ"]},"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-Il7WrbnC"]}},"prod-N_V61Gw7":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-KBlapLw6"]},"IsComputedPropertyKey":{"clause":"13.2.5.2","ids":["prod-SPDqK5VR"]}},"prod-cSnpDCEZ":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-pgiwn-A8"]},"IsComputedPropertyKey":{"clause":"13.2.5.2","ids":["prod-SOs-1o2b"]}},"prod-BMcTBp4V":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-ZS17eYsY"]},"PropName":{"clause":"8.5.5","ids":["prod-CpdLYUt9"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-e_nTaPgZ"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-IjiMaa22"]},"SpecialMethod":{"clause":"15.4.3","ids":["prod-pvkrotoO"]},"DefineMethod":{"clause":"15.4.4","ids":["prod-VntM4j0E"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-w_uDCOXP"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-pxy6kYq7"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-6Kc2wh10"]}},"prod-SnKN_cew":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-vyebD6Jr"]},"PropName":{"clause":"8.5.5","ids":["prod-5q0xQjd1"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-XKslkIFw"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-DQeOw0IT"]},"SpecialMethod":{"clause":"15.4.3","ids":["prod-wnqbOfrS"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-JtMhObe9"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-axmlrr3F"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-9ZjrMW3N"]}},"prod-nWs7csn9":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-49ueHbo6"]},"PropName":{"clause":"8.5.5","ids":["prod-Pj7-Oy-Q"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-vg8SP62w"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-H05PoHaH"]},"SpecialMethod":{"clause":"15.4.3","ids":["prod-9m8VG-FD"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-tr90svxc"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-9-TzGQnW"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-WPITwaqC"]}},"prod-8GV2khgE":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-clQ5cW-v"]},"PropName":{"clause":"8.5.5","ids":["prod-zA_cSICS"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-RXHnqwjm"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-u4Tk9i08"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-qDk-XFAF"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-Qvq1cmEs"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-6uQ7SWxA"]}},"prod-ceV74b-L":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-7J1puDuJ"]},"PropName":{"clause":"8.5.5","ids":["prod-kfKLLmSB"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-OIPdt-RM"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-OGEtsTHJ"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-lPECR135"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-1nK7U43p"]}},"prod-sKhHHXFQ":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-w3-p5Y-S"]},"ConstructorMethod":{"clause":"15.7.3","ids":["prod-6CQGn2J9"]},"NonConstructorElements":{"clause":"15.7.5","ids":["prod-ax67ii0j"]},"PrototypePropertyNameList":{"clause":"15.7.6","ids":["prod-yD4OjNLB"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-PTQtTdvS"]}},"prod-0Xskgzt4":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-uyqDiD0W"]},"PropName":{"clause":"8.5.5","ids":["prod-eIc0iw1U"]},"ClassElementKind":{"clause":"15.7.2","ids":["prod-U_NLPgRJ"]},"IsStatic":{"clause":"15.7.4","ids":["prod-LP0OJ3qJ"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-dExs5jCW"]},"ClassElementEvaluation":{"clause":"15.7.11","ids":["prod-V88LvFxI"]}},"prod-80co-gZ6":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-yQr72pM_"]},"PropName":{"clause":"8.5.5","ids":["prod-cOwxJsMP"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-GXZeEgu_"]},"HasDirectSuper":{"clause":"15.4.2","ids":["prod-p8Pkhz62"]},"MethodDefinitionEvaluation":{"clause":"15.4.5","ids":["prod-a75_jVUN"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-zTa8Ph70"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-UU7zbVYJ"]}},"prod-qdC94hXo":{"ComputedPropertyContains":{"clause":"8.4.2","ids":["prod-s8Rlgqlc"]},"PropName":{"clause":"8.5.5","ids":["prod-NW7fjJTs"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-QQ9gR7rA"]},"ClassFieldDefinitionEvaluation":{"clause":"15.7.10","ids":["prod-deOh_-BS"]}},"prod-XzywOrpN":{"BindingInitialization":{"clause":"8.5.2","ids":["prod-D4AQahDE"]}},"prod-0Q02W-YD":{"BindingInitialization":{"clause":"8.5.2","ids":["prod-5QoB3lmK"]}},"prod-xrMoI6uo":{"BindingInitialization":{"clause":"8.5.2","ids":["prod-LZltxEP-"]}},"prod-5lmgiaFr":{"BindingInitialization":{"clause":"8.5.2","ids":["prod-PoaYdJZS"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-6b4rrD_8"]}},"prod-0fOwNHr-":{"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-evgdYCB8"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-NXTQAWlJ"]}},"prod-iBHkClE5":{"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-QEcf_4fA"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-TzoSXJM8"]}},"prod-C8khN6EK":{"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-D3j0ZmD-"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-4Zv7nEzD"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-suhNtUzj"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-u-Q5LrzT"]}},"prod-cDxY5q2J":{"IteratorBindingInitialization":{"clause":"8.5.3","ids":["prod-1SN5A2Ci"]},"ContainsExpression":{"clause":"15.1.2","ids":["prod-gFcfnGJu"]},"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-qGPu4-Bq"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-df9_W4vY"]}},"prod-9ZnfnUjq":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-RnnOsVyV"]},"ContainsArguments":{"clause":"15.7.9","ids":["prod-K0gmEtvp"]}},"prod-_cQ4k55E":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-HKn--kBw"]},"StringValue":{"clause":"13.1.2","ids":["prod-TEe-WTI-"]}},"prod-9S1STxNS":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-k_mlYmkW"]},"StringValue":{"clause":"13.1.2","ids":["prod-ov5ki9Up"]}},"prod-Shb6Dgff":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-G2CxyRR8"]}},"prod-FwaLgcLH":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-hU5p3vdM"]},"AllPrivateIdentifiersValid":{"clause":"15.7.7","ids":["prod-9EwGAkEl"]}},"prod-58WiwMc8":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-zWRPaVzO"]}},"prod-Cmo-Ch0M":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-g9CfMMnI"]}},"prod-XZ1IV5BV":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-lJ9wuQsk"]}},"prod-kYvem_87":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-fZIg56D8"]}},"prod-WPBp76A-":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-AgSQnEAG"]}},"prod-4bMdCOPa":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-jkiznuvy"]}},"prod-qIsN6LkP":{"AssignmentTargetType":{"clause":"8.5.4","ids":["prod-6GBPx2Io"]}},"prod-O1kityZO":{"PropName":{"clause":"8.5.5","ids":["prod-qwkHLLWn"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-pxaBv7Tq"]}},"prod-vZMKiSRJ":{"PropName":{"clause":"8.5.5","ids":["prod-LNEVDzQo"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-r1teTyPc"]}},"prod-Jsxupyj1":{"PropName":{"clause":"8.5.5","ids":["prod-T9fmdB_X"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-N8qwXXqo"]}},"prod-8fEXDve1":{"PropName":{"clause":"8.5.5","ids":["prod-Xw0182zP"]}},"prod-1paap4E_":{"PropName":{"clause":"8.5.5","ids":["prod-nyDilreQ"]}},"prod-V7gahr3e":{"PropName":{"clause":"8.5.5","ids":["prod-r9-JDvZR"]}},"prod-BPUn8Lt3":{"PropName":{"clause":"8.5.5","ids":["prod-5EaGoVCR"]},"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-3FDawUhc"]}},"prod-CvdRIvQG":{"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-xc-5PFkl"]},"FunctionBodyContainsUseStrict":{"clause":"15.2.2","ids":["prod-SI3y-Fh-"]},"EvaluateFunctionBody":{"clause":"15.2.3","ids":["prod-BiHevouZ"]}},"prod-UaNDUTMe":{"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-dp9uKN5f"]},"EvaluateGeneratorBody":{"clause":"15.5.2","ids":["prod-LwSgcEYg"]}},"prod-47HC640n":{"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-_F5bCEpP"]},"EvaluateAsyncGeneratorBody":{"clause":"15.6.2","ids":["prod-SWMcozzE"]}},"prod-WjFwGBMF":{"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-V5mALOgb"]},"EvaluateAsyncFunctionBody":{"clause":"15.8.4","ids":["prod-jL__NzW5"]}},"prod-P2DNnhoV":{"EvaluateBody":{"clause":"10.2.1.3","ids":["prod-pu8sYeYA"]}},"prod-ct1Yw7tL":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-6EKD79IF"]}},"prod-M9nyIflh":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-VwBAoy40"]}},"prod-lP2MlcII":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-MgVpq-Ot"]}},"prod-v-a6rh2w":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-_KqL62EN"]}},"prod-b9VW4Mn-":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-k8d8Sn1k","prod-6lkR-0p2"]}},"prod-fgQ6BNSW":{"NumericValue":{"clause":"12.8.3.2","ids":["prod-Rb94_ol-"]}},"prod-6WVj7Zp6":{"BodyText":{"clause":"12.8.5.2","ids":["prod-GHASI6lr"]},"FlagText":{"clause":"12.8.5.3","ids":["prod-U3zNjneX"]}},"prod-nway9r4_":{"StringValue":{"clause":"13.1.2","ids":["prod-tbqchaHr"]}},"prod-dbXHPjzF":{"StringValue":{"clause":"13.1.2","ids":["prod-NS6rHu2W"]}},"prod-3VpPJW1o":{"StringValue":{"clause":"13.1.2","ids":["prod-APZnd9XH"]}},"prod-x8F06K1P":{"StringValue":{"clause":"13.1.2","ids":["prod-z0WsNljd"]}},"prod-Qowk0koj":{"StringValue":{"clause":"13.1.2","ids":["prod-3LDrFiW5"]}},"prod-j40wR5UN":{"StringValue":{"clause":"13.1.2","ids":["prod-nzu557qc"]}},"prod-J7xTfeyA":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-ACq7eTCD"]},"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-4Wj_oyTQ"]}},"prod-lq_Nojbr":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-KyZNZ-MT"]},"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-zWmQntmV"]}},"prod-nakNeXAG":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-_juTnZH7"]}},"prod-XL4uSEt_":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-PNKSiljq"]}},"prod-rNLR62Va":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-9ZiZA1Ch"]}},"prod-BSaguLF3":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-HRfw0EOP"]}},"prod-H9W06sct":{"ArrayAccumulation":{"clause":"13.2.4.1","ids":["prod-_w8Sn596"]}},"prod-2XenTcpv":{"PropertyNameList":{"clause":"13.2.5.3","ids":["prod-ojv3z_1M"]}},"prod-c72dXkTz":{"PropertyNameList":{"clause":"13.2.5.3","ids":["prod-arjQ9VdV"]},"PropertyDefinitionEvaluation":{"clause":"13.2.5.5","ids":["prod-2nasR_1u"]}},"prod-FjGsqAJv":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-wUHw6ReH"]},"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-EUsfaoKE"]}},"prod-nG1t-jNI":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-AfRnt93a"]},"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-RX4K7HKv"]}},"prod-IqxH63yE":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-SXp_0Muf"]},"SubstitutionEvaluation":{"clause":"13.2.8.4","ids":["prod-h8M7VnrX"]}},"prod-j0qqWY2p":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-fValkc1v"]},"SubstitutionEvaluation":{"clause":"13.2.8.4","ids":["prod-0ukbbNyO"]}},"prod-V4hc4rPI":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-sExxMRoA"]},"SubstitutionEvaluation":{"clause":"13.2.8.4","ids":["prod-oOPfrahZ"]}},"prod-PHoLfCK_":{"TemplateStrings":{"clause":"13.2.8.2","ids":["prod-oVK_xc-L"]},"SubstitutionEvaluation":{"clause":"13.2.8.4","ids":["prod-Jm_C6N1j"]}},"prod-lgwqNVq7":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-qXYYcvIK"]}},"prod-e75CowVl":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-6LIBrAp-"]}},"prod-bq3bMpyK":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-9NFeGQ82"]}},"prod--rnN0MQv":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-avUGM8aa"]}},"prod-1jakKBk1":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-Au9Wi9yT"]}},"prod--wg-2WV5":{"ArgumentListEvaluation":{"clause":"13.3.8.1","ids":["prod-_obYKRXG"]}},"prod-J4fvvwWl":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-1C3YSxR_"]}},"prod-a5k1i_eU":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-w5u7jzLu"]}},"prod-qtd11XGp":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-JeRaAt5H"]},"AllPrivateIdentifiersValid":{"clause":"15.7.7","ids":["prod-GLUsMLG4"]}},"prod-zMZUOMrf":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-kAXkNcIE"]}},"prod-4aVR1jLh":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-PNgnxyKa"]}},"prod-MW9Cgivd":{"ChainEvaluation":{"clause":"13.3.9.2","ids":["prod-5tv-oPv9"]},"AllPrivateIdentifiersValid":{"clause":"15.7.7","ids":["prod-LZl0sxgi"]}},"prod-Ix53lok1":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-3gUcVFuf"]}},"prod-3uSyi6IT":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-BL-EfQkR"]}},"prod-S2lwsZIP":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-w0nDUCli","prod-c6GsLBP6"]}},"prod-lF9xCwj2":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-EbrhbyXb","prod-zzOr3EoW","prod--ENeYZ8i"]}},"prod-VmyFmgP-":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-IYCbjDvt"]}},"prod-U5w44WHu":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-GIS42l5L"]}},"prod-O0K_hLF1":{"DestructuringAssignmentEvaluation":{"clause":"13.15.5.2","ids":["prod-V79sItM3"]}},"prod-Zg8oWRHF":{"PropertyDestructuringAssignmentEvaluation":{"clause":"13.15.5.3","ids":["prod-ysaEPEoc"]}},"prod-3q7yGYEa":{"PropertyDestructuringAssignmentEvaluation":{"clause":"13.15.5.3","ids":["prod-yhW4Xo3o"]}},"prod-v1dWCZ87":{"PropertyDestructuringAssignmentEvaluation":{"clause":"13.15.5.3","ids":["prod-P2UQDIgF"]}},"prod-mUDd8nHs":{"RestDestructuringAssignmentEvaluation":{"clause":"13.15.5.4","ids":["prod-uer86s2s"]}},"prod-enAr2ZG3":{"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-wdwg9MFc"]}},"prod-Ud4u6J-Q":{"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-LgDa64vV"]}},"prod-sl9Zadb9":{"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-vVbhdjr0","prod-gwNUTqrO"]}},"prod-qvQWEQo1":{"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-L7cVew9S"]},"KeyedDestructuringAssignmentEvaluation":{"clause":"13.15.5.6","ids":["prod-M4lsIchc"]}},"prod-DMURMN0m":{"IteratorDestructuringAssignmentEvaluation":{"clause":"13.15.5.5","ids":["prod-NB8JhQlN"]}},"prod-_67MBf2R":{"PropertyBindingInitialization":{"clause":"14.3.3.1","ids":["prod--5EhKk0m"]}},"prod-ltwW708a":{"RestBindingInitialization":{"clause":"14.3.3.2","ids":["prod-jjw6mbi6"]}},"prod-_iKWbsbc":{"LoopEvaluation":{"clause":"14.7.1.2","ids":["prod-bY0mbJsd"]}},"prod-APtduKCe":{"LoopEvaluation":{"clause":"14.7.1.2","ids":["prod-pBcbxGRB"]}},"prod-GF3bPj7n":{"LoopEvaluation":{"clause":"14.7.1.2","ids":["prod-FuTGGBHg"]}},"prod-6JGUK4CB":{"LoopEvaluation":{"clause":"14.7.1.2","ids":["prod-RfvZcfJK"]}},"prod-zOzqrjO_":{"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-HvnSrzbi"]}},"prod-Od4pejmC":{"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-AsYWUqR1"]}},"prod-bASH00Dp":{"IsDestructuring":{"clause":"14.7.5.2","ids":["prod-n6CWa3rF"]}},"prod-Uwt2E06k":{"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-FSHcHfYw"]}},"prod-_RzUocsc":{"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-yNvNX8se"]}},"prod--LiPad3T":{"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-WDFeNdWY"]}},"prod-6V6m-A5U":{"LabelledEvaluation":{"clause":"14.13.4","ids":["prod--R2pJplF"]}},"prod--yHlyxIy":{"LabelledEvaluation":{"clause":"14.13.4","ids":["prod-nKo_YY6H"]}},"prod-ybInUotF":{"CatchClauseEvaluation":{"clause":"14.15.2","ids":["prod-7Gz_IT_v"]}},"prod-eloVArBA":{"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-3o8iyoDi"]},"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-Vy2-ZCdS"]}},"prod-t4IFgCs2":{"IsSimpleParameterList":{"clause":"15.1.3","ids":["prod-uFFTeOPE"]}},"prod-TejDOk2p":{"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-WmFS8bja"]}},"prod-4-xtlU1r":{"ExpectedArgumentCount":{"clause":"15.1.5","ids":["prod-01YV1lrL"]}},"prod-c6cxJePv":{"ConciseBodyContainsUseStrict":{"clause":"15.3.2","ids":["prod-72drK4Uu"]}},"prod-SKJRU3Gy":{"SpecialMethod":{"clause":"15.4.3","ids":["prod-kI3eJd2i"]}},"prod-JrqfvaKq":{"SpecialMethod":{"clause":"15.4.3","ids":["prod-y_NSkW05"]}},"prod-Cxt3DfG5":{"SpecialMethod":{"clause":"15.4.3","ids":["prod-fiMt-szv"]}},"prod-Qf4HAgqR":{"ClassElementKind":{"clause":"15.7.2","ids":["prod-z4kY36XR"]},"IsStatic":{"clause":"15.7.4","ids":["prod-CtxLpivn"]},"ClassElementEvaluation":{"clause":"15.7.11","ids":["prod-Qe_eKZ3f"]}},"prod-0XtyXojL":{"ClassElementKind":{"clause":"15.7.2","ids":["prod-WYqnrGO2"]},"IsStatic":{"clause":"15.7.4","ids":["prod-lR6jUbAy"]},"ClassElementEvaluation":{"clause":"15.7.11","ids":["prod-DNhqQKHO"]}},"prod-RVH9JhqU":{"ClassElementKind":{"clause":"15.7.2","ids":["prod-gbiOT0dB"]},"IsStatic":{"clause":"15.7.4","ids":["prod-gXtZ0OpF"]},"ClassElementEvaluation":{"clause":"15.7.11","ids":["prod-tPq9hD-G"]}},"prod-8cGH1X5O":{"ClassElementKind":{"clause":"15.7.2","ids":["prod-aKP7bsri"]},"IsStatic":{"clause":"15.7.4","ids":["prod-wyUVxCrb"]},"ClassElementEvaluation":{"clause":"15.7.11","ids":["prod-Cn1oLmsN"]}},"prod-ADR6-dWZ":{"ConstructorMethod":{"clause":"15.7.3","ids":["prod-5dD0G3pr"]},"NonConstructorElements":{"clause":"15.7.5","ids":["prod-19e_yBXp"]},"PrototypePropertyNameList":{"clause":"15.7.6","ids":["prod-A14zfyT4"]}},"prod-YUQCWiaa":{"AllPrivateIdentifiersValid":{"clause":"15.7.7","ids":["prod-7rm6mrow"]}},"prod-G9YdmiD5":{"PrivateBoundIdentifiers":{"clause":"15.7.8","ids":["prod-sMaEe0uD"]}},"prod-Kq4Uu2cU":{"AsyncConciseBodyContainsUseStrict":{"clause":"15.9.2","ids":["prod-NdVhlp_L"]}},"prod-k7_ObWcc":{"IsStrict":{"clause":"16.1.2","ids":["prod-ATUJl4Kq"]}},"prod-oFwa4ZD6":{"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-K1adkbP6"]}},"prod-sCJUL89L":{"ModuleRequests":{"clause":"16.2.1.3","ids":["prod-geKEXfWi"]}},"prod-XiX5S_vU":{"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-8iON-ECl"]}},"prod-AScJop1Y":{"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-UUrB05kM"]}},"prod-5TmWi69r":{"ImportEntriesForModule":{"clause":"16.2.2.3","ids":["prod-EknrR_3b"]}},"prod-tKOro2Xm":{"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-TQTcajTg"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-tyOEKkRB"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-mzZ83dVi"]},"ReferencedBindings":{"clause":"16.2.3.6","ids":["prod-SuOfrU8K"]}},"prod-JgWQiNCe":{"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-2N5gUMor"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-VeE5fiYD"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-zadzACBk"]},"ReferencedBindings":{"clause":"16.2.3.6","ids":["prod-eGw90zQ9"]}},"prod-JyH8gtYm":{"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-PXy6OYfk"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-pHxySdXg"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-sRdxtKYQ"]},"ReferencedBindings":{"clause":"16.2.3.6","ids":["prod-T6LrnWgA"]}},"prod-HMTDwQcl":{"ExportedBindings":{"clause":"16.2.3.2","ids":["prod-yE_sj4Qx"]},"ExportedNames":{"clause":"16.2.3.3","ids":["prod-GRhLFzm0"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-kMIeNwJo"]},"ReferencedBindings":{"clause":"16.2.3.6","ids":["prod-iOxB68Nd"]}},"prod-A39AIi_B":{"ExportedNames":{"clause":"16.2.3.3","ids":["prod-H38kB23_"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-Xa_xAKMV"]}},"prod-o48mDNgZ":{"ExportedNames":{"clause":"16.2.3.3","ids":["prod-cZdtFWyT"]},"ExportEntriesForModule":{"clause":"16.2.3.5","ids":["prod-eEU1GKNj"]}},"prod-bKXP43lb":{"ExportedNames":{"clause":"16.2.3.3","ids":["prod-zlltzYPM"]}},"prod-PUMw6WxS":{"CapturingGroupNumber":{"clause":"22.2.1.2","ids":["prod-xT1sXsIe","prod-lKRUpdJ5"]}},"prod-XasmPTvP":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-SW1wsHv2"]},"CharacterValue":{"clause":"22.2.1.4","ids":["prod-xjk33vk0"]}},"prod-8_e8tlx2":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-bDYaT4vt"]},"CharacterValue":{"clause":"22.2.1.4","ids":["prod-r7Whzgyd"]}},"prod-vzYjsMTa":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-zN7WPfK3"]},"CharacterValue":{"clause":"22.2.1.4","ids":["prod-lioRfUCB"]}},"prod-Q53Yz_u4":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-_sYwOjnL"]},"CharacterValue":{"clause":"22.2.1.4","ids":["prod-RssYfbc0"]}},"prod-OVCnPzXd":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-uFVNSs1H"]}},"prod-b7xEos_a":{"IsCharacterClass":{"clause":"22.2.1.3","ids":["prod-3d9phfMH"]}},"prod-Oo951o9a":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-qdZp22xs"]}},"prod-MEeQQu3e":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-icPSXbtU"]}},"prod-oPPhk0pZ":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod--h1KYMFX"]}},"prod-3rHpyopk":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-GXRVwMQi"]}},"prod-qMcC0l5G":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-xQFw7WMV"]}},"prod-j3nSt7Xf":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-OI8ASjmd"]}},"prod-WefCCwPE":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-cC4Huuek"]}},"prod-9DQE3TBL":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-KB9TwXt5"]}},"prod-NPEUSg3U":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-w_eLE8Wq"]}},"prod-iYWV_jnv":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-gm_vpVWn"]}},"prod-KFE72mZL":{"CharacterValue":{"clause":"22.2.1.4","ids":["prod-u6hqoUgl"]}},"prod-dKwoh9d_":{"SourceText":{"clause":"22.2.1.5","ids":["prod-YwpqHKM8"]}},"prod-fm-i-5qN":{"SourceText":{"clause":"22.2.1.5","ids":["prod-GwDkgvpu"]}},"prod-7lP6RX49":{"CapturingGroupName":{"clause":"22.2.1.6","ids":["prod-Yflikipu"]}},"prod-Wlj6DCQi":{"CapturingGroupName":{"clause":"22.2.1.6","ids":["prod-9mV1v__j"]}}}`);