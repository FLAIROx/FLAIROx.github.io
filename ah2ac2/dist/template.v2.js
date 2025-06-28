(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  const zeroPad = n => n < 10 ? '0' + n : n;

  const RFC = function(date) {
    const day = days[date.getDay()].substring(0, 3);
    const paddedDate = zeroPad(date.getDate());
    const month = months[date.getMonth()].substring(0,3);
    const year = date.getFullYear().toString();
    const hours = date.getUTCHours().toString();
    const minutes = date.getUTCMinutes().toString();
    const seconds = date.getUTCSeconds().toString();
    return `${day}, ${paddedDate} ${month} ${year} ${hours}:${minutes}:${seconds} Z`;
  };

  const objectFromMap = function(map) {
    const object = Array.from(map).reduce((object, [key, value]) => (
      Object.assign(object, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
    ), {});
    return object;
  };

  const mapFromObject = function(object) {
    const map = new Map();
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        map.set(property, object[property]);
      }
    }
    return map;
  };

  class Author {

    // constructor(name='', personalURL='', affiliation='', affiliationURL='') {
    //   this.name = name; // 'Chris Olah'
    //   this.personalURL = personalURL; // 'https://colah.github.io'
    //   this.affiliation = affiliation; // 'Google Brain'
    //   this.affiliationURL = affiliationURL; // 'https://g.co/brain'
    // }

    constructor(object) {
      this.name = object.author; // 'Chris Olah'
      this.personalURL = object.authorURL; // 'https://colah.github.io'
      this.affiliation = object.affiliation; // 'Google Brain'
      this.affiliationURL = object.affiliationURL; // 'https://g.co/brain'
      this.affiliations = object.affiliations || []; // new-style affiliations
    }

    // 'Chris'
    get firstName() {
      const names = this.name.split(' ');
      return names.slice(0, names.length - 1).join(' ');
    }

    // 'Olah'
    get lastName() {
      const names = this.name.split(' ');
      return names[names.length -1];
    }
  }

  function mergeFromYMLFrontmatter(target, source) {
    target.title = source.title;
    if (source.published) {
      if (source.published instanceof Date) {
        target.publishedDate = source.published;
      } else if (source.published.constructor === String) {
        target.publishedDate = new Date(source.published);
      }
    }
    if (source.publishedDate) {
      if (source.publishedDate instanceof Date) {
        target.publishedDate = source.publishedDate;
      } else if (source.publishedDate.constructor === String) {
        target.publishedDate = new Date(source.publishedDate);
      } else {
        console.error('Don\'t know what to do with published date: ' + source.publishedDate);
      }
    }
    target.description = source.description;
    target.authors = source.authors.map( (authorObject) => new Author(authorObject));
    target.katex = source.katex;
    target.password = source.password;
    if (source.doi) {
      target.doi = source.doi;
    }

    target.pubUrl = source.pubUrl;
    target.pubVenue = source.pubVenue;
  }

  class FrontMatter$1 {
    constructor() {
      this.title = 'unnamed article'; // 'Attention and Augmented Recurrent Neural Networks'
      this.description = ''; // 'A visual overview of neural attention...'
      this.authors = []; // Array of Author(s)

      this.bibliography = new Map();
      this.bibliographyParsed = false;
      //  {
      //    'gregor2015draw': {
      //      'title': 'DRAW: A recurrent neural network for image generation',
      //      'author': 'Gregor, Karol and Danihelka, Ivo and Graves, Alex and Rezende, Danilo Jimenez and Wierstra, Daan',
      //      'journal': 'arXiv preprint arXiv:1502.04623',
      //      'year': '2015',
      //      'url': 'https://arxiv.org/pdf/1502.04623.pdf',
      //      'type': 'article'
      //    },
      //  }

      // Citation keys should be listed in the order that they are appear in the document.
      // Each key refers to a key in the bibliography dictionary.
      this.citations = []; // [ 'gregor2015draw', 'mercier2011humans' ]
      this.citationsCollected = false;

      //
      // Assigned from posts.csv
      //

      //  publishedDate: 2016-09-08T07:00:00.000Z,
      //  tags: [ 'rnn' ],
      //  distillPath: '2016/augmented-rnns',
      //  githubPath: 'distillpub/post--augmented-rnns',
      //  doiSuffix: 1,

      //
      // Assigned from journal
      //
      this.journal = {};
      //  journal: {
      //    'title': 'Distill',
      //    'full_title': 'Distill',
      //    'abbrev_title': 'Distill',
      //    'url': 'http://distill.pub',
      //    'doi': '10.23915/distill',
      //    'publisherName': 'Distill Working Group',
      //    'publisherEmail': 'admin@distill.pub',
      //    'issn': '2476-0757',
      //    'editors': [...],
      //    'committee': [...]
      //  }
      //  volume: 1,
      //  issue: 9,

      this.katex = {};

      //
      // Assigned from publishing process
      //

      //  githubCompareUpdatesUrl: 'https://github.com/distillpub/post--augmented-rnns/compare/1596e094d8943d2dc0ea445d92071129c6419c59...3bd9209e0c24d020f87cf6152dcecc6017cbc193',
      //  updatedDate: 2017-03-21T07:13:16.000Z,
      //  doi: '10.23915/distill.00001',
      this.doi = undefined;
      this.publishedDate = undefined;
      this.pubUrl = undefined;
      this.pubVenue = undefined;
    }

    // Example:
    // title: Demo Title Attention and Augmented Recurrent Neural Networks
    // published: Jan 10, 2017
    // authors:
    // - Chris Olah:
    // - Shan Carter: http://shancarter.com
    // affiliations:
    // - Google Brain:
    // - Google Brain: http://g.co/brain

    //
    // Computed Properties
    //

    // 'http://distill.pub/2016/augmented-rnns',
    set url(value) {
      this._url = value;
    }
    get url() {
      if (this._url) {
        return this._url;
      } else if (this.distillPath && this.journal.url) {
        return this.journal.url + '/' + this.distillPath;
      } else if (this.journal.url) {
        return this.journal.url;
      }
    }

    // 'https://github.com/distillpub/post--augmented-rnns',
    get githubUrl() {
      if (this.githubPath) {
        return 'https://github.com/' + this.githubPath;
      } else {
        return undefined;
      }
    }

    // TODO resolve differences in naming of URL/Url/url.
    // 'http://distill.pub/2016/augmented-rnns/thumbnail.jpg',
    set previewURL(value) {
      this._previewURL = value;
    }
    get previewURL() {
      return this._previewURL ? this._previewURL : this.url + '/thumbnail.jpg';
    }

    // 'Thu, 08 Sep 2016 00:00:00 -0700',
    get publishedDateRFC() {
      return RFC(this.publishedDate);
    }

    // 'Thu, 08 Sep 2016 00:00:00 -0700',
    get updatedDateRFC() {
      return RFC(this.updatedDate);
    }

    // 2016,
    get publishedYear() {
      return this.publishedDate.getFullYear();
    }

    // 'Sept',
    get publishedMonth() {
      return months[this.publishedDate.getMonth()];
    }

    // 8,
    get publishedDay() {
      return this.publishedDate.getDate();
    }

    // '09',
    get publishedMonthPadded() {
      return zeroPad(this.publishedDate.getMonth() + 1);
    }

    // '08',
    get publishedDayPadded() {
      return zeroPad(this.publishedDate.getDate());
    }

    get publishedISODateOnly() {
      return this.publishedDate.toISOString().split('T')[0];
    }

    get volume() {
      const volume = this.publishedYear - 2015;
      if (volume < 1) {
        throw new Error('Invalid publish date detected during computing volume');
      }
      return volume;
    }

    get issue() {
      return this.publishedDate.getMonth() + 1;
    }

    // 'Olah & Carter',
    get concatenatedAuthors() {
      if (this.authors.length > 2) {
        return this.authors[0].lastName + ', et al.';
      } else if (this.authors.length === 2) {
        return this.authors[0].lastName + ' & ' + this.authors[1].lastName;
      } else if (this.authors.length === 1) {
        return this.authors[0].lastName;
      }
    }

    // 'Olah, Chris and Carter, Shan',
    get bibtexAuthors() {
      return this.authors.map(author => {
        return author.lastName + ', ' + author.firstName;
      }).join(' and ');
    }

    // 'olah2016attention'
    get slug() {
      let slug = '';
      if (this.authors.length) {
        slug += this.authors[0].lastName.toLowerCase();
        slug += this.publishedYear;
        slug += this.title.split(' ')[0].toLowerCase();
      }
      return slug || 'Untitled';
    }

    get bibliographyEntries() {
      return new Map(this.citations.map( citationKey => {
        const entry = this.bibliography.get(citationKey);
        return [citationKey, entry];
      }));
    }

    set bibliography(bibliography) {
      if (bibliography instanceof Map) {
        this._bibliography = bibliography;
      } else if (typeof bibliography === 'object') {
        this._bibliography = mapFromObject(bibliography);
      }
    }

    get bibliography() {
      return this._bibliography;
    }

    static fromObject(source) {
      const frontMatter = new FrontMatter$1();
      Object.assign(frontMatter, source);
      return frontMatter;
    }

    assignToObject(target) {
      Object.assign(target, this);
      target.bibliography = objectFromMap(this.bibliographyEntries);
      target.url = this.url;
      target.pubUrl = this.pubUrl,
      target.pubVenue = this.pubVenue,
      target.githubUrl = this.githubUrl;
      target.previewURL = this.previewURL;
      if (this.publishedDate) {
        target.volume = this.volume;
        target.issue = this.issue;
        target.publishedDateRFC = this.publishedDateRFC;
        target.publishedYear = this.publishedYear;
        target.publishedMonth = this.publishedMonth;
        target.publishedDay = this.publishedDay;
        target.publishedMonthPadded = this.publishedMonthPadded;
        target.publishedDayPadded = this.publishedDayPadded;
      }
      if (this.updatedDate) {
        target.updatedDateRFC = this.updatedDateRFC;
      }
      target.concatenatedAuthors = this.concatenatedAuthors;
      target.bibtexAuthors = this.bibtexAuthors;
      target.slug = this.slug;
    }

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  const Mutating = (superclass) => {
    return class extends superclass {

      constructor() {
        super();

        // set up mutation observer
        const options = {childList: true, characterData: true, subtree: true};
        const observer = new MutationObserver( () => {
          observer.disconnect();
          this.renderIfPossible();
          observer.observe(this, options);
        });

        // ...and listen for changes
        observer.observe(this, options);
      }

      connectedCallback() {
        super.connectedCallback();

        this.renderIfPossible();
      }

      // potential TODO: check if this is enough for all our usecases
      // maybe provide a custom function to tell if we have enough information to render
      renderIfPossible() {
        if (this.textContent && this.root) {
          this.renderContent();
        }
      }

      renderContent() {
        console.error(`Your class ${this.constructor.name} must provide a custom renderContent() method!` );
      }

    }; // end class
  }; // end mixin function

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  /*global ShadyCSS*/

  const Template = (name, templateString, useShadow = true) => {

    return (superclass) => {

      const template = document.createElement('template');
      template.innerHTML = templateString;

      if (useShadow && 'ShadyCSS' in window) {
        ShadyCSS.prepareTemplate(template, name);
      }

      return class extends superclass {

        static get is() { return name; }

        constructor() {
          super();

          this.clone = document.importNode(template.content, true);
          if (useShadow) {
            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(this.clone);
          }
        }

        connectedCallback() {
          if (this.hasAttribute('distill-prerendered')) {
            return;
          }
          if (useShadow) {
            if ('ShadyCSS' in window) {
              ShadyCSS.styleElement(this);
            }
          } else {
            this.insertBefore(this.clone, this.firstChild);
          }
        }

        get root() {
          if (useShadow) {
            return this.shadowRoot;
          } else {
            return this;
          }
        }

        /* TODO: Are we using these? Should we even? */
        $(query) {
          return this.root.querySelector(query);
        }

        $$(query) {
          return this.root.querySelectorAll(query);
        }
      };
    };
  };

  var math = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nspan.katex-display {\n  text-align: left;\n  padding: 8px 0 8px 0;\n  margin: 0.5em 0 0.5em 1em;\n}\n\nspan.katex {\n  -webkit-font-smoothing: antialiased;\n  color: rgba(0, 0, 0, 0.8);\n  font-size: 1.18em;\n}\n";

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // This is a straight concatenation of code from KaTeX's contrib folder,
  // but we aren't using some of their helpers that don't work well outside a browser environment.

  /*global katex */

  const findEndOfMath = function(delimiter, text, startIndex) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
      const character = text[index];

      if (
        braceLevel <= 0 &&
        text.slice(index, index + delimLength) === delimiter
      ) {
        return index;
      } else if (character === "\\") {
        index++;
      } else if (character === "{") {
        braceLevel++;
      } else if (character === "}") {
        braceLevel--;
      }

      index++;
    }

    return -1;
  };

  const splitAtDelimiters = function(startData, leftDelim, rightDelim, display) {
    const finalData = [];

    for (let i = 0; i < startData.length; i++) {
      if (startData[i].type === "text") {
        const text = startData[i].data;

        let lookingForLeft = true;
        let currIndex = 0;
        let nextIndex;

        nextIndex = text.indexOf(leftDelim);
        if (nextIndex !== -1) {
          currIndex = nextIndex;
          finalData.push({
            type: "text",
            data: text.slice(0, currIndex)
          });
          lookingForLeft = false;
        }

        while (true) {
          // eslint-disable-line no-constant-condition
          if (lookingForLeft) {
            nextIndex = text.indexOf(leftDelim, currIndex);
            if (nextIndex === -1) {
              break;
            }

            finalData.push({
              type: "text",
              data: text.slice(currIndex, nextIndex)
            });

            currIndex = nextIndex;
          } else {
            nextIndex = findEndOfMath(
              rightDelim,
              text,
              currIndex + leftDelim.length
            );
            if (nextIndex === -1) {
              break;
            }

            finalData.push({
              type: "math",
              data: text.slice(currIndex + leftDelim.length, nextIndex),
              rawData: text.slice(currIndex, nextIndex + rightDelim.length),
              display: display
            });

            currIndex = nextIndex + rightDelim.length;
          }

          lookingForLeft = !lookingForLeft;
        }

        finalData.push({
          type: "text",
          data: text.slice(currIndex)
        });
      } else {
        finalData.push(startData[i]);
      }
    }

    return finalData;
  };

  const splitWithDelimiters = function(text, delimiters) {
    let data = [{ type: "text", data: text }];
    for (let i = 0; i < delimiters.length; i++) {
      const delimiter = delimiters[i];
      data = splitAtDelimiters(
        data,
        delimiter.left,
        delimiter.right,
        delimiter.display || false
      );
    }
    return data;
  };

  /* Note: optionsCopy is mutated by this method. If it is ever exposed in the
   * API, we should copy it before mutating.
   */
  const renderMathInText = function(text, optionsCopy) {
    const data = splitWithDelimiters(text, optionsCopy.delimiters);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; i++) {
      if (data[i].type === "text") {
        fragment.appendChild(document.createTextNode(data[i].data));
      } else {
        const tag = document.createElement("d-math");
        const math = data[i].data;
        // Override any display mode defined in the settings with that
        // defined by the text itself
        optionsCopy.displayMode = data[i].display;
        try {
          tag.textContent = math;
          if (optionsCopy.displayMode) {
            tag.setAttribute("block", "");
          }
        } catch (e) {
          if (!(e instanceof katex.ParseError)) {
            throw e;
          }
          optionsCopy.errorCallback(
            "KaTeX auto-render: Failed to parse `" + data[i].data + "` with ",
            e
          );
          fragment.appendChild(document.createTextNode(data[i].rawData));
          continue;
        }
        fragment.appendChild(tag);
      }
    }

    return fragment;
  };

  const renderElem = function(elem, optionsCopy) {
    for (let i = 0; i < elem.childNodes.length; i++) {
      const childNode = elem.childNodes[i];
      if (childNode.nodeType === 3) {
        // Text node
        const text = childNode.textContent;
        if (optionsCopy.mightHaveMath(text)) {
          const frag = renderMathInText(text, optionsCopy);
          i += frag.childNodes.length - 1;
          elem.replaceChild(frag, childNode);
        }
      } else if (childNode.nodeType === 1) {
        // Element node
        const shouldRender =
          optionsCopy.ignoredTags.indexOf(childNode.nodeName.toLowerCase()) ===
          -1;

        if (shouldRender) {
          renderElem(childNode, optionsCopy);
        }
      }
      // Otherwise, it's something else, and ignore it.
    }
  };

  const defaultAutoRenderOptions = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false }
      // LaTeX uses this, but it ruins the display of normal `$` in text:
      // {left: '$', right: '$', display: false},
    ],

    ignoredTags: [
      "script",
      "noscript",
      "style",
      "textarea",
      "pre",
      "code",
      "svg"
    ],

    errorCallback: function(msg, err) {
      console.error(msg, err);
    }
  };

  const renderMathInElement = function(elem, options) {
    if (!elem) {
      throw new Error("No element provided to render");
    }

    const optionsCopy = Object.assign({}, defaultAutoRenderOptions, options);
    const delimiterStrings = optionsCopy.delimiters.flatMap(d => [
      d.left,
      d.right
    ]);
    const mightHaveMath = text =>
      delimiterStrings.some(d => text.indexOf(d) !== -1);
    optionsCopy.mightHaveMath = mightHaveMath;
    renderElem(elem, optionsCopy);
  };

  // Copyright 2018 The Distill Template Authors

//  const katexJSURL = 'https://distill.pub/third-party/katex/katex.min.js';
		  //  const katexCSSTag = '<link rel="stylesheet" href="https://distill.pub/third-party/katex/katex.min.css" crossorigin="anonymous">';
  const katexJSURL = 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.js';
  const katexCSSTag = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" crossorigin="anonymous">';
		  

  const T$c = Template('d-math', `
${katexCSSTag}
<style>

:host {
  display: inline-block;
  contain: style;
}

:host([block]) {
  display: block;
}

${math}
</style>
<span id='katex-container'></span>
`);

  // DMath, not Math, because that would conflict with the JS built-in
  class DMath extends Mutating(T$c(HTMLElement)) {

    static set katexOptions(options) {
      DMath._katexOptions = options;
      if (DMath.katexOptions.delimiters) {
        if (!DMath.katexAdded) {
          DMath.addKatex();
        } else {
          DMath.katexLoadedCallback();
        }
      }
    }

    static get katexOptions() {
      if (!DMath._katexOptions) {
        DMath._katexOptions = {
          delimiters: [ { 'left':'$$', 'right':'$$', 'display': false } ]
        };
      }
      return DMath._katexOptions;
    }

    static katexLoadedCallback() {
      // render all d-math tags
      const mathTags = document.querySelectorAll('d-math');
      for (const mathTag of mathTags) {
        mathTag.renderContent();
      }
      // transform inline delimited math to d-math tags
      if (DMath.katexOptions.delimiters) {
        renderMathInElement(document.body, DMath.katexOptions);
      }
    }

    static addKatex() {
      // css tag can use this convenience function
      document.head.insertAdjacentHTML('beforeend', katexCSSTag);
      // script tag has to be created to work properly
      const scriptTag = document.createElement('script');
      scriptTag.src = katexJSURL;
      scriptTag.async = true;
      scriptTag.onload = DMath.katexLoadedCallback;
      scriptTag.crossorigin = 'anonymous';
      document.head.appendChild(scriptTag);

      DMath.katexAdded = true;
    }

    get options() {
      const localOptions = { displayMode: this.hasAttribute('block') };
      return Object.assign(localOptions, DMath.katexOptions);
    }

    connectedCallback() {
      super.connectedCallback();
      if (!DMath.katexAdded) {
        DMath.addKatex();
      }
    }

    renderContent() {
      if (typeof katex !== 'undefined') {
        const container = this.root.querySelector('#katex-container');
        katex.render(this.textContent, container, this.options);
      }
    }

  }

  DMath.katexAdded = false;
  DMath.inlineMathRendered = false;
  window.DMath = DMath; // TODO: check if this can be removed, or if we should expose a distill global

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function collect_citations(dom = document) {
    const citations = new Set();
    const citeTags = dom.querySelectorAll("d-cite");
    for (const tag of citeTags) {
      const keyString = tag.getAttribute("key") || tag.getAttribute("bibtex-key");
      const keys = keyString.split(",").map(k => k.trim());
      for (const key of keys) {
        citations.add(key);
      }
    }
    return [...citations];
  }

  function author_string(ent, template, sep, finalSep) {
    if (ent.author == null) {
      return "";
    }
    var names = ent.author.split(" and ");
    let name_strings = names.map(name => {
      name = name.trim();
      if (name.indexOf(",") != -1) {
        var last = name.split(",")[0].trim();
        var firsts = name.split(",")[1];
      } else if (name.indexOf(" ") != -1) {
        var last = name
          .split(" ")
          .slice(-1)[0]
          .trim();
        var firsts = name
          .split(" ")
          .slice(0, -1)
          .join(" ");
      } else {
        var last = name.trim();
      }
      var initials = "";
      if (firsts != undefined) {
        initials = firsts
          .trim()
          .split(" ")
          .map(s => s.trim()[0]);
        initials = initials.join(".") + ".";
      }
      return template
        .replace("${F}", firsts)
        .replace("${L}", last)
        .replace("${I}", initials)
        .trim(); // in case one of first or last was empty
    });
    if (names.length > 1) {
      var str = name_strings.slice(0, names.length - 1).join(sep);
      str += (finalSep || sep) + name_strings[names.length - 1];
      return str;
    } else {
      return name_strings[0];
    }
  }

  function venue_string(ent) {
    var cite = ent.journal || ent.booktitle || "";
    if ("volume" in ent) {
      var issue = ent.issue || ent.number;
      issue = issue != undefined ? "(" + issue + ")" : "";
      cite += ", Vol " + ent.volume + issue;
    }
    if ("pages" in ent) {
      cite += ", pp. " + ent.pages;
    }
    if (cite != "") cite += ". ";
    if ("publisher" in ent) {
      cite += ent.publisher;
      if (cite[cite.length - 1] != ".") cite += ".";
    }
    return cite;
  }

  function link_string(ent) {
    if ("url" in ent) {
      var url = ent.url;
      var arxiv_match = /arxiv\.org\/abs\/([0-9\.]*)/.exec(url);
      if (arxiv_match != null) {
        url = `http://arxiv.org/pdf/${arxiv_match[1]}.pdf`;
      }

      if (url.slice(-4) == ".pdf") {
        var label = "PDF";
      } else if (url.slice(-5) == ".html") {
        var label = "HTML";
      }
      return ` &ensp;<a href="${url}">[${label || "link"}]</a>`;
    } /* else if ("doi" in ent){
      return ` &ensp;<a href="https://doi.org/${ent.doi}" >[DOI]</a>`;
    }*/ else {
      return "";
    }
  }
  function doi_string(ent, new_line) {
    if ("doi" in ent) {
      return `${new_line ? "<br>" : ""} <a href="https://doi.org/${
      ent.doi
    }" style="text-decoration:inherit;">DOI: ${ent.doi}</a>`;
    } else {
      return "";
    }
  }

  function title_string(ent) {
    return '<span class="title">' + ent.title + "</span> ";
  }

  function bibliography_cite(ent, fancy) {
    if (ent) {
      var cite = title_string(ent);
      cite += link_string(ent) + "<br>";
      if (ent.author) {
        cite += author_string(ent, "${L}, ${I}", ", ", " and ");
        if (ent.year || ent.date) {
          cite += ", ";
        }
      }
      if (ent.year || ent.date) {
        cite += (ent.year || ent.date) + ". ";
      } else {
        cite += ". ";
      }
      cite += venue_string(ent);
      cite += doi_string(ent);
      return cite;
      /*var cite =  author_string(ent, "${L}, ${I}", ", ", " and ");
      if (ent.year || ent.date){
        cite += ", " + (ent.year || ent.date) + ". "
      } else {
        cite += ". "
      }
      cite += "<b>" + ent.title + "</b>. ";
      cite += venue_string(ent);
      cite += doi_string(ent);
      cite += link_string(ent);
      return cite*/
    } else {
      return "?";
    }
  }

  function hover_cite(ent) {
    if (ent) {
      var cite = "";
      cite += "<strong>" + ent.title + "</strong>";
      cite += link_string(ent);
      cite += "<br>";

      var a_str = author_string(ent, "${I} ${L}", ", ") + ".";
      var v_str =
        venue_string(ent).trim() + " " + ent.year + ". " + doi_string(ent, true);

      if ((a_str + v_str).length < Math.min(40, ent.title.length)) {
        cite += a_str + " " + v_str;
      } else {
        cite += a_str + "<br>" + v_str;
      }
      return cite;
    } else {
      return "?";
    }
  }

  function domContentLoaded() {
    return ['interactive', 'complete'].indexOf(document.readyState) !== -1;
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function _moveLegacyAffiliationFormatIntoArray(frontMatter) {
    // authors used to have propoerties "affiliation" and "affiliationURL".
    // We now encourage using an array for affiliations containing objects with
    // properties "name" and "url".
    for (let author of frontMatter.authors) {
      const hasOldStyle = Boolean(author.affiliation);
      const hasNewStyle = Boolean(author.affiliations);
      if (!hasOldStyle) continue;
      if (hasNewStyle) {
        console.warn(`Author ${author.author} has both old-style ("affiliation" & "affiliationURL") and new style ("affiliations") affiliation information!`);
      } else {
        let newAffiliation = {
          "name": author.affiliation
        };
        if (author.affiliationURL) newAffiliation.url = author.affiliationURL;
        author.affiliations = [newAffiliation];
      }
    }
    return frontMatter
  }

  function parseFrontmatter(element) {
    const scriptTag = element.firstElementChild;
    if (scriptTag) {
      const type = scriptTag.getAttribute('type');
      if (type.split('/')[1] == 'json') {
        const content = scriptTag.textContent;
        const parsed = JSON.parse(content);
        return _moveLegacyAffiliationFormatIntoArray(parsed);
      } else {
        console.error('Distill only supports JSON frontmatter tags anymore; no more YAML.');
      }
    } else {
      console.error('You added a frontmatter tag but did not provide a script tag with front matter data in it. Please take a look at our templates.');
    }
    return {};
  }

  class FrontMatter extends HTMLElement {

    static get is() { return 'd-front-matter'; }

    constructor() {
      super();

      const options = {childList: true, characterData: true, subtree: true};
      const observer = new MutationObserver( (entries) => {
        for (const entry of entries) {
          if (entry.target.nodeName === 'SCRIPT' || entry.type === 'characterData') {
            const data = parseFrontmatter(this);
            this.notify(data);
          }
        }
      });
      observer.observe(this, options);
    }

    notify(data) {
      const options = { detail: data, bubbles: true };
      const event = new CustomEvent('onFrontMatterChanged', options);
      document.dispatchEvent(event);
    }

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // no appendix -> add appendix
  // title in front, no h1 -> add it
  // no title in front, h1 -> read and put into frontMatter
  // footnote -> footnote list
  // break up bib
  // if citation, no bib-list -> add citation-list

  // if authors, no byline -> add byline

  function optionalComponents(dom, data) {
    const body = dom.body;
    const article = body.querySelector('d-article');

    // If we don't have an article tag, something weird is going on—giving up.
    if (!article) {
      console.warn('No d-article tag found; skipping adding optional components!');
      return;
    }

    let byline = dom.querySelector('d-byline');
    if (!byline) {
      if (data.authors) {
        byline = dom.createElement('d-byline');
        body.insertBefore(byline, article);
      } else {
        console.warn('No authors found in front matter; please add them before submission!');
      }
    }

    let title = dom.querySelector('d-title');
    if (!title) {
      title = dom.createElement('d-title');
      body.insertBefore(title, byline);
    }

    let h1 = title.querySelector('h1');
    if (!h1) {
      h1 = dom.createElement('h1');
      h1.textContent = data.title;
      title.insertBefore(h1, title.firstChild);
    }

    const hasPassword = typeof data.password !== 'undefined';
    let interstitial = body.querySelector('d-interstitial');
    if (hasPassword && !interstitial) {
      const inBrowser = typeof window !== 'undefined';
      const onLocalhost = inBrowser && window.location.hostname.includes('localhost');
      if (!inBrowser || !onLocalhost) {
        interstitial = dom.createElement('d-interstitial');
        interstitial.password = data.password;
        body.insertBefore(interstitial, body.firstChild);
      }
    } else if (!hasPassword && interstitial) {
      interstitial.parentElement.removeChild(this);
    }

    let appendix = dom.querySelector('d-appendix');
    if (!appendix) {
      appendix = dom.createElement('d-appendix');
      dom.body.appendChild(appendix);
    }

    let footnoteList = dom.querySelector('d-footnote-list');
    if (!footnoteList) {
      footnoteList = dom.createElement('d-footnote-list');
      appendix.appendChild(footnoteList);
    }

    let citationList = dom.querySelector('d-citation-list');
    if (!citationList) {
      citationList = dom.createElement('d-citation-list');
      appendix.appendChild(citationList);
    }

  }

  // Copyright 2018 The Distill Template Authors

  const frontMatter = new FrontMatter$1();

  const Controller = {
    frontMatter: frontMatter,
    waitingOn: {
      bibliography: [],
      citations: []
    },
    listeners: {
      onCiteKeyCreated(event) {
        const [citeTag, keys] = event.detail;

        // ensure we have citations
        if (!frontMatter.citationsCollected) {
          // console.debug('onCiteKeyCreated, but unresolved dependency ("citations"). Enqueing.');
          Controller.waitingOn.citations.push(() =>
            Controller.listeners.onCiteKeyCreated(event)
          );
          return;
        }

        // ensure we have a loaded bibliography
        if (!frontMatter.bibliographyParsed) {
          // console.debug('onCiteKeyCreated, but unresolved dependency ("bibliography"). Enqueing.');
          Controller.waitingOn.bibliography.push(() =>
            Controller.listeners.onCiteKeyCreated(event)
          );
          return;
        }

        const numbers = keys.map(key => frontMatter.citations.indexOf(key));
        citeTag.numbers = numbers;
        const entries = keys.map(key => frontMatter.bibliography.get(key));
        citeTag.entries = entries;
      },

      onCiteKeyChanged() {
        // const [citeTag, keys] = event.detail;

        // update citations
        frontMatter.citations = collect_citations();
        frontMatter.citationsCollected = true;
        for (const waitingCallback of Controller.waitingOn.citations.slice()) {
          waitingCallback();
        }

        // update bibliography
        const citationListTag = document.querySelector("d-citation-list");
        const bibliographyEntries = new Map(
          frontMatter.citations.map(citationKey => {
            return [citationKey, frontMatter.bibliography.get(citationKey)];
          })
        );
        citationListTag.citations = bibliographyEntries;

        const citeTags = document.querySelectorAll("d-cite");
        for (const citeTag of citeTags) {
          console.log(citeTag);
          const keys = citeTag.keys;
          const numbers = keys.map(key => frontMatter.citations.indexOf(key));
          citeTag.numbers = numbers;
          const entries = keys.map(key => frontMatter.bibliography.get(key));
          citeTag.entries = entries;
        }
      },

      onCiteKeyRemoved(event) {
        Controller.listeners.onCiteKeyChanged(event);
      },

      onBibliographyChanged(event) {
        const citationListTag = document.querySelector("d-citation-list");

        const bibliography = event.detail;

        frontMatter.bibliography = bibliography;
        frontMatter.bibliographyParsed = true;
        for (const waitingCallback of Controller.waitingOn.bibliography.slice()) {
          waitingCallback();
        }

        // ensure we have citations
        if (!frontMatter.citationsCollected) {
          Controller.waitingOn.citations.push(function() {
            Controller.listeners.onBibliographyChanged({
              target: event.target,
              detail: event.detail
            });
          });
          return;
        }

        if (citationListTag.hasAttribute("distill-prerendered")) {
          console.debug("Citation list was prerendered; not updating it.");
        } else {
          const entries = new Map(
            frontMatter.citations.map(citationKey => {
              return [citationKey, frontMatter.bibliography.get(citationKey)];
            })
          );
          citationListTag.citations = entries;
        }
      },

      onFootnoteChanged() {
        // const footnote = event.detail;
        //TODO: optimize to only update current footnote
        const footnotesList = document.querySelector("d-footnote-list");
        if (footnotesList) {
          const footnotes = document.querySelectorAll("d-footnote");
          footnotesList.footnotes = footnotes;
        }
      },

      onFrontMatterChanged(event) {
        const data = event.detail;
        mergeFromYMLFrontmatter(frontMatter, data);

        const interstitial = document.querySelector("d-interstitial");
        if (interstitial) {
          if (typeof frontMatter.password !== "undefined") {
            interstitial.password = frontMatter.password;
          } else {
            interstitial.parentElement.removeChild(interstitial);
          }
        }

        const prerendered = document.body.hasAttribute("distill-prerendered");
        if (!prerendered && domContentLoaded()) {
          optionalComponents(document, frontMatter);

          const appendix = document.querySelector("distill-appendix");
          if (appendix) {
            appendix.frontMatter = frontMatter;
          }

          const byline = document.querySelector("d-byline");
          if (byline) {
            byline.frontMatter = frontMatter;
          }

          if (data.katex) {
            DMath.katexOptions = data.katex;
          }
        }
      },

      DOMContentLoaded() {
        if (Controller.loaded) {
          console.warn(
            "Controller received DOMContentLoaded but was already loaded!"
          );
          return;
        } else if (!domContentLoaded()) {
          console.warn(
            "Controller received DOMContentLoaded at document.readyState: " +
              document.readyState +
              "!"
          );
          return;
        } else {
          Controller.loaded = true;
          console.debug("Runlevel 4: Controller running DOMContentLoaded");
        }

        const frontMatterTag = document.querySelector("d-front-matter");
        if (frontMatterTag) {
          const data = parseFrontmatter(frontMatterTag);
          Controller.listeners.onFrontMatterChanged({ detail: data });
        }

        // Resolving "citations" dependency due to initial DOM load
        frontMatter.citations = collect_citations();
        frontMatter.citationsCollected = true;
        for (const waitingCallback of Controller.waitingOn.citations.slice()) {
          waitingCallback();
        }

        if (frontMatter.bibliographyParsed) {
          for (const waitingCallback of Controller.waitingOn.bibliography.slice()) {
            waitingCallback();
          }
        }

        const footnotesList = document.querySelector("d-footnote-list");
        if (footnotesList) {
          const footnotes = document.querySelectorAll("d-footnote");
          footnotesList.footnotes = footnotes;
        }
      }
    } // listeners
  }; // Controller

  var custom = "/*#cover d-title {\n\tdisplay: flex;\n\talign-content: center;\n\tjustify-items: center;\n}*/";

  var base = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nhtml {\n  font-size: 14px;\n\tline-height: 1.6em;\n  /* font-family: \"Libre Franklin\", \"Helvetica Neue\", sans-serif; */\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", Arial, sans-serif;\n  /*, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";*/\n  text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n}\n\n@media(min-width: 768px) {\n  html {\n    font-size: 16px;\n  }\n}\n\nbody {\n  margin: 0;\n}\n\na {\n  color: #004276;\n}\n\nfigure {\n  margin: 0;\n}\n\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\ntable th {\n\ttext-align: left;\n}\n\ntable thead {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\n\ntable thead th {\n  padding-bottom: 0.5em;\n}\n\ntable tbody :first-child td {\n  padding-top: 0.5em;\n}\n\npre {\n  overflow: auto;\n  max-width: 100%;\n}\n\np {\n  margin-top: 0;\n  margin-bottom: 1em;\n}\n\nsup, sub {\n  vertical-align: baseline;\n  position: relative;\n  top: -0.4em;\n  line-height: 1em;\n}\n\nsub {\n  top: 0.4em;\n}\n\n.kicker,\n.marker {\n  font-size: 15px;\n  font-weight: 600;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n\n/* Headline */\n\n@media(min-width: 1024px) {\n  d-title h1 span {\n    display: block;\n  }\n}\n\n/* Figure */\n\nfigure {\n  position: relative;\n  margin-bottom: 2.5em;\n  margin-top: 1.5em;\n}\n\nfigcaption+figure {\n\n}\n\nfigure img {\n  width: 100%;\n}\n\nfigure svg text,\nfigure svg tspan {\n}\n\nfigcaption,\n.figcaption {\n  color: rgba(0, 0, 0, 0.6);\n  font-size: 12px;\n  line-height: 1.5em;\n}\n\n@media(min-width: 1024px) {\nfigcaption,\n.figcaption {\n    font-size: 13px;\n  }\n}\n\nfigure.external img {\n  background: white;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);\n  padding: 18px;\n  box-sizing: border-box;\n}\n\nfigcaption a {\n  color: rgba(0, 0, 0, 0.6);\n}\n\nfigcaption b,\nfigcaption strong, {\n  font-weight: 600;\n  color: rgba(0, 0, 0, 1.0);\n}\n";

  var layout = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n@supports not (display: grid) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    display: block;\n    padding: 8px;\n  }\n}\n\n.base-grid,\ndistill-header,\nd-title,\nd-abstract,\nd-article,\nd-appendix,\ndistill-appendix,\nd-byline,\nd-footnote-list,\nd-citation-list,\ndistill-footer {\n  display: grid;\n  justify-items: stretch;\n  grid-template-columns: [screen-start] 8px [page-start kicker-start text-start gutter-start middle-start] 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr [text-end page-end gutter-end kicker-end middle-end] 8px [screen-end];\n  grid-column-gap: 8px;\n}\n\n.grid {\n  display: grid;\n  grid-column-gap: 8px;\n}\n\n@media(min-width: 768px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start middle-start text-start] 45px 45px 45px 45px 45px 45px 45px 45px [ kicker-end text-end gutter-start] 45px [middle-end] 45px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 16px;\n  }\n\n  .grid {\n    grid-column-gap: 16px;\n  }\n}\n\n@media(min-width: 1000px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start] 50px [middle-start] 50px [text-start kicker-end] 50px 50px 50px 50px 50px 50px 50px 50px [text-end gutter-start] 50px [middle-end] 50px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 16px;\n  }\n\n  .grid {\n    grid-column-gap: 16px;\n  }\n}\n\n@media(min-width: 1180px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start] 60px [middle-start] 60px [text-start kicker-end] 60px 60px 60px 60px 60px 60px 60px 60px [text-end gutter-start] 60px [middle-end] 60px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 32px;\n  }\n\n  .grid {\n    grid-column-gap: 32px;\n  }\n}\n\n\n\n\n.base-grid {\n  grid-column: screen;\n}\n\n/* .l-body,\nd-article > *  {\n  grid-column: text;\n}\n\n.l-page,\nd-title > *,\nd-figure {\n  grid-column: page;\n} */\n\n.l-gutter {\n  grid-column: gutter;\n}\n\n.l-text,\n.l-body {\n  grid-column: text;\n}\n\n.l-page {\n  grid-column: page;\n}\n\n.l-body-outset {\n  grid-column: middle;\n}\n\n.l-page-outset {\n  grid-column: page;\n}\n\n.l-screen {\n  grid-column: screen;\n}\n\n.l-screen-inset {\n  grid-column: screen;\n  padding-left: 16px;\n  padding-left: 16px;\n}\n\n\n/* Aside */\n\nd-article aside {\n  grid-column: gutter;\n  font-size: 12px;\n  line-height: 1.6em;\n  color: rgba(0, 0, 0, 0.6)\n}\n\n@media(min-width: 768px) {\n  aside {\n    grid-column: gutter;\n  }\n\n  .side {\n    grid-column: gutter;\n  }\n}\n";

  var print = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n@media print {\n\n  @page {\n    size: 8in 11in;\n    @bottom-right {\n      content: counter(page) \" of \" counter(pages);\n    }\n  }\n\n  html {\n    /* no general margins -- CSS Grid takes care of those */\n  }\n\n  p, code {\n    page-break-inside: avoid;\n  }\n\n  h2, h3 {\n    page-break-after: avoid;\n  }\n\n  d-header {\n    visibility: hidden;\n  }\n\n  d-footer {\n    display: none!important;\n  }\n\n}\n";

  var byline = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-byline {\n  contain: style;\n  overflow: hidden;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  font-size: 0.8rem;\n  line-height: 1.8em;\n  padding: 1.5rem 0;\n  min-height: 1.8em;\n}\n\n\nd-byline .byline {\n  grid-template-columns: 1fr 1fr;\n  grid-column: text;\n}\n\n@media(min-width: 768px) {\n  d-byline .byline {\n    grid-template-columns: 1fr 1fr 1fr 1fr;\n  }\n}\n\nd-byline .authors-affiliations {\n  grid-column-end: span 2;\n  grid-template-columns: 1fr 1fr;\n  margin-bottom: 1em;\n}\n\n@media(min-width: 768px) {\n  d-byline .authors-affiliations {\n    margin-bottom: 0;\n  }\n}\n\nd-byline h3 {\n  font-size: 0.6rem;\n  font-weight: 400;\n  color: rgba(0, 0, 0, 0.5);\n  margin: 0;\n  text-transform: uppercase;\n}\n\nd-byline p {\n  margin: 0;\n}\n\nd-byline a,\nd-article d-byline a {\n  color: rgba(0, 0, 0, 0.8);\n  text-decoration: none;\n  border-bottom: none;\n}\n\nd-article d-byline a:hover {\n  text-decoration: underline;\n  border-bottom: none;\n}\n\nd-byline p.author {\n  font-weight: 500;\n}\n\nd-byline .affiliations {\n\n}\n";

  var article = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-article {\n  contain: layout style;\n  overflow-x: hidden;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  padding-top: 2rem;\n  color: rgba(0, 0, 0, 0.8);\n}\n\nd-article > * {\n  grid-column: text;\n}\n\n@media(min-width: 768px) {\n  d-article {\n    font-size: 16px;\n  }\n}\n\n@media(min-width: 1024px) {\n  d-article {\n    font-size: 1.06rem;\n    line-height: 1.7em;\n  }\n}\n\n\n/* H2 */\n\n\nd-article .marker {\n  text-decoration: none;\n  border: none;\n  counter-reset: section;\n  grid-column: kicker;\n  line-height: 1.7em;\n}\n\nd-article .marker:hover {\n  border: none;\n}\n\nd-article .marker span {\n  padding: 0 3px 4px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n  position: relative;\n  top: 4px;\n}\n\nd-article .marker:hover span {\n  color: rgba(0, 0, 0, 0.7);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.7);\n}\n\nd-article h2 {\n  font-weight: 600;\n  font-size: 24px;\n  line-height: 1.25em;\n  margin: 2rem 0 1.5rem 0;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\n  padding-bottom: 1rem;\n}\n\n@media(min-width: 1024px) {\n  d-article h2 {\n    font-size: 36px;\n  }\n}\n\n/* H3 */\n\nd-article h3 {\n  font-weight: 700;\n  font-size: 18px;\n  line-height: 1.4em;\n  margin-bottom: 1em;\n  margin-top: 2em;\n}\n\n@media(min-width: 1024px) {\n  d-article h3 {\n    font-size: 20px;\n  }\n}\n\n/* H4 */\n\nd-article h4 {\n  font-weight: 600;\n  text-transform: uppercase;\n  font-size: 14px;\n  line-height: 1.4em;\n}\n\nd-article a {\n  color: inherit;\n}\n\nd-article p,\nd-article ul,\nd-article ol,\nd-article blockquote {\n  margin-top: 0;\n  margin-bottom: 1em;\n  margin-left: 0;\n  margin-right: 0;\n}\n\nd-article blockquote {\n  border-left: 2px solid rgba(0, 0, 0, 0.2);\n  padding-left: 2em;\n  font-style: italic;\n  color: rgba(0, 0, 0, 0.6);\n}\n\nd-article a {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.4);\n  text-decoration: none;\n}\n\nd-article a:hover {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.8);\n}\n\nd-article .link {\n  text-decoration: underline;\n  cursor: pointer;\n}\n\nd-article ul,\nd-article ol {\n  padding-left: 24px;\n}\n\nd-article li {\n  margin-bottom: 1em;\n  margin-left: 0;\n  padding-left: 0;\n}\n\nd-article li:last-child {\n  margin-bottom: 0;\n}\n\nd-article pre {\n  font-size: 14px;\n  margin-bottom: 20px;\n}\n\nd-article hr {\n  grid-column: screen;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\n  margin-top: 60px;\n  margin-bottom: 60px;\n}\n\nd-article section {\n  margin-top: 60px;\n  margin-bottom: 60px;\n}\n\nd-article span.equation-mimic {\n  font-family: georgia;\n  font-size: 115%;\n  font-style: italic;\n}\n\nd-article > d-code,\nd-article section > d-code  {\n  display: block;\n}\n\nd-article > d-math[block],\nd-article section > d-math[block]  {\n  display: block;\n}\n\n@media (max-width: 768px) {\n  d-article > d-code,\n  d-article section > d-code,\n  d-article > d-math[block],\n  d-article section > d-math[block] {\n      overflow-x: scroll;\n      -ms-overflow-style: none;  // IE 10+\n      overflow: -moz-scrollbars-none;  // Firefox\n  }\n\n  d-article > d-code::-webkit-scrollbar,\n  d-article section > d-code::-webkit-scrollbar,\n  d-article > d-math[block]::-webkit-scrollbar,\n  d-article section > d-math[block]::-webkit-scrollbar {\n    display: none;  // Safari and Chrome\n  }\n}\n\nd-article .citation {\n  color: #668;\n  cursor: pointer;\n}\n\nd-include {\n  width: auto;\n  display: block;\n}\n\nd-figure {\n  contain: layout style;\n}\n\n/* KaTeX */\n\n.katex, .katex-prerendered {\n  contain: style;\n  display: inline-block;\n}\n\n/* Tables */\n\nd-article table {\n  border-collapse: collapse;\n  margin-bottom: 1.5rem;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n}\n\nd-article table th {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n}\n\nd-article table td {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\n\nd-article table tr:last-of-type td {\n  border-bottom: none;\n}\n\nd-article table th,\nd-article table td {\n  font-size: 15px;\n  padding: 2px 8px;\n}\n\nd-article table tbody :first-child td {\n  padding-top: 2px;\n}\n";

  var title = "/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-title {\n  padding: 2rem 0 1.5rem;\n  contain: layout style;\n  overflow-x: hidden;\n}\n\n@media(min-width: 768px) {\n  d-title {\n    padding: 4rem 0 1.5rem;\n  }\n}\n\nd-title h1 {\n  grid-column: text;\n  font-size: 40px;\n  font-weight: 700;\n  line-height: 1.1em;\n  margin: 0 0 0.5rem;\n}\n\n@media(min-width: 768px) {\n  d-title h1 {\n    font-size: 50px;\n  }\n}\n\nd-title p {\n  font-weight: 300;\n  font-size: 1.2rem;\n  line-height: 1.55em;\n  grid-column: text;\n}\n\nd-title .status {\n  margin-top: 0px;\n  font-size: 12px;\n  color: #009688;\n  opacity: 0.8;\n  grid-column: kicker;\n}\n\nd-title .status span {\n  line-height: 1;\n  display: inline-block;\n  padding: 6px 0;\n  border-bottom: 1px solid #80cbc4;\n  font-size: 11px;\n  text-transform: uppercase;\n}\n";

  // Copyright 2018 The Distill Template Authors

  const styles$2 = custom + base + layout + title + byline + article + math + print;

  function makeStyleTag(dom) {

    const styleTagId = 'distill-prerendered-styles';
    const prerenderedTag = dom.getElementById(styleTagId);
    if (!prerenderedTag) {
      const styleTag = dom.createElement('style');
      styleTag.id = styleTagId;
      styleTag.type = 'text/css';
      const cssTextTag = dom.createTextNode(styles$2);
      styleTag.appendChild(cssTextTag);
      const firstScriptTag = dom.head.querySelector('script');
      dom.head.insertBefore(styleTag, firstScriptTag);
    }

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function addPolyfill(polyfill, polyfillLoadedCallback) {
    console.debug('Runlevel 0: Polyfill required: ' + polyfill.name);
    const script = document.createElement('script');
    script.src = polyfill.url;
    script.async = false;
    if (polyfillLoadedCallback) {
      script.onload = function() { polyfillLoadedCallback(polyfill); };
    }
    script.onerror = function() {
      new Error('Runlevel 0: Polyfills failed to load script ' + polyfill.name);
    };
    document.head.appendChild(script);
  }

  const polyfills = [
    {
      name: 'WebComponents',
      support: function() {
        return 'customElements' in window &&
               'attachShadow' in Element.prototype &&
               'getRootNode' in Element.prototype &&
               'content' in document.createElement('template') &&
               'Promise' in window &&
               'from' in Array;
      },
      url: 'https://distill.pub/third-party/polyfills/webcomponents-lite.js'
    }, {
      name: 'IntersectionObserver',
      support: function() {
        return 'IntersectionObserver' in window &&
               'IntersectionObserverEntry' in window;
      },
      url: 'https://distill.pub/third-party/polyfills/intersection-observer.js'
    },
  ];

  class Polyfills {

    static browserSupportsAllFeatures() {
      return polyfills.every((poly) => poly.support());
    }

    static load(callback) {
      // Define an intermediate callback that checks if all is loaded.
      const polyfillLoaded = function(polyfill) {
        polyfill.loaded = true;
        console.debug('Runlevel 0: Polyfill has finished loading: ' + polyfill.name);
        // console.debug(window[polyfill.name]);
        if (Polyfills.neededPolyfills.every((poly) => poly.loaded)) {
          console.debug('Runlevel 0: All required polyfills have finished loading.');
          console.debug('Runlevel 0->1.');
          window.distillRunlevel = 1;
          callback();
        }
      };
      // Add polyfill script tags
      for (const polyfill of Polyfills.neededPolyfills) {
        addPolyfill(polyfill, polyfillLoaded);
      }
    }

    static get neededPolyfills() {
      if (!Polyfills._neededPolyfills) {
        Polyfills._neededPolyfills = polyfills.filter((poly) => !poly.support());
      }
      return Polyfills._neededPolyfills;
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // const marginSmall = 16;
  // const marginLarge = 3 * marginSmall;
  // const margin = marginSmall + marginLarge;
  // const gutter = marginSmall;
  // const outsetAmount = margin / 2;
  // const numCols = 4;
  // const numGutters = numCols - 1;
  // const columnWidth = (768 - 2 * marginLarge - numGutters * gutter) / numCols;
  //
  // const screenwidth = 768;
  // const pageWidth = screenwidth - 2 * marginLarge;
  // const bodyWidth = pageWidth - columnWidth - gutter;

  function body(selector) {
    return `${selector} {
      grid-column: left / text;
    }
  `;
  }

  // Copyright 2018 The Distill Template Authors

  const T$b = Template('d-abstract', `
<style>
  :host {
    font-size: 1.25rem;
    line-height: 1.6em;
    color: rgba(0, 0, 0, 0.7);
    -webkit-font-smoothing: antialiased;
  }

  ::slotted(p) {
    margin-top: 0;
    margin-bottom: 1em;
    grid-column: text-start / middle-end;
  }
  ${body('d-abstract')}
</style>

<slot></slot>
`);

  class Abstract extends T$b(HTMLElement) {

  }

  // Copyright 2018 The Distill Template Authors

  const T$a = Template('d-appendix', `
<style>

d-appendix {
  contain: layout style;
  font-size: 0.8em;
  line-height: 1.7em;
  margin-top: 60px;
  margin-bottom: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0,0,0,0.5);
  padding-top: 60px;
  padding-bottom: 48px;
}

d-appendix h3 {
  grid-column: page-start / text-start;
  font-size: 15px;
  font-weight: 500;
  margin-top: 1em;
  margin-bottom: 0;
  color: rgba(0,0,0,0.65);
}

d-appendix h3 + * {
  margin-top: 1em;
}

d-appendix ol {
  padding: 0 0 0 15px;
}

@media (min-width: 768px) {
  d-appendix ol {
    padding: 0 0 0 30px;
    margin-left: -30px;
  }
}

d-appendix li {
  margin-bottom: 1em;
}

d-appendix a {
  color: rgba(0, 0, 0, 0.6);
}

d-appendix > * {
  grid-column: text;
}

d-appendix > d-footnote-list,
d-appendix > d-citation-list,
d-appendix > distill-appendix {
  grid-column: screen;
}

</style>

`, false);

  class Appendix extends T$a(HTMLElement) {

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // import { Template } from '../mixins/template';
  // import { Controller } from '../controller';

  const isOnlyWhitespace = /^\s*$/;

  class Article extends HTMLElement {
    static get is() { return 'd-article'; }

    constructor() {
      super();

      new MutationObserver( (mutations) => {
        for (const mutation of mutations) {
          for (const addedNode of mutation.addedNodes) {
            switch (addedNode.nodeName) {
            case '#text': { // usually text nodes are only linebreaks.
              const text = addedNode.nodeValue;
              if (!isOnlyWhitespace.test(text)) {
                console.warn('Use of unwrapped text in distill articles is discouraged as it breaks layout! Please wrap any text in a <span> or <p> tag. We found the following text: ' + text);
                const wrapper = document.createElement('span');
                wrapper.innerHTML = addedNode.nodeValue;
                addedNode.parentNode.insertBefore(wrapper, addedNode);
                addedNode.parentNode.removeChild(addedNode);
              }
            } break;
            }
          }
        }
      }).observe(this, {childList: true});
    }

  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var bibtexParse = createCommonjsModule(function (module, exports) {
  /* start bibtexParse 0.0.22 */

  //Original work by Henrik Muehe (c) 2010
  //
  //CommonJS port by Mikola Lysenko 2013
  //
  //Port to Browser lib by ORCID / RCPETERS
  //
  //Issues:
  //no comment handling within strings
  //no string concatenation
  //no variable values yet
  //Grammar implemented here:
  //bibtex -> (string | preamble | comment | entry)*;
  //string -> '@STRING' '{' key_equals_value '}';
  //preamble -> '@PREAMBLE' '{' value '}';
  //comment -> '@COMMENT' '{' value '}';
  //entry -> '@' key '{' key ',' key_value_list '}';
  //key_value_list -> key_equals_value (',' key_equals_value)*;
  //key_equals_value -> key '=' value;
  //value -> value_quotes | value_braces | key;
  //value_quotes -> '"' .*? '"'; // not quite
  //value_braces -> '{' .*? '"'; // not quite
  (function(exports) {

      function BibtexParser() {
          
          this.months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          this.notKey = [',','{','}',' ','='];
          this.pos = 0;
          this.input = "";
          this.entries = new Array();

          this.currentEntry = "";

          this.setInput = function(t) {
              this.input = t;
          };

          this.getEntries = function() {
              return this.entries;
          };

          this.isWhitespace = function(s) {
              return (s == ' ' || s == '\r' || s == '\t' || s == '\n');
          };

          this.match = function(s, canCommentOut) {
              if (canCommentOut == undefined || canCommentOut == null)
                  canCommentOut = true;
              this.skipWhitespace(canCommentOut);
              if (this.input.substring(this.pos, this.pos + s.length) == s) {
                  this.pos += s.length;
              } else {
                  throw "Token mismatch, expected " + s + ", found "
                          + this.input.substring(this.pos);
              }            this.skipWhitespace(canCommentOut);
          };

          this.tryMatch = function(s, canCommentOut) {
              if (canCommentOut == undefined || canCommentOut == null)
                  canCommentOut = true;
              this.skipWhitespace(canCommentOut);
              if (this.input.substring(this.pos, this.pos + s.length) == s) {
                  return true;
              } else {
                  return false;
              }        };

          /* when search for a match all text can be ignored, not just white space */
          this.matchAt = function() {
              while (this.input.length > this.pos && this.input[this.pos] != '@') {
                  this.pos++;
              }
              if (this.input[this.pos] == '@') {
                  return true;
              }            return false;
          };

          this.skipWhitespace = function(canCommentOut) {
              while (this.isWhitespace(this.input[this.pos])) {
                  this.pos++;
              }            if (this.input[this.pos] == "%" && canCommentOut == true) {
                  while (this.input[this.pos] != "\n") {
                      this.pos++;
                  }                this.skipWhitespace(canCommentOut);
              }        };

          this.value_braces = function() {
              var bracecount = 0;
              this.match("{", false);
              var start = this.pos;
              var escaped = false;
              while (true) {
                  if (!escaped) {
                      if (this.input[this.pos] == '}') {
                          if (bracecount > 0) {
                              bracecount--;
                          } else {
                              var end = this.pos;
                              this.match("}", false);
                              return this.input.substring(start, end);
                          }                    } else if (this.input[this.pos] == '{') {
                          bracecount++;
                      } else if (this.pos >= this.input.length - 1) {
                          throw "Unterminated value";
                      }                }                if (this.input[this.pos] == '\\' && escaped == false)
                      escaped = true;
                  else
                      escaped = false;
                  this.pos++;
              }        };

          this.value_comment = function() {
              var str = '';
              var brcktCnt = 0;
              while (!(this.tryMatch("}", false) && brcktCnt == 0)) {
                  str = str + this.input[this.pos];
                  if (this.input[this.pos] == '{')
                      brcktCnt++;
                  if (this.input[this.pos] == '}')
                      brcktCnt--;
                  if (this.pos >= this.input.length - 1) {
                      throw "Unterminated value:" + this.input.substring(start);
                  }                this.pos++;
              }            return str;
          };

          this.value_quotes = function() {
              this.match('"', false);
              var start = this.pos;
              var escaped = false;
              while (true) {
                  if (!escaped) {
                      if (this.input[this.pos] == '"') {
                          var end = this.pos;
                          this.match('"', false);
                          return this.input.substring(start, end);
                      } else if (this.pos >= this.input.length - 1) {
                          throw "Unterminated value:" + this.input.substring(start);
                      }                }
                  if (this.input[this.pos] == '\\' && escaped == false)
                      escaped = true;
                  else
                      escaped = false;
                  this.pos++;
              }        };

          this.single_value = function() {
              var start = this.pos;
              if (this.tryMatch("{")) {
                  return this.value_braces();
              } else if (this.tryMatch('"')) {
                  return this.value_quotes();
              } else {
                  var k = this.key();
                  if (k.match("^[0-9]+$"))
                      return k;
                  else if (this.months.indexOf(k.toLowerCase()) >= 0)
                      return k.toLowerCase();
                  else
                      throw "Value expected:" + this.input.substring(start) + ' for key: ' + k;
              
              }        };

          this.value = function() {
              var values = [];
              values.push(this.single_value());
              while (this.tryMatch("#")) {
                  this.match("#");
                  values.push(this.single_value());
              }            return values.join("");
          };

          this.key = function() {
              var start = this.pos;
              while (true) {
                  if (this.pos >= this.input.length) {
                      throw "Runaway key";
                  }                                // а-яА-Я is Cyrillic
                  //console.log(this.input[this.pos]);
                  if (this.notKey.indexOf(this.input[this.pos]) >= 0) {
                      return this.input.substring(start, this.pos);
                  } else {
                      this.pos++;
                      
                  }            }        };

          this.key_equals_value = function() {
              var key = this.key();
              if (this.tryMatch("=")) {
                  this.match("=");
                  var val = this.value();
                  return [ key, val ];
              } else {
                  throw "... = value expected, equals sign missing:"
                          + this.input.substring(this.pos);
              }        };

          this.key_value_list = function() {
              var kv = this.key_equals_value();
              this.currentEntry['entryTags'] = {};
              this.currentEntry['entryTags'][kv[0]] = kv[1];
              while (this.tryMatch(",")) {
                  this.match(",");
                  // fixes problems with commas at the end of a list
                  if (this.tryMatch("}")) {
                      break;
                  }
                  kv = this.key_equals_value();
                  this.currentEntry['entryTags'][kv[0]] = kv[1];
              }        };

          this.entry_body = function(d) {
              this.currentEntry = {};
              this.currentEntry['citationKey'] = this.key();
              this.currentEntry['entryType'] = d.substring(1);
              this.match(",");
              this.key_value_list();
              this.entries.push(this.currentEntry);
          };

          this.directive = function() {
              this.match("@");
              return "@" + this.key();
          };

          this.preamble = function() {
              this.currentEntry = {};
              this.currentEntry['entryType'] = 'PREAMBLE';
              this.currentEntry['entry'] = this.value_comment();
              this.entries.push(this.currentEntry);
          };

          this.comment = function() {
              this.currentEntry = {};
              this.currentEntry['entryType'] = 'COMMENT';
              this.currentEntry['entry'] = this.value_comment();
              this.entries.push(this.currentEntry);
          };

          this.entry = function(d) {
              this.entry_body(d);
          };

          this.bibtex = function() {
              while (this.matchAt()) {
                  var d = this.directive();
                  this.match("{");
                  if (d == "@STRING") {
                      this.string();
                  } else if (d == "@PREAMBLE") {
                      this.preamble();
                  } else if (d == "@COMMENT") {
                      this.comment();
                  } else {
                      this.entry(d);
                  }
                  this.match("}");
              }        };
      }    
      exports.toJSON = function(bibtex) {
          var b = new BibtexParser();
          b.setInput(bibtex);
          b.bibtex();
          return b.entries;
      };

      /* added during hackathon don't hate on me */
      exports.toBibtex = function(json) {
          var out = '';
          for ( var i in json) {
              out += "@" + json[i].entryType;
              out += '{';
              if (json[i].citationKey)
                  out += json[i].citationKey + ', ';
              if (json[i].entry)
                  out += json[i].entry ;
              if (json[i].entryTags) {
                  var tags = '';
                  for (var jdx in json[i].entryTags) {
                      if (tags.length != 0)
                          tags += ', ';
                      tags += jdx + '= {' + json[i].entryTags[jdx] + '}';
                  }
                  out += tags;
              }
              out += '}\n\n';
          }
          return out;
          
      };

  })(exports);

  /* end bibtexParse */
  });

  // Copyright 2018 The Distill Template Authors

  function normalizeTag(string) {
    return string
      .replace(/[\t\n ]+/g, ' ')
      .replace(/{\\["^`.'acu~Hvs]( )?([a-zA-Z])}/g, (full, x, char) => char)
      .replace(/{\\([a-zA-Z])}/g, (full, char) => char)
      .replace(/[{}]/gi,'');  // Replace curly braces forcing plaintext in latex.
  }

  function parseBibtex(bibtex) {
    const bibliography = new Map();
    const parsedEntries = bibtexParse.toJSON(bibtex);
    for (const entry of parsedEntries) {
      // normalize tags; note entryTags is an object, not Map
      for (const [key, value] of Object.entries(entry.entryTags)) {
        entry.entryTags[key.toLowerCase()] = normalizeTag(value);
      }
      entry.entryTags.type = entry.entryType;
      // add to bibliography
      bibliography.set(entry.citationKey, entry.entryTags);
    }
    return bibliography;
  }

  function serializeFrontmatterToBibtex(frontMatter) {
    return `@article{${frontMatter.slug},
  author = {${frontMatter.bibtexAuthors}},
  title = {${frontMatter.title}},
  journal = {${frontMatter.journal.title}},
  year = {${frontMatter.publishedYear}},
  note = {${frontMatter.url}},
  doi = {${frontMatter.doi}}
}`;
  }

  // Copyright 2018 The Distill Template Authors

  class Bibliography extends HTMLElement {

    static get is() { return 'd-bibliography'; }

    constructor() {
      super();

      // set up mutation observer
      const options = {childList: true, characterData: true, subtree: true};
      const observer = new MutationObserver( (entries) => {
        for (const entry of entries) {
          if (entry.target.nodeName === 'SCRIPT' || entry.type === 'characterData') {
            this.parseIfPossible();
          }
        }
      });
      observer.observe(this, options);
    }

    connectedCallback() {
      requestAnimationFrame(() => {
        this.parseIfPossible();
      });
    }

    parseIfPossible() {
      const scriptTag = this.querySelector('script');
      if (!scriptTag) return;
      if (scriptTag.type == 'text/bibtex') {
        const newBibtex = scriptTag.textContent;
        if (this.bibtex !== newBibtex) {
          this.bibtex = newBibtex;
          const bibliography = parseBibtex(this.bibtex);
          this.notify(bibliography);
        }
      } else if (scriptTag.type == 'text/json') {
        const bibliography = new Map(JSON.parse(scriptTag.textContent));
        this.notify(bibliography);
      } else {
        console.warn('Unsupported bibliography script tag type: ' + scriptTag.type);
      }
    }

    notify(bibliography) {
      const options = { detail: bibliography, bubbles: true };
      const event = new CustomEvent('onBibliographyChanged', options);
      this.dispatchEvent(event);
    }

    /* observe 'src' attribute */

    static get observedAttributes() {
      return ['src'];
    }

    receivedBibtex(event) {
      const bibliography = parseBibtex(event.target.response);
      this.notify(bibliography);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      var oReq = new XMLHttpRequest();
      oReq.onload = (e) => this.receivedBibtex(e);
      oReq.onerror = () => console.warn(`Could not load Bibtex! (tried ${newValue})`);
      oReq.responseType = 'text';
      oReq.open('GET', newValue, true);
      oReq.send();
    }


  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // import style from '../styles/d-byline.css';

  function bylineTemplate(frontMatter) {
    return `
  <div class="byline grid">
    <div class="authors-affiliations grid">
      <h3>Authors</h3>
      <h3>Affiliations</h3>
      ${frontMatter.authors.map(author => `
        <p class="author">
          ${author.personalURL ? `
            <a class="name" href="${author.personalURL}" target="_blank">${author.name}</a>` : `
            <span class="name">${author.name}</span>`}
        </p>
        <p class="affiliation">
        ${author.affiliations.map(affiliation =>
          affiliation.url ? `<a class="affiliation" href="${affiliation.url}" target="_blank">${affiliation.name}</a>` : `<span class="affiliation">${affiliation.name}</span>`
        ).join(', ')}
        </p>
      `).join('')}
    </div>
    <div>
      <h3>Published</h3>
      ${frontMatter.publishedDate ? `
        <p>${frontMatter.publishedMonth} ${frontMatter.publishedDay}, ${frontMatter.publishedYear}</p> ` : `
        <p><em>Not published yet.</em></p>`}
    </div>
    <div>
      <h3>Full paper</h3>
      ${frontMatter.pubUrl ? `
        <p><a href="${frontMatter.pubUrl}" target="_blank">${frontMatter.pubVenue}</a></p>` : `
        <p></p>`}
    </div>
  </div>
`;
  }

  class Byline extends HTMLElement {

    static get is() { return 'd-byline'; }

    set frontMatter(frontMatter) {
      this.innerHTML = bylineTemplate(frontMatter);
    }

  }

  // Copyright 2018 The Distill Template Authors

  const T$9 = Template(
    "d-cite",
    `
<style>

:host {
  display: inline-block;
}

.citation {
  color: hsla(206, 90%, 20%, 0.7);
}

.citation-number {
  cursor: default;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Roboto", Helvetica, sans-serif;
  font-size: 75%;
  color: hsla(206, 90%, 20%, 0.7);
  display: inline-block;
  line-height: 1.1em;
  text-align: center;
  position: relative;
  top: -2px;
  margin: 0 2px;
}

figcaption .citation-number {
  font-size: 11px;
  font-weight: normal;
  top: -2px;
  line-height: 1em;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  padding: 15px 10px 15px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.1)
}

ul li:last-of-type {
  border-bottom: none;
}

</style>

<d-hover-box id="hover-box"></d-hover-box>

<div id="citation-" class="citation">
  <span class="citation-number"></span>
</div>
`
  );

  class Cite extends T$9(HTMLElement) {
    /* Lifecycle */
    constructor() {
      super();
      this._numbers = [];
      this._entries = [];
    }

    connectedCallback() {
      this.outerSpan = this.root.querySelector("#citation-");
      this.innerSpan = this.root.querySelector(".citation-number");
      this.hoverBox = this.root.querySelector("d-hover-box");
      window.customElements.whenDefined("d-hover-box").then(() => {
        this.hoverBox.listen(this);
      });
      // in case this component got connected after values were set
      if (this.numbers) {
        this.displayNumbers(this.numbers);
      }
      if (this.entries) {
        this.displayEntries(this.entries);
      }
    }

    //TODO This causes an infinite loop on firefox with polyfills.
    // This is only needed for interactive editing so no priority.
    // disconnectedCallback() {
    // const options = { detail: [this, this.keys], bubbles: true };
    // const event = new CustomEvent('onCiteKeyRemoved', options);
    // document.dispatchEvent(event);
    // }

    /* observe 'key' attribute */

    static get observedAttributes() {
      return ["key", "bibtex-key"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const eventName = oldValue ? "onCiteKeyChanged" : "onCiteKeyCreated";
      const keys = newValue.split(",").map(k => k.trim());
      const options = { detail: [this, keys], bubbles: true };
      const event = new CustomEvent(eventName, options);
      document.dispatchEvent(event);
    }

    set key(value) {
      this.setAttribute("key", value);
    }

    get key() {
      return this.getAttribute("key") || this.getAttribute("bibtex-key");
    }

    get keys() {
      const result = this.key.split(",");
      console.log(result);
      return result;
    }

    /* Setters & Rendering */

    set numbers(numbers) {
      this._numbers = numbers;
      this.displayNumbers(numbers);
    }

    get numbers() {
      return this._numbers;
    }

    displayNumbers(numbers) {
      if (!this.innerSpan) return;
      const numberStrings = numbers.map(index => {
        return index == -1 ? "?" : index + 1 + "";
      });
      const textContent = "[" + numberStrings.join(", ") + "]";
      this.innerSpan.textContent = textContent;
    }

    set entries(entries) {
      this._entries = entries;
      this.displayEntries(entries);
    }

    get entries() {
      return this._entries;
    }

    displayEntries(entries) {
      if (!this.hoverBox) return;
      this.hoverBox.innerHTML = `<ul>
      ${entries
        .map(hover_cite)
        .map(html => `<li>${html}</li>`)
        .join("\n")}
    </ul>`;
    }
  }

  // Copyright 2018 The Distill Template Authors

  const styles$1 = `
d-citation-list {
  contain: style;
}

d-citation-list .references {
  grid-column: text;
}

d-citation-list .references .title {
  font-weight: 500;
}
`;

  function renderCitationList(element, entries, dom=document) {
    if (entries.size > 0) {
      element.style.display = '';
      let list = element.querySelector('.references');
      if (list) {
        list.innerHTML = '';
      } else {
        const stylesTag = dom.createElement('style');
        stylesTag.innerHTML = styles$1;
        element.appendChild(stylesTag);

        const heading = dom.createElement('h3');
        heading.id = 'references';
        heading.textContent = 'References';
        element.appendChild(heading);

        list = dom.createElement('ol');
        list.id = 'references-list';
        list.className = 'references';
        element.appendChild(list);
      }

      for (const [key, entry] of entries) {
        const listItem = dom.createElement('li');
        listItem.id = key;
        listItem.innerHTML = bibliography_cite(entry);
        list.appendChild(listItem);
      }
    } else {
      element.style.display = 'none';
    }
  }

  class CitationList extends HTMLElement {

    static get is() { return 'd-citation-list'; }

    connectedCallback() {
      if (!this.hasAttribute('distill-prerendered')) {
        this.style.display = 'none';
      }
    }

    set citations(citations) {
      renderCitationList(this, citations);
    }

  }

  var prism = createCommonjsModule(function (module) {
  /* **********************************************
       Begin prism-core.js
  ********************************************** */

  /// <reference lib="WebWorker"/>

  var _self = (typeof window !== 'undefined')
  	? window   // if in browser
  	: (
  		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
  			? self // if in worker
  			: {}   // if in node js
  	);

  /**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   */
  var Prism = (function (_self) {

  	// Private helper vars
  	var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
  	var uniqueId = 0;

  	// The grammar object for plaintext
  	var plainTextGrammar = {};


  	var _ = {
  		/**
  		 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
  		 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
  		 * additional languages or plugins yourself.
  		 *
  		 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
  		 *
  		 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
  		 * empty Prism object into the global scope before loading the Prism script like this:
  		 *
  		 * ```js
  		 * window.Prism = window.Prism || {};
  		 * Prism.manual = true;
  		 * // add a new <script> to load Prism's script
  		 * ```
  		 *
  		 * @default false
  		 * @type {boolean}
  		 * @memberof Prism
  		 * @public
  		 */
  		manual: _self.Prism && _self.Prism.manual,
  		/**
  		 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
  		 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
  		 * own worker, you don't want it to do this.
  		 *
  		 * By setting this value to `true`, Prism will not add its own listeners to the worker.
  		 *
  		 * You obviously have to change this value before Prism executes. To do this, you can add an
  		 * empty Prism object into the global scope before loading the Prism script like this:
  		 *
  		 * ```js
  		 * window.Prism = window.Prism || {};
  		 * Prism.disableWorkerMessageHandler = true;
  		 * // Load Prism's script
  		 * ```
  		 *
  		 * @default false
  		 * @type {boolean}
  		 * @memberof Prism
  		 * @public
  		 */
  		disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

  		/**
  		 * A namespace for utility methods.
  		 *
  		 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
  		 * change or disappear at any time.
  		 *
  		 * @namespace
  		 * @memberof Prism
  		 */
  		util: {
  			encode: function encode(tokens) {
  				if (tokens instanceof Token) {
  					return new Token(tokens.type, encode(tokens.content), tokens.alias);
  				} else if (Array.isArray(tokens)) {
  					return tokens.map(encode);
  				} else {
  					return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
  				}
  			},

  			/**
  			 * Returns the name of the type of the given value.
  			 *
  			 * @param {any} o
  			 * @returns {string}
  			 * @example
  			 * type(null)      === 'Null'
  			 * type(undefined) === 'Undefined'
  			 * type(123)       === 'Number'
  			 * type('foo')     === 'String'
  			 * type(true)      === 'Boolean'
  			 * type([1, 2])    === 'Array'
  			 * type({})        === 'Object'
  			 * type(String)    === 'Function'
  			 * type(/abc+/)    === 'RegExp'
  			 */
  			type: function (o) {
  				return Object.prototype.toString.call(o).slice(8, -1);
  			},

  			/**
  			 * Returns a unique number for the given object. Later calls will still return the same number.
  			 *
  			 * @param {Object} obj
  			 * @returns {number}
  			 */
  			objId: function (obj) {
  				if (!obj['__id']) {
  					Object.defineProperty(obj, '__id', { value: ++uniqueId });
  				}
  				return obj['__id'];
  			},

  			/**
  			 * Creates a deep clone of the given object.
  			 *
  			 * The main intended use of this function is to clone language definitions.
  			 *
  			 * @param {T} o
  			 * @param {Record<number, any>} [visited]
  			 * @returns {T}
  			 * @template T
  			 */
  			clone: function deepClone(o, visited) {
  				visited = visited || {};

  				var clone; var id;
  				switch (_.util.type(o)) {
  					case 'Object':
  						id = _.util.objId(o);
  						if (visited[id]) {
  							return visited[id];
  						}
  						clone = /** @type {Record<string, any>} */ ({});
  						visited[id] = clone;

  						for (var key in o) {
  							if (o.hasOwnProperty(key)) {
  								clone[key] = deepClone(o[key], visited);
  							}
  						}

  						return /** @type {any} */ (clone);

  					case 'Array':
  						id = _.util.objId(o);
  						if (visited[id]) {
  							return visited[id];
  						}
  						clone = [];
  						visited[id] = clone;

  						(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
  							clone[i] = deepClone(v, visited);
  						});

  						return /** @type {any} */ (clone);

  					default:
  						return o;
  				}
  			},

  			/**
  			 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
  			 *
  			 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
  			 *
  			 * @param {Element} element
  			 * @returns {string}
  			 */
  			getLanguage: function (element) {
  				while (element) {
  					var m = lang.exec(element.className);
  					if (m) {
  						return m[1].toLowerCase();
  					}
  					element = element.parentElement;
  				}
  				return 'none';
  			},

  			/**
  			 * Sets the Prism `language-xxxx` class of the given element.
  			 *
  			 * @param {Element} element
  			 * @param {string} language
  			 * @returns {void}
  			 */
  			setLanguage: function (element, language) {
  				// remove all `language-xxxx` classes
  				// (this might leave behind a leading space)
  				element.className = element.className.replace(RegExp(lang, 'gi'), '');

  				// add the new `language-xxxx` class
  				// (using `classList` will automatically clean up spaces for us)
  				element.classList.add('language-' + language);
  			},

  			/**
  			 * Returns the script element that is currently executing.
  			 *
  			 * This does __not__ work for line script element.
  			 *
  			 * @returns {HTMLScriptElement | null}
  			 */
  			currentScript: function () {
  				if (typeof document === 'undefined') {
  					return null;
  				}
  				if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
  					return /** @type {any} */ (document.currentScript);
  				}

  				// IE11 workaround
  				// we'll get the src of the current script by parsing IE11's error stack trace
  				// this will not work for inline scripts

  				try {
  					throw new Error();
  				} catch (err) {
  					// Get file src url from stack. Specifically works with the format of stack traces in IE.
  					// A stack will look like this:
  					//
  					// Error
  					//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
  					//    at Global code (http://localhost/components/prism-core.js:606:1)

  					var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
  					if (src) {
  						var scripts = document.getElementsByTagName('script');
  						for (var i in scripts) {
  							if (scripts[i].src == src) {
  								return scripts[i];
  							}
  						}
  					}
  					return null;
  				}
  			},

  			/**
  			 * Returns whether a given class is active for `element`.
  			 *
  			 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
  			 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
  			 * given class is just the given class with a `no-` prefix.
  			 *
  			 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
  			 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
  			 * ancestors have the given class or the negated version of it, then the default activation will be returned.
  			 *
  			 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
  			 * version of it, the class is considered active.
  			 *
  			 * @param {Element} element
  			 * @param {string} className
  			 * @param {boolean} [defaultActivation=false]
  			 * @returns {boolean}
  			 */
  			isActive: function (element, className, defaultActivation) {
  				var no = 'no-' + className;

  				while (element) {
  					var classList = element.classList;
  					if (classList.contains(className)) {
  						return true;
  					}
  					if (classList.contains(no)) {
  						return false;
  					}
  					element = element.parentElement;
  				}
  				return !!defaultActivation;
  			}
  		},

  		/**
  		 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
  		 *
  		 * @namespace
  		 * @memberof Prism
  		 * @public
  		 */
  		languages: {
  			/**
  			 * The grammar for plain, unformatted text.
  			 */
  			plain: plainTextGrammar,
  			plaintext: plainTextGrammar,
  			text: plainTextGrammar,
  			txt: plainTextGrammar,

  			/**
  			 * Creates a deep copy of the language with the given id and appends the given tokens.
  			 *
  			 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
  			 * will be overwritten at its original position.
  			 *
  			 * ## Best practices
  			 *
  			 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
  			 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
  			 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
  			 *
  			 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
  			 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
  			 *
  			 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
  			 * @param {Grammar} redef The new tokens to append.
  			 * @returns {Grammar} The new language created.
  			 * @public
  			 * @example
  			 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
  			 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
  			 *     // at its original position
  			 *     'comment': { ... },
  			 *     // CSS doesn't have a 'color' token, so this token will be appended
  			 *     'color': /\b(?:red|green|blue)\b/
  			 * });
  			 */
  			extend: function (id, redef) {
  				var lang = _.util.clone(_.languages[id]);

  				for (var key in redef) {
  					lang[key] = redef[key];
  				}

  				return lang;
  			},

  			/**
  			 * Inserts tokens _before_ another token in a language definition or any other grammar.
  			 *
  			 * ## Usage
  			 *
  			 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
  			 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
  			 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
  			 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
  			 * this:
  			 *
  			 * ```js
  			 * Prism.languages.markup.style = {
  			 *     // token
  			 * };
  			 * ```
  			 *
  			 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
  			 * before existing tokens. For the CSS example above, you would use it like this:
  			 *
  			 * ```js
  			 * Prism.languages.insertBefore('markup', 'cdata', {
  			 *     'style': {
  			 *         // token
  			 *     }
  			 * });
  			 * ```
  			 *
  			 * ## Special cases
  			 *
  			 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
  			 * will be ignored.
  			 *
  			 * This behavior can be used to insert tokens after `before`:
  			 *
  			 * ```js
  			 * Prism.languages.insertBefore('markup', 'comment', {
  			 *     'comment': Prism.languages.markup.comment,
  			 *     // tokens after 'comment'
  			 * });
  			 * ```
  			 *
  			 * ## Limitations
  			 *
  			 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
  			 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
  			 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
  			 * deleting properties which is necessary to insert at arbitrary positions.
  			 *
  			 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
  			 * Instead, it will create a new object and replace all references to the target object with the new one. This
  			 * can be done without temporarily deleting properties, so the iteration order is well-defined.
  			 *
  			 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
  			 * you hold the target object in a variable, then the value of the variable will not change.
  			 *
  			 * ```js
  			 * var oldMarkup = Prism.languages.markup;
  			 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
  			 *
  			 * assert(oldMarkup !== Prism.languages.markup);
  			 * assert(newMarkup === Prism.languages.markup);
  			 * ```
  			 *
  			 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
  			 * object to be modified.
  			 * @param {string} before The key to insert before.
  			 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
  			 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
  			 * object to be modified.
  			 *
  			 * Defaults to `Prism.languages`.
  			 * @returns {Grammar} The new grammar object.
  			 * @public
  			 */
  			insertBefore: function (inside, before, insert, root) {
  				root = root || /** @type {any} */ (_.languages);
  				var grammar = root[inside];
  				/** @type {Grammar} */
  				var ret = {};

  				for (var token in grammar) {
  					if (grammar.hasOwnProperty(token)) {

  						if (token == before) {
  							for (var newToken in insert) {
  								if (insert.hasOwnProperty(newToken)) {
  									ret[newToken] = insert[newToken];
  								}
  							}
  						}

  						// Do not insert token which also occur in insert. See #1525
  						if (!insert.hasOwnProperty(token)) {
  							ret[token] = grammar[token];
  						}
  					}
  				}

  				var old = root[inside];
  				root[inside] = ret;

  				// Update references in other language definitions
  				_.languages.DFS(_.languages, function (key, value) {
  					if (value === old && key != inside) {
  						this[key] = ret;
  					}
  				});

  				return ret;
  			},

  			// Traverse a language definition with Depth First Search
  			DFS: function DFS(o, callback, type, visited) {
  				visited = visited || {};

  				var objId = _.util.objId;

  				for (var i in o) {
  					if (o.hasOwnProperty(i)) {
  						callback.call(o, i, o[i], type || i);

  						var property = o[i];
  						var propertyType = _.util.type(property);

  						if (propertyType === 'Object' && !visited[objId(property)]) {
  							visited[objId(property)] = true;
  							DFS(property, callback, null, visited);
  						} else if (propertyType === 'Array' && !visited[objId(property)]) {
  							visited[objId(property)] = true;
  							DFS(property, callback, i, visited);
  						}
  					}
  				}
  			}
  		},

  		plugins: {},

  		/**
  		 * This is the most high-level function in Prism’s API.
  		 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
  		 * each one of them.
  		 *
  		 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
  		 *
  		 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
  		 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
  		 * @memberof Prism
  		 * @public
  		 */
  		highlightAll: function (async, callback) {
  			_.highlightAllUnder(document, async, callback);
  		},

  		/**
  		 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
  		 * {@link Prism.highlightElement} on each one of them.
  		 *
  		 * The following hooks will be run:
  		 * 1. `before-highlightall`
  		 * 2. `before-all-elements-highlight`
  		 * 3. All hooks of {@link Prism.highlightElement} for each element.
  		 *
  		 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
  		 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
  		 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
  		 * @memberof Prism
  		 * @public
  		 */
  		highlightAllUnder: function (container, async, callback) {
  			var env = {
  				callback: callback,
  				container: container,
  				selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
  			};

  			_.hooks.run('before-highlightall', env);

  			env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

  			_.hooks.run('before-all-elements-highlight', env);

  			for (var i = 0, element; (element = env.elements[i++]);) {
  				_.highlightElement(element, async === true, env.callback);
  			}
  		},

  		/**
  		 * Highlights the code inside a single element.
  		 *
  		 * The following hooks will be run:
  		 * 1. `before-sanity-check`
  		 * 2. `before-highlight`
  		 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
  		 * 4. `before-insert`
  		 * 5. `after-highlight`
  		 * 6. `complete`
  		 *
  		 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
  		 * the element's language.
  		 *
  		 * @param {Element} element The element containing the code.
  		 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
  		 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
  		 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
  		 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
  		 *
  		 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
  		 * asynchronous highlighting to work. You can build your own bundle on the
  		 * [Download page](https://prismjs.com/download.html).
  		 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
  		 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
  		 * @memberof Prism
  		 * @public
  		 */
  		highlightElement: function (element, async, callback) {
  			// Find language
  			var language = _.util.getLanguage(element);
  			var grammar = _.languages[language];

  			// Set language on the element, if not present
  			_.util.setLanguage(element, language);

  			// Set language on the parent, for styling
  			var parent = element.parentElement;
  			if (parent && parent.nodeName.toLowerCase() === 'pre') {
  				_.util.setLanguage(parent, language);
  			}

  			var code = element.textContent;

  			var env = {
  				element: element,
  				language: language,
  				grammar: grammar,
  				code: code
  			};

  			function insertHighlightedCode(highlightedCode) {
  				env.highlightedCode = highlightedCode;

  				_.hooks.run('before-insert', env);

  				env.element.innerHTML = env.highlightedCode;

  				_.hooks.run('after-highlight', env);
  				_.hooks.run('complete', env);
  				callback && callback.call(env.element);
  			}

  			_.hooks.run('before-sanity-check', env);

  			// plugins may change/add the parent/element
  			parent = env.element.parentElement;
  			if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
  				parent.setAttribute('tabindex', '0');
  			}

  			if (!env.code) {
  				_.hooks.run('complete', env);
  				callback && callback.call(env.element);
  				return;
  			}

  			_.hooks.run('before-highlight', env);

  			if (!env.grammar) {
  				insertHighlightedCode(_.util.encode(env.code));
  				return;
  			}

  			if (async && _self.Worker) {
  				var worker = new Worker(_.filename);

  				worker.onmessage = function (evt) {
  					insertHighlightedCode(evt.data);
  				};

  				worker.postMessage(JSON.stringify({
  					language: env.language,
  					code: env.code,
  					immediateClose: true
  				}));
  			} else {
  				insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
  			}
  		},

  		/**
  		 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
  		 * and the language definitions to use, and returns a string with the HTML produced.
  		 *
  		 * The following hooks will be run:
  		 * 1. `before-tokenize`
  		 * 2. `after-tokenize`
  		 * 3. `wrap`: On each {@link Token}.
  		 *
  		 * @param {string} text A string with the code to be highlighted.
  		 * @param {Grammar} grammar An object containing the tokens to use.
  		 *
  		 * Usually a language definition like `Prism.languages.markup`.
  		 * @param {string} language The name of the language definition passed to `grammar`.
  		 * @returns {string} The highlighted HTML.
  		 * @memberof Prism
  		 * @public
  		 * @example
  		 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
  		 */
  		highlight: function (text, grammar, language) {
  			var env = {
  				code: text,
  				grammar: grammar,
  				language: language
  			};
  			_.hooks.run('before-tokenize', env);
  			if (!env.grammar) {
  				throw new Error('The language "' + env.language + '" has no grammar.');
  			}
  			env.tokens = _.tokenize(env.code, env.grammar);
  			_.hooks.run('after-tokenize', env);
  			return Token.stringify(_.util.encode(env.tokens), env.language);
  		},

  		/**
  		 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
  		 * and the language definitions to use, and returns an array with the tokenized code.
  		 *
  		 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
  		 *
  		 * This method could be useful in other contexts as well, as a very crude parser.
  		 *
  		 * @param {string} text A string with the code to be highlighted.
  		 * @param {Grammar} grammar An object containing the tokens to use.
  		 *
  		 * Usually a language definition like `Prism.languages.markup`.
  		 * @returns {TokenStream} An array of strings and tokens, a token stream.
  		 * @memberof Prism
  		 * @public
  		 * @example
  		 * let code = `var foo = 0;`;
  		 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
  		 * tokens.forEach(token => {
  		 *     if (token instanceof Prism.Token && token.type === 'number') {
  		 *         console.log(`Found numeric literal: ${token.content}`);
  		 *     }
  		 * });
  		 */
  		tokenize: function (text, grammar) {
  			var rest = grammar.rest;
  			if (rest) {
  				for (var token in rest) {
  					grammar[token] = rest[token];
  				}

  				delete grammar.rest;
  			}

  			var tokenList = new LinkedList();
  			addAfter(tokenList, tokenList.head, text);

  			matchGrammar(text, tokenList, grammar, tokenList.head, 0);

  			return toArray(tokenList);
  		},

  		/**
  		 * @namespace
  		 * @memberof Prism
  		 * @public
  		 */
  		hooks: {
  			all: {},

  			/**
  			 * Adds the given callback to the list of callbacks for the given hook.
  			 *
  			 * The callback will be invoked when the hook it is registered for is run.
  			 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
  			 *
  			 * One callback function can be registered to multiple hooks and the same hook multiple times.
  			 *
  			 * @param {string} name The name of the hook.
  			 * @param {HookCallback} callback The callback function which is given environment variables.
  			 * @public
  			 */
  			add: function (name, callback) {
  				var hooks = _.hooks.all;

  				hooks[name] = hooks[name] || [];

  				hooks[name].push(callback);
  			},

  			/**
  			 * Runs a hook invoking all registered callbacks with the given environment variables.
  			 *
  			 * Callbacks will be invoked synchronously and in the order in which they were registered.
  			 *
  			 * @param {string} name The name of the hook.
  			 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
  			 * @public
  			 */
  			run: function (name, env) {
  				var callbacks = _.hooks.all[name];

  				if (!callbacks || !callbacks.length) {
  					return;
  				}

  				for (var i = 0, callback; (callback = callbacks[i++]);) {
  					callback(env);
  				}
  			}
  		},

  		Token: Token
  	};
  	_self.Prism = _;


  	// Typescript note:
  	// The following can be used to import the Token type in JSDoc:
  	//
  	//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

  	/**
  	 * Creates a new token.
  	 *
  	 * @param {string} type See {@link Token#type type}
  	 * @param {string | TokenStream} content See {@link Token#content content}
  	 * @param {string|string[]} [alias] The alias(es) of the token.
  	 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
  	 * @class
  	 * @global
  	 * @public
  	 */
  	function Token(type, content, alias, matchedStr) {
  		/**
  		 * The type of the token.
  		 *
  		 * This is usually the key of a pattern in a {@link Grammar}.
  		 *
  		 * @type {string}
  		 * @see GrammarToken
  		 * @public
  		 */
  		this.type = type;
  		/**
  		 * The strings or tokens contained by this token.
  		 *
  		 * This will be a token stream if the pattern matched also defined an `inside` grammar.
  		 *
  		 * @type {string | TokenStream}
  		 * @public
  		 */
  		this.content = content;
  		/**
  		 * The alias(es) of the token.
  		 *
  		 * @type {string|string[]}
  		 * @see GrammarToken
  		 * @public
  		 */
  		this.alias = alias;
  		// Copy of the full string this token was created from
  		this.length = (matchedStr || '').length | 0;
  	}

  	/**
  	 * A token stream is an array of strings and {@link Token Token} objects.
  	 *
  	 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
  	 * them.
  	 *
  	 * 1. No adjacent strings.
  	 * 2. No empty strings.
  	 *
  	 *    The only exception here is the token stream that only contains the empty string and nothing else.
  	 *
  	 * @typedef {Array<string | Token>} TokenStream
  	 * @global
  	 * @public
  	 */

  	/**
  	 * Converts the given token or token stream to an HTML representation.
  	 *
  	 * The following hooks will be run:
  	 * 1. `wrap`: On each {@link Token}.
  	 *
  	 * @param {string | Token | TokenStream} o The token or token stream to be converted.
  	 * @param {string} language The name of current language.
  	 * @returns {string} The HTML representation of the token or token stream.
  	 * @memberof Token
  	 * @static
  	 */
  	Token.stringify = function stringify(o, language) {
  		if (typeof o == 'string') {
  			return o;
  		}
  		if (Array.isArray(o)) {
  			var s = '';
  			o.forEach(function (e) {
  				s += stringify(e, language);
  			});
  			return s;
  		}

  		var env = {
  			type: o.type,
  			content: stringify(o.content, language),
  			tag: 'span',
  			classes: ['token', o.type],
  			attributes: {},
  			language: language
  		};

  		var aliases = o.alias;
  		if (aliases) {
  			if (Array.isArray(aliases)) {
  				Array.prototype.push.apply(env.classes, aliases);
  			} else {
  				env.classes.push(aliases);
  			}
  		}

  		_.hooks.run('wrap', env);

  		var attributes = '';
  		for (var name in env.attributes) {
  			attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
  		}

  		return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
  	};

  	/**
  	 * @param {RegExp} pattern
  	 * @param {number} pos
  	 * @param {string} text
  	 * @param {boolean} lookbehind
  	 * @returns {RegExpExecArray | null}
  	 */
  	function matchPattern(pattern, pos, text, lookbehind) {
  		pattern.lastIndex = pos;
  		var match = pattern.exec(text);
  		if (match && lookbehind && match[1]) {
  			// change the match to remove the text matched by the Prism lookbehind group
  			var lookbehindLength = match[1].length;
  			match.index += lookbehindLength;
  			match[0] = match[0].slice(lookbehindLength);
  		}
  		return match;
  	}

  	/**
  	 * @param {string} text
  	 * @param {LinkedList<string | Token>} tokenList
  	 * @param {any} grammar
  	 * @param {LinkedListNode<string | Token>} startNode
  	 * @param {number} startPos
  	 * @param {RematchOptions} [rematch]
  	 * @returns {void}
  	 * @private
  	 *
  	 * @typedef RematchOptions
  	 * @property {string} cause
  	 * @property {number} reach
  	 */
  	function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
  		for (var token in grammar) {
  			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
  				continue;
  			}

  			var patterns = grammar[token];
  			patterns = Array.isArray(patterns) ? patterns : [patterns];

  			for (var j = 0; j < patterns.length; ++j) {
  				if (rematch && rematch.cause == token + ',' + j) {
  					return;
  				}

  				var patternObj = patterns[j];
  				var inside = patternObj.inside;
  				var lookbehind = !!patternObj.lookbehind;
  				var greedy = !!patternObj.greedy;
  				var alias = patternObj.alias;

  				if (greedy && !patternObj.pattern.global) {
  					// Without the global flag, lastIndex won't work
  					var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
  					patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
  				}

  				/** @type {RegExp} */
  				var pattern = patternObj.pattern || patternObj;

  				for ( // iterate the token list and keep track of the current token/string position
  					var currentNode = startNode.next, pos = startPos;
  					currentNode !== tokenList.tail;
  					pos += currentNode.value.length, currentNode = currentNode.next
  				) {

  					if (rematch && pos >= rematch.reach) {
  						break;
  					}

  					var str = currentNode.value;

  					if (tokenList.length > text.length) {
  						// Something went terribly wrong, ABORT, ABORT!
  						return;
  					}

  					if (str instanceof Token) {
  						continue;
  					}

  					var removeCount = 1; // this is the to parameter of removeBetween
  					var match;

  					if (greedy) {
  						match = matchPattern(pattern, pos, text, lookbehind);
  						if (!match || match.index >= text.length) {
  							break;
  						}

  						var from = match.index;
  						var to = match.index + match[0].length;
  						var p = pos;

  						// find the node that contains the match
  						p += currentNode.value.length;
  						while (from >= p) {
  							currentNode = currentNode.next;
  							p += currentNode.value.length;
  						}
  						// adjust pos (and p)
  						p -= currentNode.value.length;
  						pos = p;

  						// the current node is a Token, then the match starts inside another Token, which is invalid
  						if (currentNode.value instanceof Token) {
  							continue;
  						}

  						// find the last node which is affected by this match
  						for (
  							var k = currentNode;
  							k !== tokenList.tail && (p < to || typeof k.value === 'string');
  							k = k.next
  						) {
  							removeCount++;
  							p += k.value.length;
  						}
  						removeCount--;

  						// replace with the new match
  						str = text.slice(pos, p);
  						match.index -= pos;
  					} else {
  						match = matchPattern(pattern, 0, str, lookbehind);
  						if (!match) {
  							continue;
  						}
  					}

  					// eslint-disable-next-line no-redeclare
  					var from = match.index;
  					var matchStr = match[0];
  					var before = str.slice(0, from);
  					var after = str.slice(from + matchStr.length);

  					var reach = pos + str.length;
  					if (rematch && reach > rematch.reach) {
  						rematch.reach = reach;
  					}

  					var removeFrom = currentNode.prev;

  					if (before) {
  						removeFrom = addAfter(tokenList, removeFrom, before);
  						pos += before.length;
  					}

  					removeRange(tokenList, removeFrom, removeCount);

  					var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
  					currentNode = addAfter(tokenList, removeFrom, wrapped);

  					if (after) {
  						addAfter(tokenList, currentNode, after);
  					}

  					if (removeCount > 1) {
  						// at least one Token object was removed, so we have to do some rematching
  						// this can only happen if the current pattern is greedy

  						/** @type {RematchOptions} */
  						var nestedRematch = {
  							cause: token + ',' + j,
  							reach: reach
  						};
  						matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

  						// the reach might have been extended because of the rematching
  						if (rematch && nestedRematch.reach > rematch.reach) {
  							rematch.reach = nestedRematch.reach;
  						}
  					}
  				}
  			}
  		}
  	}

  	/**
  	 * @typedef LinkedListNode
  	 * @property {T} value
  	 * @property {LinkedListNode<T> | null} prev The previous node.
  	 * @property {LinkedListNode<T> | null} next The next node.
  	 * @template T
  	 * @private
  	 */

  	/**
  	 * @template T
  	 * @private
  	 */
  	function LinkedList() {
  		/** @type {LinkedListNode<T>} */
  		var head = { value: null, prev: null, next: null };
  		/** @type {LinkedListNode<T>} */
  		var tail = { value: null, prev: head, next: null };
  		head.next = tail;

  		/** @type {LinkedListNode<T>} */
  		this.head = head;
  		/** @type {LinkedListNode<T>} */
  		this.tail = tail;
  		this.length = 0;
  	}

  	/**
  	 * Adds a new node with the given value to the list.
  	 *
  	 * @param {LinkedList<T>} list
  	 * @param {LinkedListNode<T>} node
  	 * @param {T} value
  	 * @returns {LinkedListNode<T>} The added node.
  	 * @template T
  	 */
  	function addAfter(list, node, value) {
  		// assumes that node != list.tail && values.length >= 0
  		var next = node.next;

  		var newNode = { value: value, prev: node, next: next };
  		node.next = newNode;
  		next.prev = newNode;
  		list.length++;

  		return newNode;
  	}
  	/**
  	 * Removes `count` nodes after the given node. The given node will not be removed.
  	 *
  	 * @param {LinkedList<T>} list
  	 * @param {LinkedListNode<T>} node
  	 * @param {number} count
  	 * @template T
  	 */
  	function removeRange(list, node, count) {
  		var next = node.next;
  		for (var i = 0; i < count && next !== list.tail; i++) {
  			next = next.next;
  		}
  		node.next = next;
  		next.prev = node;
  		list.length -= i;
  	}
  	/**
  	 * @param {LinkedList<T>} list
  	 * @returns {T[]}
  	 * @template T
  	 */
  	function toArray(list) {
  		var array = [];
  		var node = list.head.next;
  		while (node !== list.tail) {
  			array.push(node.value);
  			node = node.next;
  		}
  		return array;
  	}


  	if (!_self.document) {
  		if (!_self.addEventListener) {
  			// in Node.js
  			return _;
  		}

  		if (!_.disableWorkerMessageHandler) {
  			// In worker
  			_self.addEventListener('message', function (evt) {
  				var message = JSON.parse(evt.data);
  				var lang = message.language;
  				var code = message.code;
  				var immediateClose = message.immediateClose;

  				_self.postMessage(_.highlight(code, _.languages[lang], lang));
  				if (immediateClose) {
  					_self.close();
  				}
  			}, false);
  		}

  		return _;
  	}

  	// Get current script and highlight
  	var script = _.util.currentScript();

  	if (script) {
  		_.filename = script.src;

  		if (script.hasAttribute('data-manual')) {
  			_.manual = true;
  		}
  	}

  	function highlightAutomaticallyCallback() {
  		if (!_.manual) {
  			_.highlightAll();
  		}
  	}

  	if (!_.manual) {
  		// If the document state is "loading", then we'll use DOMContentLoaded.
  		// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
  		// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
  		// might take longer one animation frame to execute which can create a race condition where only some plugins have
  		// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
  		// See https://github.com/PrismJS/prism/issues/2102
  		var readyState = document.readyState;
  		if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
  			document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
  		} else {
  			if (window.requestAnimationFrame) {
  				window.requestAnimationFrame(highlightAutomaticallyCallback);
  			} else {
  				window.setTimeout(highlightAutomaticallyCallback, 16);
  			}
  		}
  	}

  	return _;

  }(_self));

  if (module.exports) {
  	module.exports = Prism;
  }

  // hack for components to work correctly in node.js
  if (typeof commonjsGlobal !== 'undefined') {
  	commonjsGlobal.Prism = Prism;
  }

  // some additional documentation/types

  /**
   * The expansion of a simple `RegExp` literal to support additional properties.
   *
   * @typedef GrammarToken
   * @property {RegExp} pattern The regular expression of the token.
   * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
   * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
   * @property {boolean} [greedy=false] Whether the token is greedy.
   * @property {string|string[]} [alias] An optional alias or list of aliases.
   * @property {Grammar} [inside] The nested grammar of this token.
   *
   * The `inside` grammar will be used to tokenize the text value of each token of this kind.
   *
   * This can be used to make nested and even recursive language definitions.
   *
   * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
   * each another.
   * @global
   * @public
   */

  /**
   * @typedef Grammar
   * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
   * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
   * @global
   * @public
   */

  /**
   * A function which will invoked after an element was successfully highlighted.
   *
   * @callback HighlightCallback
   * @param {Element} element The element successfully highlighted.
   * @returns {void}
   * @global
   * @public
   */

  /**
   * @callback HookCallback
   * @param {Object<string, any>} env The environment variables of the hook.
   * @returns {void}
   * @global
   * @public
   */


  /* **********************************************
       Begin prism-markup.js
  ********************************************** */

  Prism.languages.markup = {
  	'comment': {
  		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
  		greedy: true
  	},
  	'prolog': {
  		pattern: /<\?[\s\S]+?\?>/,
  		greedy: true
  	},
  	'doctype': {
  		// https://www.w3.org/TR/xml/#NT-doctypedecl
  		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
  		greedy: true,
  		inside: {
  			'internal-subset': {
  				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
  				lookbehind: true,
  				greedy: true,
  				inside: null // see below
  			},
  			'string': {
  				pattern: /"[^"]*"|'[^']*'/,
  				greedy: true
  			},
  			'punctuation': /^<!|>$|[[\]]/,
  			'doctype-tag': /^DOCTYPE/i,
  			'name': /[^\s<>'"]+/
  		}
  	},
  	'cdata': {
  		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
  		greedy: true
  	},
  	'tag': {
  		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
  		greedy: true,
  		inside: {
  			'tag': {
  				pattern: /^<\/?[^\s>\/]+/,
  				inside: {
  					'punctuation': /^<\/?/,
  					'namespace': /^[^\s>\/:]+:/
  				}
  			},
  			'special-attr': [],
  			'attr-value': {
  				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
  				inside: {
  					'punctuation': [
  						{
  							pattern: /^=/,
  							alias: 'attr-equals'
  						},
  						{
  							pattern: /^(\s*)["']|["']$/,
  							lookbehind: true
  						}
  					]
  				}
  			},
  			'punctuation': /\/?>/,
  			'attr-name': {
  				pattern: /[^\s>\/]+/,
  				inside: {
  					'namespace': /^[^\s>\/:]+:/
  				}
  			}

  		}
  	},
  	'entity': [
  		{
  			pattern: /&[\da-z]{1,8};/i,
  			alias: 'named-entity'
  		},
  		/&#x?[\da-f]{1,8};/i
  	]
  };

  Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
  	Prism.languages.markup['entity'];
  Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

  // Plugin to make entity title show the real entity, idea by Roman Komarov
  Prism.hooks.add('wrap', function (env) {

  	if (env.type === 'entity') {
  		env.attributes['title'] = env.content.replace(/&amp;/, '&');
  	}
  });

  Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
  	/**
  	 * Adds an inlined language to markup.
  	 *
  	 * An example of an inlined language is CSS with `<style>` tags.
  	 *
  	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
  	 * case insensitive.
  	 * @param {string} lang The language key.
  	 * @example
  	 * addInlined('style', 'css');
  	 */
  	value: function addInlined(tagName, lang) {
  		var includedCdataInside = {};
  		includedCdataInside['language-' + lang] = {
  			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
  			lookbehind: true,
  			inside: Prism.languages[lang]
  		};
  		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

  		var inside = {
  			'included-cdata': {
  				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
  				inside: includedCdataInside
  			}
  		};
  		inside['language-' + lang] = {
  			pattern: /[\s\S]+/,
  			inside: Prism.languages[lang]
  		};

  		var def = {};
  		def[tagName] = {
  			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
  			lookbehind: true,
  			greedy: true,
  			inside: inside
  		};

  		Prism.languages.insertBefore('markup', 'cdata', def);
  	}
  });
  Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
  	/**
  	 * Adds an pattern to highlight languages embedded in HTML attributes.
  	 *
  	 * An example of an inlined language is CSS with `style` attributes.
  	 *
  	 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
  	 * case insensitive.
  	 * @param {string} lang The language key.
  	 * @example
  	 * addAttribute('style', 'css');
  	 */
  	value: function (attrName, lang) {
  		Prism.languages.markup.tag.inside['special-attr'].push({
  			pattern: RegExp(
  				/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
  				'i'
  			),
  			lookbehind: true,
  			inside: {
  				'attr-name': /^[^\s=]+/,
  				'attr-value': {
  					pattern: /=[\s\S]+/,
  					inside: {
  						'value': {
  							pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
  							lookbehind: true,
  							alias: [lang, 'language-' + lang],
  							inside: Prism.languages[lang]
  						},
  						'punctuation': [
  							{
  								pattern: /^=/,
  								alias: 'attr-equals'
  							},
  							/"|'/
  						]
  					}
  				}
  			}
  		});
  	}
  });

  Prism.languages.html = Prism.languages.markup;
  Prism.languages.mathml = Prism.languages.markup;
  Prism.languages.svg = Prism.languages.markup;

  Prism.languages.xml = Prism.languages.extend('markup', {});
  Prism.languages.ssml = Prism.languages.xml;
  Prism.languages.atom = Prism.languages.xml;
  Prism.languages.rss = Prism.languages.xml;


  /* **********************************************
       Begin prism-css.js
  ********************************************** */

  (function (Prism) {

  	var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

  	Prism.languages.css = {
  		'comment': /\/\*[\s\S]*?\*\//,
  		'atrule': {
  			pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
  			inside: {
  				'rule': /^@[\w-]+/,
  				'selector-function-argument': {
  					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
  					lookbehind: true,
  					alias: 'selector'
  				},
  				'keyword': {
  					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
  					lookbehind: true
  				}
  				// See rest below
  			}
  		},
  		'url': {
  			// https://drafts.csswg.org/css-values-3/#urls
  			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
  			greedy: true,
  			inside: {
  				'function': /^url/i,
  				'punctuation': /^\(|\)$/,
  				'string': {
  					pattern: RegExp('^' + string.source + '$'),
  					alias: 'url'
  				}
  			}
  		},
  		'selector': {
  			pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
  			lookbehind: true
  		},
  		'string': {
  			pattern: string,
  			greedy: true
  		},
  		'property': {
  			pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
  			lookbehind: true
  		},
  		'important': /!important\b/i,
  		'function': {
  			pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
  			lookbehind: true
  		},
  		'punctuation': /[(){};:,]/
  	};

  	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

  	var markup = Prism.languages.markup;
  	if (markup) {
  		markup.tag.addInlined('style', 'css');
  		markup.tag.addAttribute('style', 'css');
  	}

  }(Prism));


  /* **********************************************
       Begin prism-clike.js
  ********************************************** */

  Prism.languages.clike = {
  	'comment': [
  		{
  			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
  			lookbehind: true,
  			greedy: true
  		},
  		{
  			pattern: /(^|[^\\:])\/\/.*/,
  			lookbehind: true,
  			greedy: true
  		}
  	],
  	'string': {
  		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
  		greedy: true
  	},
  	'class-name': {
  		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
  		lookbehind: true,
  		inside: {
  			'punctuation': /[.\\]/
  		}
  	},
  	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
  	'boolean': /\b(?:false|true)\b/,
  	'function': /\b\w+(?=\()/,
  	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  	'punctuation': /[{}[\];(),.:]/
  };


  /* **********************************************
       Begin prism-javascript.js
  ********************************************** */

  Prism.languages.javascript = Prism.languages.extend('clike', {
  	'class-name': [
  		Prism.languages.clike['class-name'],
  		{
  			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
  			lookbehind: true
  		}
  	],
  	'keyword': [
  		{
  			pattern: /((?:^|\})\s*)catch\b/,
  			lookbehind: true
  		},
  		{
  			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
  			lookbehind: true
  		},
  	],
  	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
  	'number': {
  		pattern: RegExp(
  			/(^|[^\w$])/.source +
  			'(?:' +
  			(
  				// constant
  				/NaN|Infinity/.source +
  				'|' +
  				// binary integer
  				/0[bB][01]+(?:_[01]+)*n?/.source +
  				'|' +
  				// octal integer
  				/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
  				'|' +
  				// hexadecimal integer
  				/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
  				'|' +
  				// decimal bigint
  				/\d+(?:_\d+)*n/.source +
  				'|' +
  				// decimal number (integer or float) but no bigint
  				/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
  			) +
  			')' +
  			/(?![\w$])/.source
  		),
  		lookbehind: true
  	},
  	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
  });

  Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

  Prism.languages.insertBefore('javascript', 'keyword', {
  	'regex': {
  		pattern: RegExp(
  			// lookbehind
  			// eslint-disable-next-line regexp/no-dupe-characters-character-class
  			/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
  			// Regex pattern:
  			// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
  			// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
  			// with the only syntax, so we have to define 2 different regex patterns.
  			/\//.source +
  			'(?:' +
  			/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
  			'|' +
  			// `v` flag syntax. This supports 3 levels of nested character classes.
  			/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
  			')' +
  			// lookahead
  			/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
  		),
  		lookbehind: true,
  		greedy: true,
  		inside: {
  			'regex-source': {
  				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
  				lookbehind: true,
  				alias: 'language-regex',
  				inside: Prism.languages.regex
  			},
  			'regex-delimiter': /^\/|\/$/,
  			'regex-flags': /^[a-z]+$/,
  		}
  	},
  	// This must be declared before keyword because we use "function" inside the look-forward
  	'function-variable': {
  		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
  		alias: 'function'
  	},
  	'parameter': [
  		{
  			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
  			lookbehind: true,
  			inside: Prism.languages.javascript
  		},
  		{
  			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
  			lookbehind: true,
  			inside: Prism.languages.javascript
  		},
  		{
  			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
  			lookbehind: true,
  			inside: Prism.languages.javascript
  		},
  		{
  			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
  			lookbehind: true,
  			inside: Prism.languages.javascript
  		}
  	],
  	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
  });

  Prism.languages.insertBefore('javascript', 'string', {
  	'hashbang': {
  		pattern: /^#!.*/,
  		greedy: true,
  		alias: 'comment'
  	},
  	'template-string': {
  		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
  		greedy: true,
  		inside: {
  			'template-punctuation': {
  				pattern: /^`|`$/,
  				alias: 'string'
  			},
  			'interpolation': {
  				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
  				lookbehind: true,
  				inside: {
  					'interpolation-punctuation': {
  						pattern: /^\$\{|\}$/,
  						alias: 'punctuation'
  					},
  					rest: Prism.languages.javascript
  				}
  			},
  			'string': /[\s\S]+/
  		}
  	},
  	'string-property': {
  		pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
  		lookbehind: true,
  		greedy: true,
  		alias: 'property'
  	}
  });

  Prism.languages.insertBefore('javascript', 'operator', {
  	'literal-property': {
  		pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
  		lookbehind: true,
  		alias: 'property'
  	},
  });

  if (Prism.languages.markup) {
  	Prism.languages.markup.tag.addInlined('script', 'javascript');

  	// add attribute support for all DOM events.
  	// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
  	Prism.languages.markup.tag.addAttribute(
  		/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
  		'javascript'
  	);
  }

  Prism.languages.js = Prism.languages.javascript;


  /* **********************************************
       Begin prism-file-highlight.js
  ********************************************** */

  (function () {

  	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
  		return;
  	}

  	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
  	if (!Element.prototype.matches) {
  		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  	}

  	var LOADING_MESSAGE = 'Loading…';
  	var FAILURE_MESSAGE = function (status, message) {
  		return '✖ Error ' + status + ' while fetching file: ' + message;
  	};
  	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

  	var EXTENSIONS = {
  		'js': 'javascript',
  		'py': 'python',
  		'rb': 'ruby',
  		'ps1': 'powershell',
  		'psm1': 'powershell',
  		'sh': 'bash',
  		'bat': 'batch',
  		'h': 'c',
  		'tex': 'latex'
  	};

  	var STATUS_ATTR = 'data-src-status';
  	var STATUS_LOADING = 'loading';
  	var STATUS_LOADED = 'loaded';
  	var STATUS_FAILED = 'failed';

  	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
  		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

  	/**
  	 * Loads the given file.
  	 *
  	 * @param {string} src The URL or path of the source file to load.
  	 * @param {(result: string) => void} success
  	 * @param {(reason: string) => void} error
  	 */
  	function loadFile(src, success, error) {
  		var xhr = new XMLHttpRequest();
  		xhr.open('GET', src, true);
  		xhr.onreadystatechange = function () {
  			if (xhr.readyState == 4) {
  				if (xhr.status < 400 && xhr.responseText) {
  					success(xhr.responseText);
  				} else {
  					if (xhr.status >= 400) {
  						error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
  					} else {
  						error(FAILURE_EMPTY_MESSAGE);
  					}
  				}
  			}
  		};
  		xhr.send(null);
  	}

  	/**
  	 * Parses the given range.
  	 *
  	 * This returns a range with inclusive ends.
  	 *
  	 * @param {string | null | undefined} range
  	 * @returns {[number, number | undefined] | undefined}
  	 */
  	function parseRange(range) {
  		var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
  		if (m) {
  			var start = Number(m[1]);
  			var comma = m[2];
  			var end = m[3];

  			if (!comma) {
  				return [start, start];
  			}
  			if (!end) {
  				return [start, undefined];
  			}
  			return [start, Number(end)];
  		}
  		return undefined;
  	}

  	Prism.hooks.add('before-highlightall', function (env) {
  		env.selector += ', ' + SELECTOR;
  	});

  	Prism.hooks.add('before-sanity-check', function (env) {
  		var pre = /** @type {HTMLPreElement} */ (env.element);
  		if (pre.matches(SELECTOR)) {
  			env.code = ''; // fast-path the whole thing and go to complete

  			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

  			// add code element with loading message
  			var code = pre.appendChild(document.createElement('CODE'));
  			code.textContent = LOADING_MESSAGE;

  			var src = pre.getAttribute('data-src');

  			var language = env.language;
  			if (language === 'none') {
  				// the language might be 'none' because there is no language set;
  				// in this case, we want to use the extension as the language
  				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
  				language = EXTENSIONS[extension] || extension;
  			}

  			// set language classes
  			Prism.util.setLanguage(code, language);
  			Prism.util.setLanguage(pre, language);

  			// preload the language
  			var autoloader = Prism.plugins.autoloader;
  			if (autoloader) {
  				autoloader.loadLanguages(language);
  			}

  			// load file
  			loadFile(
  				src,
  				function (text) {
  					// mark as loaded
  					pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

  					// handle data-range
  					var range = parseRange(pre.getAttribute('data-range'));
  					if (range) {
  						var lines = text.split(/\r\n?|\n/g);

  						// the range is one-based and inclusive on both ends
  						var start = range[0];
  						var end = range[1] == null ? lines.length : range[1];

  						if (start < 0) { start += lines.length; }
  						start = Math.max(0, Math.min(start - 1, lines.length));
  						if (end < 0) { end += lines.length; }
  						end = Math.max(0, Math.min(end, lines.length));

  						text = lines.slice(start, end).join('\n');

  						// add data-start for line numbers
  						if (!pre.hasAttribute('data-start')) {
  							pre.setAttribute('data-start', String(start + 1));
  						}
  					}

  					// highlight code
  					code.textContent = text;
  					Prism.highlightElement(code);
  				},
  				function (error) {
  					// mark as failed
  					pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

  					code.textContent = error;
  				}
  			);
  		}
  	});

  	Prism.plugins.fileHighlight = {
  		/**
  		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
  		 *
  		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
  		 *
  		 * @param {ParentNode} [container=document]
  		 */
  		highlight: function highlight(container) {
  			var elements = (container || document).querySelectorAll(SELECTOR);

  			for (var i = 0, element; (element = elements[i++]);) {
  				Prism.highlightElement(element);
  			}
  		}
  	};

  	var logged = false;
  	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
  	Prism.fileHighlight = function () {
  		if (!logged) {
  			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
  			logged = true;
  		}
  		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
  	};

  }());
  });

  Prism.languages.python = {
  	'comment': {
  		pattern: /(^|[^\\])#.*/,
  		lookbehind: true,
  		greedy: true
  	},
  	'string-interpolation': {
  		pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
  		greedy: true,
  		inside: {
  			'interpolation': {
  				// "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
  				pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
  				lookbehind: true,
  				inside: {
  					'format-spec': {
  						pattern: /(:)[^:(){}]+(?=\}$)/,
  						lookbehind: true
  					},
  					'conversion-option': {
  						pattern: /![sra](?=[:}]$)/,
  						alias: 'punctuation'
  					},
  					rest: null
  				}
  			},
  			'string': /[\s\S]+/
  		}
  	},
  	'triple-quoted-string': {
  		pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
  		greedy: true,
  		alias: 'string'
  	},
  	'string': {
  		pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
  		greedy: true
  	},
  	'function': {
  		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
  		lookbehind: true
  	},
  	'class-name': {
  		pattern: /(\bclass\s+)\w+/i,
  		lookbehind: true
  	},
  	'decorator': {
  		pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
  		lookbehind: true,
  		alias: ['annotation', 'punctuation'],
  		inside: {
  			'punctuation': /\./
  		}
  	},
  	'keyword': /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
  	'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
  	'boolean': /\b(?:False|None|True)\b/,
  	'number': /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
  	'operator': /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
  	'punctuation': /[{}[\];(),.:]/
  };

  Prism.languages.python['string-interpolation'].inside['interpolation'].inside.rest = Prism.languages.python;

  Prism.languages.py = Prism.languages.python;

  Prism.languages.clike = {
  	'comment': [
  		{
  			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
  			lookbehind: true,
  			greedy: true
  		},
  		{
  			pattern: /(^|[^\\:])\/\/.*/,
  			lookbehind: true,
  			greedy: true
  		}
  	],
  	'string': {
  		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
  		greedy: true
  	},
  	'class-name': {
  		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
  		lookbehind: true,
  		inside: {
  			'punctuation': /[.\\]/
  		}
  	},
  	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
  	'boolean': /\b(?:false|true)\b/,
  	'function': /\b\w+(?=\()/,
  	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  	'punctuation': /[{}[\];(),.:]/
  };

  Prism.languages.lua = {
  	'comment': /^#!.+|--(?:\[(=*)\[[\s\S]*?\]\1\]|.*)/m,
  	// \z may be used to skip the following space
  	'string': {
  		pattern: /(["'])(?:(?!\1)[^\\\r\n]|\\z(?:\r\n|\s)|\\(?:\r\n|[^z]))*\1|\[(=*)\[[\s\S]*?\]\2\]/,
  		greedy: true
  	},
  	'number': /\b0x[a-f\d]+(?:\.[a-f\d]*)?(?:p[+-]?\d+)?\b|\b\d+(?:\.\B|(?:\.\d*)?(?:e[+-]?\d+)?\b)|\B\.\d+(?:e[+-]?\d+)?\b/i,
  	'keyword': /\b(?:and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/,
  	'function': /(?!\d)\w+(?=\s*(?:[({]))/,
  	'operator': [
  		/[-+*%^&|#]|\/\/?|<[<=]?|>[>=]?|[=~]=?/,
  		{
  			// Match ".." but don't break "..."
  			pattern: /(^|[^.])\.\.(?!\.)/,
  			lookbehind: true
  		}
  	],
  	'punctuation': /[\[\](){},;]|\.+|:+/
  };

  (function (Prism) {
  	// $ set | grep '^[A-Z][^[:space:]]*=' | cut -d= -f1 | tr '\n' '|'
  	// + LC_ALL, RANDOM, REPLY, SECONDS.
  	// + make sure PS1..4 are here as they are not always set,
  	// - some useless things.
  	var envVars = '\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b';

  	var commandAfterHeredoc = {
  		pattern: /(^(["']?)\w+\2)[ \t]+\S.*/,
  		lookbehind: true,
  		alias: 'punctuation', // this looks reasonably well in all themes
  		inside: null // see below
  	};

  	var insideString = {
  		'bash': commandAfterHeredoc,
  		'environment': {
  			pattern: RegExp('\\$' + envVars),
  			alias: 'constant'
  		},
  		'variable': [
  			// [0]: Arithmetic Environment
  			{
  				pattern: /\$?\(\([\s\S]+?\)\)/,
  				greedy: true,
  				inside: {
  					// If there is a $ sign at the beginning highlight $(( and )) as variable
  					'variable': [
  						{
  							pattern: /(^\$\(\([\s\S]+)\)\)/,
  							lookbehind: true
  						},
  						/^\$\(\(/
  					],
  					'number': /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,
  					// Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
  					'operator': /--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,
  					// If there is no $ sign at the beginning highlight (( and )) as punctuation
  					'punctuation': /\(\(?|\)\)?|,|;/
  				}
  			},
  			// [1]: Command Substitution
  			{
  				pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,
  				greedy: true,
  				inside: {
  					'variable': /^\$\(|^`|\)$|`$/
  				}
  			},
  			// [2]: Brace expansion
  			{
  				pattern: /\$\{[^}]+\}/,
  				greedy: true,
  				inside: {
  					'operator': /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,
  					'punctuation': /[\[\]]/,
  					'environment': {
  						pattern: RegExp('(\\{)' + envVars),
  						lookbehind: true,
  						alias: 'constant'
  					}
  				}
  			},
  			/\$(?:\w+|[#?*!@$])/
  		],
  		// Escape sequences from echo and printf's manuals, and escaped quotes.
  		'entity': /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/
  	};

  	Prism.languages.bash = {
  		'shebang': {
  			pattern: /^#!\s*\/.*/,
  			alias: 'important'
  		},
  		'comment': {
  			pattern: /(^|[^"{\\$])#.*/,
  			lookbehind: true
  		},
  		'function-name': [
  			// a) function foo {
  			// b) foo() {
  			// c) function foo() {
  			// but not “foo {”
  			{
  				// a) and c)
  				pattern: /(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,
  				lookbehind: true,
  				alias: 'function'
  			},
  			{
  				// b)
  				pattern: /\b[\w-]+(?=\s*\(\s*\)\s*\{)/,
  				alias: 'function'
  			}
  		],
  		// Highlight variable names as variables in for and select beginnings.
  		'for-or-select': {
  			pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
  			alias: 'variable',
  			lookbehind: true
  		},
  		// Highlight variable names as variables in the left-hand part
  		// of assignments (“=” and “+=”).
  		'assign-left': {
  			pattern: /(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,
  			inside: {
  				'environment': {
  					pattern: RegExp('(^|[\\s;|&]|[<>]\\()' + envVars),
  					lookbehind: true,
  					alias: 'constant'
  				}
  			},
  			alias: 'variable',
  			lookbehind: true
  		},
  		// Highlight parameter names as variables
  		'parameter': {
  			pattern: /(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,
  			alias: 'variable',
  			lookbehind: true
  		},
  		'string': [
  			// Support for Here-documents https://en.wikipedia.org/wiki/Here_document
  			{
  				pattern: /((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,
  				lookbehind: true,
  				greedy: true,
  				inside: insideString
  			},
  			// Here-document with quotes around the tag
  			// → No expansion (so no “inside”).
  			{
  				pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,
  				lookbehind: true,
  				greedy: true,
  				inside: {
  					'bash': commandAfterHeredoc
  				}
  			},
  			// “Normal” string
  			{
  				// https://www.gnu.org/software/bash/manual/html_node/Double-Quotes.html
  				pattern: /(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,
  				lookbehind: true,
  				greedy: true,
  				inside: insideString
  			},
  			{
  				// https://www.gnu.org/software/bash/manual/html_node/Single-Quotes.html
  				pattern: /(^|[^$\\])'[^']*'/,
  				lookbehind: true,
  				greedy: true
  			},
  			{
  				// https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
  				pattern: /\$'(?:[^'\\]|\\[\s\S])*'/,
  				greedy: true,
  				inside: {
  					'entity': insideString.entity
  				}
  			}
  		],
  		'environment': {
  			pattern: RegExp('\\$?' + envVars),
  			alias: 'constant'
  		},
  		'variable': insideString.variable,
  		'function': {
  			pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,
  			lookbehind: true
  		},
  		'keyword': {
  			pattern: /(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,
  			lookbehind: true
  		},
  		// https://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
  		'builtin': {
  			pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,
  			lookbehind: true,
  			// Alias added to make those easier to distinguish from strings.
  			alias: 'class-name'
  		},
  		'boolean': {
  			pattern: /(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,
  			lookbehind: true
  		},
  		'file-descriptor': {
  			pattern: /\B&\d\b/,
  			alias: 'important'
  		},
  		'operator': {
  			// Lots of redirections here, but not just that.
  			pattern: /\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,
  			inside: {
  				'file-descriptor': {
  					pattern: /^\d/,
  					alias: 'important'
  				}
  			}
  		},
  		'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
  		'number': {
  			pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
  			lookbehind: true
  		}
  	};

  	commandAfterHeredoc.inside = Prism.languages.bash;

  	/* Patterns in command substitution. */
  	var toBeCopied = [
  		'comment',
  		'function-name',
  		'for-or-select',
  		'assign-left',
  		'parameter',
  		'string',
  		'environment',
  		'function',
  		'keyword',
  		'builtin',
  		'boolean',
  		'file-descriptor',
  		'operator',
  		'punctuation',
  		'number'
  	];
  	var inside = insideString.variable[1].inside;
  	for (var i = 0; i < toBeCopied.length; i++) {
  		inside[toBeCopied[i]] = Prism.languages.bash[toBeCopied[i]];
  	}

  	Prism.languages.sh = Prism.languages.bash;
  	Prism.languages.shell = Prism.languages.bash;
  }(Prism));

  Prism.languages.go = Prism.languages.extend('clike', {
  	'string': {
  		pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,
  		lookbehind: true,
  		greedy: true
  	},
  	'keyword': /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
  	'boolean': /\b(?:_|false|iota|nil|true)\b/,
  	'number': [
  		// binary and octal integers
  		/\b0(?:b[01_]+|o[0-7_]+)i?\b/i,
  		// hexadecimal integers and floats
  		/\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,
  		// decimal integers and floats
  		/(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i
  	],
  	'operator': /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
  	'builtin': /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/
  });

  Prism.languages.insertBefore('go', 'string', {
  	'char': {
  		pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/,
  		greedy: true
  	}
  });

  delete Prism.languages.go['class-name'];

  (function (Prism) {

  	// Allow only one line break
  	var inner = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;

  	/**
  	 * This function is intended for the creation of the bold or italic pattern.
  	 *
  	 * This also adds a lookbehind group to the given pattern to ensure that the pattern is not backslash-escaped.
  	 *
  	 * _Note:_ Keep in mind that this adds a capturing group.
  	 *
  	 * @param {string} pattern
  	 * @returns {RegExp}
  	 */
  	function createInline(pattern) {
  		pattern = pattern.replace(/<inner>/g, function () { return inner; });
  		return RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + '(?:' + pattern + ')');
  	}


  	var tableCell = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source;
  	var tableRow = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g, function () { return tableCell; });
  	var tableLine = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source;


  	Prism.languages.markdown = Prism.languages.extend('markup', {});
  	Prism.languages.insertBefore('markdown', 'prolog', {
  		'front-matter-block': {
  			pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,
  			lookbehind: true,
  			greedy: true,
  			inside: {
  				'punctuation': /^---|---$/,
  				'front-matter': {
  					pattern: /\S+(?:\s+\S+)*/,
  					alias: ['yaml', 'language-yaml'],
  					inside: Prism.languages.yaml
  				}
  			}
  		},
  		'blockquote': {
  			// > ...
  			pattern: /^>(?:[\t ]*>)*/m,
  			alias: 'punctuation'
  		},
  		'table': {
  			pattern: RegExp('^' + tableRow + tableLine + '(?:' + tableRow + ')*', 'm'),
  			inside: {
  				'table-data-rows': {
  					pattern: RegExp('^(' + tableRow + tableLine + ')(?:' + tableRow + ')*$'),
  					lookbehind: true,
  					inside: {
  						'table-data': {
  							pattern: RegExp(tableCell),
  							inside: Prism.languages.markdown
  						},
  						'punctuation': /\|/
  					}
  				},
  				'table-line': {
  					pattern: RegExp('^(' + tableRow + ')' + tableLine + '$'),
  					lookbehind: true,
  					inside: {
  						'punctuation': /\||:?-{3,}:?/
  					}
  				},
  				'table-header-row': {
  					pattern: RegExp('^' + tableRow + '$'),
  					inside: {
  						'table-header': {
  							pattern: RegExp(tableCell),
  							alias: 'important',
  							inside: Prism.languages.markdown
  						},
  						'punctuation': /\|/
  					}
  				}
  			}
  		},
  		'code': [
  			{
  				// Prefixed by 4 spaces or 1 tab and preceded by an empty line
  				pattern: /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,
  				lookbehind: true,
  				alias: 'keyword'
  			},
  			{
  				// ```optional language
  				// code block
  				// ```
  				pattern: /^```[\s\S]*?^```$/m,
  				greedy: true,
  				inside: {
  					'code-block': {
  						pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,
  						lookbehind: true
  					},
  					'code-language': {
  						pattern: /^(```).+/,
  						lookbehind: true
  					},
  					'punctuation': /```/
  				}
  			}
  		],
  		'title': [
  			{
  				// title 1
  				// =======

  				// title 2
  				// -------
  				pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,
  				alias: 'important',
  				inside: {
  					punctuation: /==+$|--+$/
  				}
  			},
  			{
  				// # title 1
  				// ###### title 6
  				pattern: /(^\s*)#.+/m,
  				lookbehind: true,
  				alias: 'important',
  				inside: {
  					punctuation: /^#+|#+$/
  				}
  			}
  		],
  		'hr': {
  			// ***
  			// ---
  			// * * *
  			// -----------
  			pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
  			lookbehind: true,
  			alias: 'punctuation'
  		},
  		'list': {
  			// * item
  			// + item
  			// - item
  			// 1. item
  			pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
  			lookbehind: true,
  			alias: 'punctuation'
  		},
  		'url-reference': {
  			// [id]: http://example.com "Optional title"
  			// [id]: http://example.com 'Optional title'
  			// [id]: http://example.com (Optional title)
  			// [id]: <http://example.com> "Optional title"
  			pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
  			inside: {
  				'variable': {
  					pattern: /^(!?\[)[^\]]+/,
  					lookbehind: true
  				},
  				'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
  				'punctuation': /^[\[\]!:]|[<>]/
  			},
  			alias: 'url'
  		},
  		'bold': {
  			// **strong**
  			// __strong__

  			// allow one nested instance of italic text using the same delimiter
  			pattern: createInline(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),
  			lookbehind: true,
  			greedy: true,
  			inside: {
  				'content': {
  					pattern: /(^..)[\s\S]+(?=..$)/,
  					lookbehind: true,
  					inside: {} // see below
  				},
  				'punctuation': /\*\*|__/
  			}
  		},
  		'italic': {
  			// *em*
  			// _em_

  			// allow one nested instance of bold text using the same delimiter
  			pattern: createInline(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),
  			lookbehind: true,
  			greedy: true,
  			inside: {
  				'content': {
  					pattern: /(^.)[\s\S]+(?=.$)/,
  					lookbehind: true,
  					inside: {} // see below
  				},
  				'punctuation': /[*_]/
  			}
  		},
  		'strike': {
  			// ~~strike through~~
  			// ~strike~
  			// eslint-disable-next-line regexp/strict
  			pattern: createInline(/(~~?)(?:(?!~)<inner>)+\2/.source),
  			lookbehind: true,
  			greedy: true,
  			inside: {
  				'content': {
  					pattern: /(^~~?)[\s\S]+(?=\1$)/,
  					lookbehind: true,
  					inside: {} // see below
  				},
  				'punctuation': /~~?/
  			}
  		},
  		'code-snippet': {
  			// `code`
  			// ``code``
  			pattern: /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,
  			lookbehind: true,
  			greedy: true,
  			alias: ['code', 'keyword']
  		},
  		'url': {
  			// [example](http://example.com "Optional title")
  			// [example][id]
  			// [example] [id]
  			pattern: createInline(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),
  			lookbehind: true,
  			greedy: true,
  			inside: {
  				'operator': /^!/,
  				'content': {
  					pattern: /(^\[)[^\]]+(?=\])/,
  					lookbehind: true,
  					inside: {} // see below
  				},
  				'variable': {
  					pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
  					lookbehind: true
  				},
  				'url': {
  					pattern: /(^\]\()[^\s)]+/,
  					lookbehind: true
  				},
  				'string': {
  					pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
  					lookbehind: true
  				}
  			}
  		}
  	});

  	['url', 'bold', 'italic', 'strike'].forEach(function (token) {
  		['url', 'bold', 'italic', 'strike', 'code-snippet'].forEach(function (inside) {
  			if (token !== inside) {
  				Prism.languages.markdown[token].inside.content.inside[inside] = Prism.languages.markdown[inside];
  			}
  		});
  	});

  	Prism.hooks.add('after-tokenize', function (env) {
  		if (env.language !== 'markdown' && env.language !== 'md') {
  			return;
  		}

  		function walkTokens(tokens) {
  			if (!tokens || typeof tokens === 'string') {
  				return;
  			}

  			for (var i = 0, l = tokens.length; i < l; i++) {
  				var token = tokens[i];

  				if (token.type !== 'code') {
  					walkTokens(token.content);
  					continue;
  				}

  				/*
  				 * Add the correct `language-xxxx` class to this code block. Keep in mind that the `code-language` token
  				 * is optional. But the grammar is defined so that there is only one case we have to handle:
  				 *
  				 * token.content = [
  				 *     <span class="punctuation">```</span>,
  				 *     <span class="code-language">xxxx</span>,
  				 *     '\n', // exactly one new lines (\r or \n or \r\n)
  				 *     <span class="code-block">...</span>,
  				 *     '\n', // exactly one new lines again
  				 *     <span class="punctuation">```</span>
  				 * ];
  				 */

  				var codeLang = token.content[1];
  				var codeBlock = token.content[3];

  				if (codeLang && codeBlock &&
  					codeLang.type === 'code-language' && codeBlock.type === 'code-block' &&
  					typeof codeLang.content === 'string') {

  					// this might be a language that Prism does not support

  					// do some replacements to support C++, C#, and F#
  					var lang = codeLang.content.replace(/\b#/g, 'sharp').replace(/\b\+\+/g, 'pp');
  					// only use the first word
  					lang = (/[a-z][\w-]*/i.exec(lang) || [''])[0].toLowerCase();
  					var alias = 'language-' + lang;

  					// add alias
  					if (!codeBlock.alias) {
  						codeBlock.alias = [alias];
  					} else if (typeof codeBlock.alias === 'string') {
  						codeBlock.alias = [codeBlock.alias, alias];
  					} else {
  						codeBlock.alias.push(alias);
  					}
  				}
  			}
  		}

  		walkTokens(env.tokens);
  	});

  	Prism.hooks.add('wrap', function (env) {
  		if (env.type !== 'code-block') {
  			return;
  		}

  		var codeLang = '';
  		for (var i = 0, l = env.classes.length; i < l; i++) {
  			var cls = env.classes[i];
  			var match = /language-(.+)/.exec(cls);
  			if (match) {
  				codeLang = match[1];
  				break;
  			}
  		}

  		var grammar = Prism.languages[codeLang];

  		if (!grammar) {
  			if (codeLang && codeLang !== 'none' && Prism.plugins.autoloader) {
  				var id = 'md-' + new Date().valueOf() + '-' + Math.floor(Math.random() * 1e16);
  				env.attributes['id'] = id;

  				Prism.plugins.autoloader.loadLanguages(codeLang, function () {
  					var ele = document.getElementById(id);
  					if (ele) {
  						ele.innerHTML = Prism.highlight(ele.textContent, Prism.languages[codeLang], codeLang);
  					}
  				});
  			}
  		} else {
  			env.content = Prism.highlight(textContent(env.content), grammar, codeLang);
  		}
  	});

  	var tagPattern = RegExp(Prism.languages.markup.tag.pattern.source, 'gi');

  	/**
  	 * A list of known entity names.
  	 *
  	 * This will always be incomplete to save space. The current list is the one used by lowdash's unescape function.
  	 *
  	 * @see {@link https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/unescape.js#L2}
  	 */
  	var KNOWN_ENTITY_NAMES = {
  		'amp': '&',
  		'lt': '<',
  		'gt': '>',
  		'quot': '"',
  	};

  	// IE 11 doesn't support `String.fromCodePoint`
  	var fromCodePoint = String.fromCodePoint || String.fromCharCode;

  	/**
  	 * Returns the text content of a given HTML source code string.
  	 *
  	 * @param {string} html
  	 * @returns {string}
  	 */
  	function textContent(html) {
  		// remove all tags
  		var text = html.replace(tagPattern, '');

  		// decode known entities
  		text = text.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi, function (m, code) {
  			code = code.toLowerCase();

  			if (code[0] === '#') {
  				var value;
  				if (code[1] === 'x') {
  					value = parseInt(code.slice(2), 16);
  				} else {
  					value = Number(code.slice(1));
  				}

  				return fromCodePoint(value);
  			} else {
  				var known = KNOWN_ENTITY_NAMES[code];
  				if (known) {
  					return known;
  				}

  				// unable to decode
  				return m;
  			}
  		});

  		return text;
  	}

  	Prism.languages.md = Prism.languages.markdown;

  }(Prism));

  Prism.languages.julia = {
  	'comment': {
  		// support one level of nested comments
  		// https://github.com/JuliaLang/julia/pull/6128
  		pattern: /(^|[^\\])(?:#=(?:[^#=]|=(?!#)|#(?!=)|#=(?:[^#=]|=(?!#)|#(?!=))*=#)*=#|#.*)/,
  		lookbehind: true
  	},
  	'regex': {
  		// https://docs.julialang.org/en/v1/manual/strings/#Regular-Expressions-1
  		pattern: /r"(?:\\.|[^"\\\r\n])*"[imsx]{0,4}/,
  		greedy: true
  	},
  	'string': {
  		// https://docs.julialang.org/en/v1/manual/strings/#String-Basics-1
  		// https://docs.julialang.org/en/v1/manual/strings/#non-standard-string-literals-1
  		// https://docs.julialang.org/en/v1/manual/running-external-programs/#Running-External-Programs-1
  		pattern: /"""[\s\S]+?"""|(?:\b\w+)?"(?:\\.|[^"\\\r\n])*"|`(?:[^\\`\r\n]|\\.)*`/,
  		greedy: true
  	},
  	'char': {
  		// https://docs.julialang.org/en/v1/manual/strings/#man-characters-1
  		pattern: /(^|[^\w'])'(?:\\[^\r\n][^'\r\n]*|[^\\\r\n])'/,
  		lookbehind: true,
  		greedy: true
  	},
  	'keyword': /\b(?:abstract|baremodule|begin|bitstype|break|catch|ccall|const|continue|do|else|elseif|end|export|finally|for|function|global|if|immutable|import|importall|in|let|local|macro|module|print|println|quote|return|struct|try|type|typealias|using|while)\b/,
  	'boolean': /\b(?:false|true)\b/,
  	'number': /(?:\b(?=\d)|\B(?=\.))(?:0[box])?(?:[\da-f]+(?:_[\da-f]+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[efp][+-]?\d+(?:_\d+)*)?j?/i,
  	// https://docs.julialang.org/en/v1/manual/mathematical-operations/
  	// https://docs.julialang.org/en/v1/manual/mathematical-operations/#Operator-Precedence-and-Associativity-1
  	'operator': /&&|\|\||[-+*^%÷⊻&$\\]=?|\/[\/=]?|!=?=?|\|[=>]?|<(?:<=?|[=:|])?|>(?:=|>>?=?)?|==?=?|[~≠≤≥'√∛]/,
  	'punctuation': /::?|[{}[\]();,.?]/,
  	// https://docs.julialang.org/en/v1/base/numbers/#Base.im
  	'constant': /\b(?:(?:Inf|NaN)(?:16|32|64)?|im|pi)\b|[πℯ]/
  };

  var css = "/**\n * prism.js default theme for JavaScript, CSS and HTML\n * Based on dabblet (http://dabblet.com)\n * @author Lea Verou\n */\n\ncode[class*=\"language-\"],\npre[class*=\"language-\"] {\n\tcolor: black;\n\tbackground: none;\n\ttext-shadow: 0 1px white;\n\tfont-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;\n\tfont-size: 1em;\n\ttext-align: left;\n\twhite-space: pre;\n\tword-spacing: normal;\n\tword-break: normal;\n\tword-wrap: normal;\n\tline-height: 1.5;\n\n\t-moz-tab-size: 4;\n\t-o-tab-size: 4;\n\ttab-size: 4;\n\n\t-webkit-hyphens: none;\n\t-moz-hyphens: none;\n\t-ms-hyphens: none;\n\thyphens: none;\n}\n\npre[class*=\"language-\"]::-moz-selection, pre[class*=\"language-\"] ::-moz-selection,\ncode[class*=\"language-\"]::-moz-selection, code[class*=\"language-\"] ::-moz-selection {\n\ttext-shadow: none;\n\tbackground: #b3d4fc;\n}\n\npre[class*=\"language-\"]::selection, pre[class*=\"language-\"] ::selection,\ncode[class*=\"language-\"]::selection, code[class*=\"language-\"] ::selection {\n\ttext-shadow: none;\n\tbackground: #b3d4fc;\n}\n\n@media print {\n\tcode[class*=\"language-\"],\n\tpre[class*=\"language-\"] {\n\t\ttext-shadow: none;\n\t}\n}\n\n/* Code blocks */\npre[class*=\"language-\"] {\n\tpadding: 1em;\n\tmargin: .5em 0;\n\toverflow: auto;\n}\n\n:not(pre) > code[class*=\"language-\"],\npre[class*=\"language-\"] {\n\tbackground: #f5f2f0;\n}\n\n/* Inline code */\n:not(pre) > code[class*=\"language-\"] {\n\tpadding: .1em;\n\tborder-radius: .3em;\n\twhite-space: normal;\n}\n\n.token.comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n\tcolor: slategray;\n}\n\n.token.punctuation {\n\tcolor: #999;\n}\n\n.token.namespace {\n\topacity: .7;\n}\n\n.token.property,\n.token.tag,\n.token.boolean,\n.token.number,\n.token.constant,\n.token.symbol,\n.token.deleted {\n\tcolor: #905;\n}\n\n.token.selector,\n.token.attr-name,\n.token.string,\n.token.char,\n.token.builtin,\n.token.inserted {\n\tcolor: #690;\n}\n\n.token.operator,\n.token.entity,\n.token.url,\n.language-css .token.string,\n.style .token.string {\n\tcolor: #9a6e3a;\n\t/* This background color was intended by the author of this theme. */\n\tbackground: hsla(0, 0%, 100%, .5);\n}\n\n.token.atrule,\n.token.attr-value,\n.token.keyword {\n\tcolor: #07a;\n}\n\n.token.function,\n.token.class-name {\n\tcolor: #DD4A68;\n}\n\n.token.regex,\n.token.important,\n.token.variable {\n\tcolor: #e90;\n}\n\n.token.important,\n.token.bold {\n\tfont-weight: bold;\n}\n.token.italic {\n\tfont-style: italic;\n}\n\n.token.entity {\n\tcursor: help;\n}\n";

  // Copyright 2018 The Distill Template Authors

  const T$8 = Template('d-code', `
<style>

code {
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 2px;
  padding: 4px 7px;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.6);
}

pre code {
  display: block;
  border-left: 2px solid rgba(0, 0, 0, .1);
  padding: 0 0 0 36px;
}

${css}
</style>

<code id="code-container"></code>

`);

  class Code extends Mutating(T$8(HTMLElement)) {

    renderContent() {

      // check if language can be highlighted
      this.languageName = this.getAttribute('language');
      if (!this.languageName) {
        console.warn('You need to provide a language attribute to your <d-code> block to let us know how to highlight your code; e.g.:\n <d-code language="python">zeros = np.zeros(shape)</d-code>.');
        return;
      }
      const language = prism.languages[this.languageName];
      if (language == undefined) {
        console.warn(`Distill does not yet support highlighting your code block in "${this.languageName}'.`);
        return;
      }

      let content = this.textContent;
      const codeTag = this.shadowRoot.querySelector('#code-container');

      if (this.hasAttribute('block')) {
        // normalize the tab indents
        content = content.replace(/\n/, '');
        const tabs = content.match(/\s*/);
        content = content.replace(new RegExp('\n' + tabs, 'g'), '\n');
        content = content.trim();
        // wrap code block in pre tag if needed
        if (codeTag.parentNode instanceof ShadowRoot) {
          const preTag = document.createElement('pre');
          this.shadowRoot.removeChild(codeTag);
          preTag.appendChild(codeTag);
          this.shadowRoot.appendChild(preTag);
        }

      }

      codeTag.className = `language-${this.languageName}`;
      codeTag.innerHTML = prism.highlight(content, language);
    }

  }

  // Copyright 2018 The Distill Template Authors

  const T$7 = Template('d-footnote', `
<style>

d-math[block] {
  display: block;
}

:host {

}

sup {
  line-height: 1em;
  font-size: 0.75em;
  position: relative;
  top: -.5em;
  vertical-align: baseline;
}

span {
  color: hsla(206, 90%, 20%, 0.7);
  cursor: default;
}

.footnote-container {
  padding: 10px;
}

</style>

<d-hover-box>
  <div class="footnote-container">
    <slot id="slot"></slot>
  </div>
</d-hover-box>

<sup>
  <span id="fn-" data-hover-ref=""></span>
</sup>

`);

  class Footnote extends T$7(HTMLElement) {

    constructor() {
      super();

      const options = {childList: true, characterData: true, subtree: true};
      const observer = new MutationObserver(this.notify);
      observer.observe(this, options);
    }

    notify() {
      const options = { detail: this, bubbles: true };
      const event = new CustomEvent('onFootnoteChanged', options);
      document.dispatchEvent(event);
    }

    connectedCallback() {
      // listen and notify about changes to slotted content
      // const slot = this.shadowRoot.querySelector('#slot');
      // console.warn(slot.textContent);
      // slot.addEventListener('slotchange', this.notify);
      this.hoverBox = this.root.querySelector('d-hover-box');
      window.customElements.whenDefined('d-hover-box').then(() => {
        this.hoverBox.listen(this);
      });
      // create numeric ID
      Footnote.currentFootnoteId += 1;
      const IdString = Footnote.currentFootnoteId.toString();
      this.root.host.id = 'd-footnote-' + IdString;

      // set up hidden hover box
      const id = 'dt-fn-hover-box-' + IdString;
      this.hoverBox.id = id;

      // set up visible footnote marker
      const span = this.root.querySelector('#fn-');
      span.setAttribute('id', 'fn-' + IdString);
      span.setAttribute('data-hover-ref', id);
      span.textContent = IdString;
    }

  }

  Footnote.currentFootnoteId = 0;

  // Copyright 2018 The Distill Template Authors

  const T$6 = Template('d-footnote-list', `
<style>

d-footnote-list {
  contain: layout style;
}

d-footnote-list > * {
  grid-column: text;
}

d-footnote-list a.footnote-backlink {
  color: rgba(0,0,0,0.3);
  padding-left: 0.5em;
}

</style>

<h3>Footnotes</h3>
<ol></ol>
`, false);

  class FootnoteList extends T$6(HTMLElement) {

    connectedCallback() {
      super.connectedCallback();

      this.list = this.root.querySelector('ol');
      // footnotes list is initially hidden
      this.root.style.display = 'none';
      // look through document and register existing footnotes
      // Store.subscribeTo('footnotes', (footnote) => {
      //   this.renderFootnote(footnote);
      // });
    }

    // TODO: could optimize this to accept individual footnotes?
    set footnotes(footnotes) {
      this.list.innerHTML = '';
      if (footnotes.length) {
        // ensure footnote list is visible
        this.root.style.display = '';

        for (const footnote of footnotes) {
          // construct and append list item to show footnote
          const listItem = document.createElement('li');
          listItem.id = footnote.id + '-listing';
          listItem.innerHTML = footnote.innerHTML;

          const backlink = document.createElement('a');
          backlink.setAttribute('class', 'footnote-backlink');
          backlink.textContent = '[↩]';
          backlink.href = '#' + footnote.id;

          listItem.appendChild(backlink);
          this.list.appendChild(listItem);
        }
      } else {
        // ensure footnote list is invisible
        this.root.style.display = 'none';
      }
    }

  }

  // Copyright 2018 The Distill Template Authors

  const T$5 = Template('d-hover-box', `
<style>

:host {
  position: absolute;
  width: 100%;
  left: 0px;
  z-index: 10000;
  display: none;
  white-space: normal
}

.container {
  position: relative;
  width: 704px;
  max-width: 100vw;
  margin: 0 auto;
}

.panel {
  position: absolute;
  font-size: 1rem;
  line-height: 1.5em;
  top: 0;
  left: 0;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(250, 250, 250, 0.95);
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-sizing: border-box;

  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

</style>

<div class="container">
  <div class="panel">
    <slot></slot>
  </div>
</div>
`);

  class HoverBox extends T$5(HTMLElement) {

    constructor() {
      super();
    }

    connectedCallback() {

    }

    listen(element) {
      // console.log(element)
      this.bindDivEvents(this);
      this.bindTriggerEvents(element);
      // this.style.display = "block";
    }

    bindDivEvents(element) {
      // For mice, same behavior as hovering on links
      element.addEventListener('mouseover', () => {
        if (!this.visible) this.showAtNode(element);
        this.stopTimeout();
      });
      element.addEventListener('mouseout', () => {
        this.extendTimeout(500);
      });
      // Don't trigger body touchstart event when touching within box
      element.addEventListener('touchstart', (event) => {
        event.stopPropagation();
      }, {passive: true});
      // Close box when touching outside box
      document.body.addEventListener('touchstart', () => {
        this.hide();
      }, {passive: true});
    }

    bindTriggerEvents(node) {
      node.addEventListener('mouseover', () => {
        if (!this.visible) {
          this.showAtNode(node);
        }
        this.stopTimeout();
      });

      node.addEventListener('mouseout', () => {
        this.extendTimeout(300);
      });

      node.addEventListener('touchstart', (event) => {
        if (this.visible) {
          this.hide();
        } else {
          this.showAtNode(node);
        }
        // Don't trigger body touchstart event when touching link
        event.stopPropagation();
      }, {passive: true});
    }

    show(position) {
      this.visible = true;
      this.style.display = 'block';
      // 10px extra offset from element
      this.style.top = Math.round(position[1] + 10) + 'px';
    }

    showAtNode(node) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
      const bbox = node.getBoundingClientRect();
      this.show([node.offsetLeft + bbox.width, node.offsetTop + bbox.height]);
    }

    hide() {
      this.visible = false;
      this.style.display = 'none';
      this.stopTimeout();
    }

    stopTimeout() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }

    extendTimeout(time) {
      this.stopTimeout();
      this.timeout = setTimeout(() => {
        this.hide();
      }, time);
    }

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  class Title extends HTMLElement {
    static get is() { return 'd-title'; }
  }

  // Copyright 2018 The Distill Template Authors

  const T$4 = Template('d-references', `
<style>
d-references {
  display: block;
}
</style>
`, false);

  class References extends T$4(HTMLElement) {

  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  class TOC extends HTMLElement {

    static get is() { return 'd-toc'; }

    connectedCallback() {
      if (!this.getAttribute('prerendered')) {
        window.onload = () => {
          const article = document.querySelector('d-article');
          const headings = article.querySelectorAll('h2, h3');
          renderTOC(this, headings);
        };
      }
    }

  }

  function renderTOC(element, headings) {

    let ToC =`
  <style>

  d-toc {
    contain: layout style;
    display: block;
  }

  d-toc ul {
    padding-left: 0;
  }

  d-toc ul > ul {
    padding-left: 24px;
  }

  d-toc a {
    border-bottom: none;
    text-decoration: none;
  }

  </style>
  <nav role="navigation" class="table-of-contents"></nav>
  <h2>Table of contents</h2>
  <ul>`;

    for (const el of headings) {
      // should element be included in TOC?
      const isInTitle = el.parentElement.tagName == 'D-TITLE';
      const isException = el.getAttribute('no-toc');
      if (isInTitle || isException) continue;
      // create TOC entry
      const title = el.textContent;
      const link = '#' + el.getAttribute('id');

      let newLine = '<li>' + '<a href="' + link + '">' + title + '</a>' + '</li>';
      if (el.tagName == 'H3') {
        newLine = '<ul>' + newLine + '</ul>';
      } else {
        newLine += '<br>';
      }
      ToC += newLine;

    }

    ToC += '</ul></nav>';
    element.innerHTML = ToC;
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // Figure
  //
  // d-figure provides a state-machine of visibility events:
  //
  //                         scroll out of view
  //                         +----------------+
  //   *do work here*        |                |
  // +----------------+    +-+---------+    +-v---------+
  // | ready          +----> onscreen  |    | offscreen |
  // +----------------+    +---------^-+    +---------+-+
  //                                 |                |
  //                                 +----------------+
  //                                  scroll into view
  //

  class Figure extends HTMLElement {

    static get is() { return 'd-figure'; }

    static get readyQueue() {
      if (!Figure._readyQueue) {
        Figure._readyQueue = [];
      }
      return Figure._readyQueue;
    }

    static addToReadyQueue(figure) {
      if (Figure.readyQueue.indexOf(figure) === -1) {
        Figure.readyQueue.push(figure);
        Figure.runReadyQueue();
      }
    }

    static runReadyQueue() {
      // console.log("Checking to run readyQueue, length: " + Figure.readyQueue.length + ", scrolling: " + Figure.isScrolling);
      // if (Figure.isScrolling) return;
      // console.log("Running ready Queue");
      const figure = Figure.readyQueue
        .sort((a,b) => a._seenOnScreen - b._seenOnScreen )
        .filter((figure) => !figure._ready)
        .pop();
      if (figure) {
        figure.ready();
        requestAnimationFrame(Figure.runReadyQueue);
      }

    }

    constructor() {
      super();
      // debugger
      this._ready = false;
      this._onscreen = false;
      this._offscreen = true;
    }

    connectedCallback() {
      this.loadsWhileScrolling = this.hasAttribute('loadsWhileScrolling');
      Figure.marginObserver.observe(this);
      Figure.directObserver.observe(this);
    }

    disconnectedCallback() {
      Figure.marginObserver.unobserve(this);
      Figure.directObserver.unobserve(this);
    }

    // We use two separate observers:
    // One with an extra 1000px margin to warn if the viewpoint gets close,
    // And one for the actual on/off screen events

    static get marginObserver() {
      if (!Figure._marginObserver) {
        // if (!('IntersectionObserver' in window)) {
        //   throw new Error('no interscetionobbserver!');
        // }
        const viewportHeight = window.innerHeight;
        const margin = Math.floor(2 * viewportHeight);
        const options = {rootMargin: margin + 'px 0px ' + margin + 'px 0px', threshold: 0.01};
        const callback = Figure.didObserveMarginIntersection;
        const observer = new IntersectionObserver(callback, options);
        Figure._marginObserver = observer;
      }
      return Figure._marginObserver;
    }

    static didObserveMarginIntersection(entries) {
      for (const entry of entries) {
        const figure = entry.target;
        if (entry.isIntersecting && !figure._ready) {
          Figure.addToReadyQueue(figure);
        }
      }
    }

    static get directObserver() {
      if (!Figure._directObserver) {
        Figure._directObserver = new IntersectionObserver(
          Figure.didObserveDirectIntersection, {
            rootMargin: '0px', threshold: [0, 1.0],
          }
        );
      }
      return Figure._directObserver;
    }

    static didObserveDirectIntersection(entries) {
      for (const entry of entries) {
        const figure = entry.target;
        if (entry.isIntersecting) {
          figure._seenOnScreen = new Date();
          // if (!figure._ready) { figure.ready(); }
          if (figure._offscreen) { figure.onscreen(); }
        } else {
          if (figure._onscreen) { figure.offscreen(); }
        }
      }
    }

    // Notify listeners that registered late, too:

    addEventListener(eventName, callback) {
      super.addEventListener(eventName, callback);
      // if we had already dispatched something while presumingly no one was listening, we do so again
      // debugger
      if (eventName === 'ready') {
        if (Figure.readyQueue.indexOf(this) !== -1) {
          this._ready = false;
          Figure.runReadyQueue();
        }
      }
      if (eventName === 'onscreen') {
        this.onscreen();
      }
    }

    // Custom Events

    ready() {
      // debugger
      this._ready = true;
      Figure.marginObserver.unobserve(this);
      const event = new CustomEvent('ready');
      this.dispatchEvent(event);
    }

    onscreen() {
      this._onscreen = true;
      this._offscreen = false;
      const event = new CustomEvent('onscreen');
      this.dispatchEvent(event);
    }

    offscreen() {
      this._onscreen = false;
      this._offscreen = true;
      const event = new CustomEvent('offscreen');
      this.dispatchEvent(event);
    }

  }

  if (typeof window !== 'undefined') {

    Figure.isScrolling = false;
    let timeout;
    const resetTimer = () => {
      Figure.isScrolling = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        Figure.isScrolling = false;
        Figure.runReadyQueue();
      }, 500);
    };
    window.addEventListener('scroll', resetTimer, true);

  }

  // Copyright 2018 The Distill Template Authors

  // This overlay is not secure.
  // It is only meant as a social deterrent.

  const productionHostname = 'distill.pub';
  const T$3 = Template('d-interstitial', `
<style>

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: white;

  opacity: 1;
  visibility: visible;

  display: flex;
  flex-flow: column;
  justify-content: center;
  z-index: 2147483647 /* MaxInt32 */

}

.container {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 420px;
  padding: 2em;
}

h1 {
  text-decoration: underline;
  text-decoration-color: hsl(0,100%,40%);
  -webkit-text-decoration-color: hsl(0,100%,40%);
  margin-bottom: 1em;
  line-height: 1.5em;
}

input[type="password"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  -webkit-border-radius: none;
  -moz-border-radius: none;
  -ms-border-radius: none;
  -o-border-radius: none;
  border-radius: none;
  outline: none;

  font-size: 18px;
  background: none;
  width: 25%;
  padding: 10px;
  border: none;
  border-bottom: solid 2px #999;
  transition: border .3s;
}

input[type="password"]:focus {
  border-bottom: solid 2px #333;
}

input[type="password"].wrong {
  border-bottom: solid 2px hsl(0,100%,40%);
}

p small {
  color: #888;
}

.logo {
  position: relative;
  font-size: 1.5em;
  margin-bottom: 3em;
}

.logo svg {
  width: 36px;
  position: relative;
  top: 6px;
  margin-right: 2px;
}

.logo svg path {
  fill: none;
  stroke: black;
  stroke-width: 2px;
}

</style>

<div class="overlay">
  <div class="container">
    <h1>This article is in review.</h1>
    <p>Do not share this URL or the contents of this article. Thank you!</p>
    <input id="interstitial-password-input" type="password" name="password" autofocus/>
    <p><small>Enter the password we shared with you as part of the review process to view the article.</small></p>
  </div>
</div>
`);

  class Interstitial extends T$3(HTMLElement) {

    connectedCallback() {
      if (this.shouldRemoveSelf()) {
        this.parentElement.removeChild(this);
      } else {
        const passwordInput = this.root.querySelector('#interstitial-password-input');
        passwordInput.oninput = (event) => this.passwordChanged(event);
      }
    }

    passwordChanged(event) {
      const entered = event.target.value;
      if (entered === this.password) {
        console.log('Correct password entered.');
        this.parentElement.removeChild(this);
        if (typeof(Storage) !== 'undefined') {
          console.log('Saved that correct password was entered.');
          localStorage.setItem(this.localStorageIdentifier(), 'true');
        }
      }
    }

    shouldRemoveSelf() {
      // should never be visible in production
      if (window && window.location.hostname === productionHostname) {
        console.warn('Interstitial found on production, hiding it.');
        return true
      }
      // should only have to enter password once
      if (typeof(Storage) !== 'undefined') {
        if (localStorage.getItem(this.localStorageIdentifier()) === 'true') {
          console.log('Loaded that correct password was entered before; skipping interstitial.');
          return true;
        }
      }
      // otherwise, leave visible
      return false;
    }

    localStorageIdentifier() {
      const prefix = 'distill-drafts';
      const suffix = 'interstitial-password-correct';
      return prefix + (window ? window.location.pathname : '-') + suffix
    }

  }

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(f) {
    let delta = f;
    let compare = f;

    if (f.length === 1) {
      delta = (d, x) => f(d) - x;
      compare = ascendingComparator(f);
    }

    function left(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    function right(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }

    function center(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }

    return {left, center, right};
  }

  function ascendingComparator(f) {
    return (d, x) => ascending$1(f(d), x);
  }

  function number$1(x) {
    return x === null ? NaN : +x;
  }

  const ascendingBisect = bisector(ascending$1);
  const bisectRight = ascendingBisect.right;
  bisector(number$1).center;

  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;

    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      let r0 = Math.round(start / step), r1 = Math.round(stop / step);
      if (r0 * step < start) ++r0;
      if (r1 * step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) * step;
    } else {
      step = -step;
      let r0 = Math.round(start * step), r1 = Math.round(stop * step);
      if (r0 / step < start) ++r0;
      if (r1 / step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function range(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i = -1,
        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb$1(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb$1, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  const radians = Math.PI / 180;
  const degrees = 180 / Math.PI;

  // https://observablehq.com/@mbostock/lab-and-rgb
  const K = 18,
      Xn = 0.96422,
      Yn = 1,
      Zn = 0.82521,
      t0$2 = 4 / 29,
      t1$2 = 6 / 29,
      t2 = 3 * t1$2 * t1$2,
      t3 = t1$2 * t1$2 * t1$2;

  function labConvert(o) {
    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl) return hcl2lab(o);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = rgb2lrgb(o.r),
        g = rgb2lrgb(o.g),
        b = rgb2lrgb(o.b),
        y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
    if (r === g && g === b) x = z = y; else {
      x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
      z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }

  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }

  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Lab, lab, extend(Color, {
    brighter: function(k) {
      return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    darker: function(k) {
      return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    rgb: function() {
      var y = (this.l + 16) / 116,
          x = isNaN(this.a) ? y : y + this.a / 500,
          z = isNaN(this.b) ? y : y - this.b / 200;
      x = Xn * lab2xyz(x);
      y = Yn * lab2xyz(y);
      z = Zn * lab2xyz(z);
      return new Rgb(
        lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
        lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
        lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
        this.opacity
      );
    }
  }));

  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0$2;
  }

  function lab2xyz(t) {
    return t > t1$2 ? t * t * t : t2 * (t - t0$2);
  }

  function lrgb2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }

  function rgb2lrgb(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function hclConvert(o) {
    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab)) o = labConvert(o);
    if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
    var h = Math.atan2(o.b, o.a) * degrees;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }

  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }

  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }

  function hcl2lab(o) {
    if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
    var h = o.h * radians;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }

  define(Hcl, hcl, extend(Color, {
    brighter: function(k) {
      return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
    },
    darker: function(k) {
      return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
    },
    rgb: function() {
      return hcl2lab(this).rgb();
    }
  }));

  var A = -0.14861,
      B = +1.78277,
      C = -0.29227,
      D = -0.90649,
      E = +1.97294,
      ED = E * D,
      EB = E * B,
      BC_DA = B * C - D * A;

  function cubehelixConvert(o) {
    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
        bl = b - l,
        k = (E * (g - l) - C * bl) / D,
        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
        h = s ? Math.atan2(k, bl) * degrees - 120 : NaN;
    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
  }

  function cubehelix$1(h, s, l, opacity) {
    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
  }

  function Cubehelix(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Cubehelix, cubehelix$1, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = isNaN(this.h) ? 0 : (this.h + 120) * radians,
          l = +this.l,
          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
          cosh = Math.cos(h),
          sinh = Math.sin(h);
      return new Rgb(
        255 * (l + a * (A * cosh + B * sinh)),
        255 * (l + a * (C * cosh + D * sinh)),
        255 * (l + a * (E * cosh)),
        this.opacity
      );
    }
  }));

  var constant$2 = x => () => x;

  function linear$1(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function hue(a, b) {
    var d = b - a;
    return d ? linear$1(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$2(isNaN(a) ? b : a);
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$2(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant$2(isNaN(a) ? b : a);
  }

  var rgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb(start, end) {
      var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb.gamma = rgbGamma;

    return rgb;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
        c = b.slice(),
        i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$2(b)
        : (t === "number" ? interpolateNumber
        : t === "string" ? ((c = color(b)) ? (b = c, rgb) : string)
        : b instanceof color ? rgb
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  var epsilon2 = 1e-12;

  function cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }

  function sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }

  function tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }

  ((function zoomRho(rho, rho2, rho4) {

    // p0 = [ux0, uy0, w0]
    // p1 = [ux1, uy1, w1]
    function zoom(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
          ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
          dx = ux1 - ux0,
          dy = uy1 - uy0,
          d2 = dx * dx + dy * dy,
          i,
          S;

      // Special case for u0 ≅ u1.
      if (d2 < epsilon2) {
        S = Math.log(w1 / w0) / rho;
        i = function(t) {
          return [
            ux0 + t * dx,
            uy0 + t * dy,
            w0 * Math.exp(rho * t * S)
          ];
        };
      }

      // General case.
      else {
        var d1 = Math.sqrt(d2),
            b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
            b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
            r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
            r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        i = function(t) {
          var s = t * S,
              coshr0 = cosh(r0),
              u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }

      i.duration = S * 1000 * rho / Math.SQRT2;

      return i;
    }

    zoom.rho = function(_) {
      var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
      return zoomRho(_1, _2, _4);
    };

    return zoom;
  }))(Math.SQRT2, 2, 4);

  function cubehelix(hue) {
    return (function cubehelixGamma(y) {
      y = +y;

      function cubehelix(start, end) {
        var h = hue((start = cubehelix$1(start)).h, (end = cubehelix$1(end)).h),
            s = nogamma(start.s, end.s),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.s = s(t);
          start.l = l(Math.pow(t, y));
          start.opacity = opacity(t);
          return start + "";
        };
      }

      cubehelix.gamma = cubehelixGamma;

      return cubehelix;
    })(1);
  }

  cubehelix(hue);
  cubehelix(nogamma);

  function constants(x) {
    return function() {
      return x;
    };
  }

  function number(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity$1(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constants(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) { return Math.max(a, Math.min(b, x)); };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp())
        .unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
        range = unit,
        interpolate$1 = interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity$1,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity$1, identity$1);
  }

  function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString("en").replace(/,/g, "")
        : x.toString(10);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimalParts(1.23) returns ["123", 0].
  function formatDecimalParts(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width === undefined ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded(x * 100, p),
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };

  function identity(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale$1(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
        percent = locale.percent === undefined ? "%" : locale.percent + "",
        minus = locale.minus === undefined ? "−" : locale.minus + "",
        nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Determine the sign. -0 is not less than 0, but 1 / -0 is!
          var valueNegative = value < 0 || 1 / value < 0;

          // Perform the initial formatting.
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale$1;
  var format;
  var formatPrefix;

  defaultLocale$1({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  function defaultLocale$1(definition) {
    locale$1 = formatLocale$1(definition);
    format = locale$1.format;
    formatPrefix = locale$1.formatPrefix;
    return locale$1;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }

      return scale;
    };

    return scale;
  }

  function linear() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  var t0$1 = new Date,
      t1$1 = new Date;

  function newInterval$1(floori, offseti, count, field) {

    function interval(date) {
      return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
    }

    interval.floor = function(date) {
      return floori(date = new Date(+date)), date;
    };

    interval.ceil = function(date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
    };

    interval.round = function(date) {
      var d0 = interval(date),
          d1 = interval.ceil(date);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.offset = function(date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function(start, stop, step) {
      var range = [], previous;
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range;
    };

    interval.filter = function(test) {
      return newInterval$1(function(date) {
        if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
      }, function(date, step) {
        if (date >= date) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
          } else while (--step >= 0) {
            while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
          }
        }
      });
    };

    if (count) {
      interval.count = function(start, end) {
        t0$1.setTime(+start), t1$1.setTime(+end);
        floori(t0$1), floori(t1$1);
        return Math.floor(count(t0$1, t1$1));
      };

      interval.every = function(step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null
            : !(step > 1) ? interval
            : interval.filter(field
                ? function(d) { return field(d) % step === 0; }
                : function(d) { return interval.count(0, d) % step === 0; });
      };
    }

    return interval;
  }

  var millisecond$1 = newInterval$1(function() {
    // noop
  }, function(date, step) {
    date.setTime(+date + step);
  }, function(start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond$1.every = function(k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond$1;
    return newInterval$1(function(date) {
      date.setTime(Math.floor(date / k) * k);
    }, function(date, step) {
      date.setTime(+date + step * k);
    }, function(start, end) {
      return (end - start) / k;
    });
  };
  millisecond$1.range;

  const durationSecond$1 = 1000;
  const durationMinute$1 = durationSecond$1 * 60;
  const durationHour$1 = durationMinute$1 * 60;
  const durationDay$1 = durationHour$1 * 24;
  const durationWeek$1 = durationDay$1 * 7;

  var second$1 = newInterval$1(function(date) {
    date.setTime(date - date.getMilliseconds());
  }, function(date, step) {
    date.setTime(+date + step * durationSecond$1);
  }, function(start, end) {
    return (end - start) / durationSecond$1;
  }, function(date) {
    return date.getUTCSeconds();
  });
  second$1.range;

  var minute$1 = newInterval$1(function(date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond$1);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute$1);
  }, function(start, end) {
    return (end - start) / durationMinute$1;
  }, function(date) {
    return date.getMinutes();
  });
  minute$1.range;

  var hour$1 = newInterval$1(function(date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond$1 - date.getMinutes() * durationMinute$1);
  }, function(date, step) {
    date.setTime(+date + step * durationHour$1);
  }, function(start, end) {
    return (end - start) / durationHour$1;
  }, function(date) {
    return date.getHours();
  });
  hour$1.range;

  var day$1 = newInterval$1(
    date => date.setHours(0, 0, 0, 0),
    (date, step) => date.setDate(date.getDate() + step),
    (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationDay$1,
    date => date.getDate() - 1
  );
  day$1.range;

  function weekday$1(i) {
    return newInterval$1(function(date) {
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationWeek$1;
    });
  }

  var sunday$1 = weekday$1(0);
  var monday$1 = weekday$1(1);
  var tuesday$1 = weekday$1(2);
  var wednesday$1 = weekday$1(3);
  var thursday$1 = weekday$1(4);
  var friday$1 = weekday$1(5);
  var saturday$1 = weekday$1(6);

  sunday$1.range;
  monday$1.range;
  tuesday$1.range;
  wednesday$1.range;
  thursday$1.range;
  friday$1.range;
  saturday$1.range;

  var month$1 = newInterval$1(function(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setMonth(date.getMonth() + step);
  }, function(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function(date) {
    return date.getMonth();
  });
  month$1.range;

  var year$1 = newInterval$1(function(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function(start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function(date) {
    return date.getFullYear();
  });

  // An optimized implementation for this simple case.
  year$1.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval$1(function(date) {
      date.setFullYear(Math.floor(date.getFullYear() / k) * k);
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step * k);
    });
  };
  year$1.range;

  var utcMinute$1 = newInterval$1(function(date) {
    date.setUTCSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute$1);
  }, function(start, end) {
    return (end - start) / durationMinute$1;
  }, function(date) {
    return date.getUTCMinutes();
  });
  utcMinute$1.range;

  var utcHour$1 = newInterval$1(function(date) {
    date.setUTCMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationHour$1);
  }, function(start, end) {
    return (end - start) / durationHour$1;
  }, function(date) {
    return date.getUTCHours();
  });
  utcHour$1.range;

  var utcDay$1 = newInterval$1(function(date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function(start, end) {
    return (end - start) / durationDay$1;
  }, function(date) {
    return date.getUTCDate() - 1;
  });
  utcDay$1.range;

  function utcWeekday$1(i) {
    return newInterval$1(function(date) {
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function(start, end) {
      return (end - start) / durationWeek$1;
    });
  }

  var utcSunday$1 = utcWeekday$1(0);
  var utcMonday$1 = utcWeekday$1(1);
  var utcTuesday$1 = utcWeekday$1(2);
  var utcWednesday$1 = utcWeekday$1(3);
  var utcThursday$1 = utcWeekday$1(4);
  var utcFriday$1 = utcWeekday$1(5);
  var utcSaturday$1 = utcWeekday$1(6);

  utcSunday$1.range;
  utcMonday$1.range;
  utcTuesday$1.range;
  utcWednesday$1.range;
  utcThursday$1.range;
  utcFriday$1.range;
  utcSaturday$1.range;

  var utcMonth$1 = newInterval$1(function(date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCMonth(date.getUTCMonth() + step);
  }, function(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, function(date) {
    return date.getUTCMonth();
  });
  utcMonth$1.range;

  var utcYear$1 = newInterval$1(function(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function(date) {
    return date.getUTCFullYear();
  });

  // An optimized implementation for this simple case.
  utcYear$1.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval$1(function(date) {
      date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step * k);
    });
  };
  utcYear$1.range;

  var t0 = new Date,
      t1 = new Date;

  function newInterval(floori, offseti, count, field) {

    function interval(date) {
      return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
    }

    interval.floor = function(date) {
      return floori(date = new Date(+date)), date;
    };

    interval.ceil = function(date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
    };

    interval.round = function(date) {
      var d0 = interval(date),
          d1 = interval.ceil(date);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.offset = function(date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function(start, stop, step) {
      var range = [], previous;
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range;
    };

    interval.filter = function(test) {
      return newInterval(function(date) {
        if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
      }, function(date, step) {
        if (date >= date) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
          } else while (--step >= 0) {
            while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
          }
        }
      });
    };

    if (count) {
      interval.count = function(start, end) {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };

      interval.every = function(step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null
            : !(step > 1) ? interval
            : interval.filter(field
                ? function(d) { return field(d) % step === 0; }
                : function(d) { return interval.count(0, d) % step === 0; });
      };
    }

    return interval;
  }

  var millisecond = newInterval(function() {
    // noop
  }, function(date, step) {
    date.setTime(+date + step);
  }, function(start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond.every = function(k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(function(date) {
      date.setTime(Math.floor(date / k) * k);
    }, function(date, step) {
      date.setTime(+date + step * k);
    }, function(start, end) {
      return (end - start) / k;
    });
  };
  millisecond.range;

  var durationSecond = 1e3;
  var durationMinute = 6e4;
  var durationHour = 36e5;
  var durationDay = 864e5;
  var durationWeek = 6048e5;

  var second = newInterval(function(date) {
    date.setTime(date - date.getMilliseconds());
  }, function(date, step) {
    date.setTime(+date + step * durationSecond);
  }, function(start, end) {
    return (end - start) / durationSecond;
  }, function(date) {
    return date.getUTCSeconds();
  });
  second.range;

  var minute = newInterval(function(date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute);
  }, function(start, end) {
    return (end - start) / durationMinute;
  }, function(date) {
    return date.getMinutes();
  });
  minute.range;

  var hour = newInterval(function(date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
  }, function(date, step) {
    date.setTime(+date + step * durationHour);
  }, function(start, end) {
    return (end - start) / durationHour;
  }, function(date) {
    return date.getHours();
  });
  hour.range;

  var day = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
  }, function(date) {
    return date.getDate() - 1;
  });
  day.range;

  function weekday(i) {
    return newInterval(function(date) {
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
    });
  }

  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);

  sunday.range;
  monday.range;
  tuesday.range;
  wednesday.range;
  thursday.range;
  friday.range;
  saturday.range;

  var month = newInterval(function(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setMonth(date.getMonth() + step);
  }, function(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function(date) {
    return date.getMonth();
  });
  month.range;

  var year = newInterval(function(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function(start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function(date) {
    return date.getFullYear();
  });

  // An optimized implementation for this simple case.
  year.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
      date.setFullYear(Math.floor(date.getFullYear() / k) * k);
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step * k);
    });
  };
  year.range;

  var utcMinute = newInterval(function(date) {
    date.setUTCSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute);
  }, function(start, end) {
    return (end - start) / durationMinute;
  }, function(date) {
    return date.getUTCMinutes();
  });
  utcMinute.range;

  var utcHour = newInterval(function(date) {
    date.setUTCMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationHour);
  }, function(start, end) {
    return (end - start) / durationHour;
  }, function(date) {
    return date.getUTCHours();
  });
  utcHour.range;

  var utcDay = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function(start, end) {
    return (end - start) / durationDay;
  }, function(date) {
    return date.getUTCDate() - 1;
  });
  utcDay.range;

  function utcWeekday(i) {
    return newInterval(function(date) {
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function(start, end) {
      return (end - start) / durationWeek;
    });
  }

  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);

  utcSunday.range;
  utcMonday.range;
  utcTuesday.range;
  utcWednesday.range;
  utcThursday.range;
  utcFriday.range;
  utcSaturday.range;

  var utcMonth = newInterval(function(date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCMonth(date.getUTCMonth() + step);
  }, function(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, function(date) {
    return date.getUTCMonth();
  });
  utcMonth.range;

  var utcYear = newInterval(function(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function(date) {
    return date.getUTCFullYear();
  });

  // An optimized implementation for this simple case.
  utcYear.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
      date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step * k);
    });
  };
  utcYear.range;

  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date.setFullYear(d.y);
      return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }

  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date.setUTCFullYear(d.y);
      return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }

  function newDate(y, m, d) {
    return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
  }

  function formatLocale(locale) {
    var locale_dateTime = locale.dateTime,
        locale_date = locale.date,
        locale_time = locale.time,
        locale_periods = locale.periods,
        locale_weekdays = locale.days,
        locale_shortWeekdays = locale.shortDays,
        locale_months = locale.months,
        locale_shortMonths = locale.shortMonths;

    var periodRe = formatRe(locale_periods),
        periodLookup = formatLookup(locale_periods),
        weekdayRe = formatRe(locale_weekdays),
        weekdayLookup = formatLookup(locale_weekdays),
        shortWeekdayRe = formatRe(locale_shortWeekdays),
        shortWeekdayLookup = formatLookup(locale_shortWeekdays),
        monthRe = formatRe(locale_months),
        monthLookup = formatLookup(locale_months),
        shortMonthRe = formatRe(locale_shortMonths),
        shortMonthLookup = formatLookup(locale_shortMonths);

    var formats = {
      "a": formatShortWeekday,
      "A": formatWeekday,
      "b": formatShortMonth,
      "B": formatMonth,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "f": formatMicroseconds,
      "g": formatYearISO,
      "G": formatFullYearISO,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes,
      "p": formatPeriod,
      "q": formatQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatSeconds,
      "u": formatWeekdayNumberMonday,
      "U": formatWeekNumberSunday,
      "V": formatWeekNumberISO,
      "w": formatWeekdayNumberSunday,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };

    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "f": formatUTCMicroseconds,
      "g": formatUTCYearISO,
      "G": formatUTCFullYearISO,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "q": formatUTCQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatUTCSeconds,
      "u": formatUTCWeekdayNumberMonday,
      "U": formatUTCWeekNumberSunday,
      "V": formatUTCWeekNumberISO,
      "w": formatUTCWeekdayNumberSunday,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };

    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "f": parseMicroseconds,
      "g": parseYear,
      "G": parseFullYear,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "q": parseQuarter,
      "Q": parseUnixTimestamp,
      "s": parseUnixTimestampSeconds,
      "S": parseSeconds,
      "u": parseWeekdayNumberMonday,
      "U": parseWeekNumberSunday,
      "V": parseWeekNumberISO,
      "w": parseWeekdayNumberSunday,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };

    // These recursive directive definitions must be deferred.
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);

    function newFormat(specifier, formats) {
      return function(date) {
        var string = [],
            i = -1,
            j = 0,
            n = specifier.length,
            c,
            pad,
            format;

        if (!(date instanceof Date)) date = new Date(+date);

        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
            else pad = c === "e" ? " " : "0";
            if (format = formats[c]) c = format(date, pad);
            string.push(c);
            j = i + 1;
          }
        }

        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }

    function newParse(specifier, Z) {
      return function(string) {
        var d = newDate(1900, undefined, 1),
            i = parseSpecifier(d, specifier, string += "", 0),
            week, day$1;
        if (i != string.length) return null;

        // If a UNIX timestamp is specified, return it.
        if ("Q" in d) return new Date(d.Q);
        if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

        // If this is utcParse, never use the local timezone.
        if (Z && !("Z" in d)) d.Z = 0;

        // The am-pm flag is 0 for AM, and 1 for PM.
        if ("p" in d) d.H = d.H % 12 + d.p * 12;

        // If the month was not specified, inherit from the quarter.
        if (d.m === undefined) d.m = "q" in d ? d.q : 0;

        // Convert day-of-week and week-of-year to day-of-year.
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            week = utcDate(newDate(d.y, 0, 1)), day$1 = week.getUTCDay();
            week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + (d.w + 6) % 7;
          } else {
            week = localDate(newDate(d.y, 0, 1)), day$1 = week.getDay();
            week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
            week = day.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + (d.w + 6) % 7;
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
        }

        // If a time zone is specified, all fields are interpreted as UTC and then
        // offset according to the specified time zone.
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }

        // Otherwise, all fields are in local time.
        return localDate(d);
      };
    }

    function parseSpecifier(d, specifier, string, j) {
      var i = 0,
          n = specifier.length,
          m = string.length,
          c,
          parse;

      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }

      return j;
    }

    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }

    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }

    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }

    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }

    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }

    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }

    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }

    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }

    function formatQuarter(d) {
      return 1 + ~~(d.getMonth() / 3);
    }

    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }

    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }

    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }

    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }

    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }

    function formatUTCQuarter(d) {
      return 1 + ~~(d.getUTCMonth() / 3);
    }

    return {
      format: function(specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function() { return specifier; };
        return f;
      },
      parse: function(specifier) {
        var p = newParse(specifier += "", false);
        p.toString = function() { return specifier; };
        return p;
      },
      utcFormat: function(specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function() { return specifier; };
        return f;
      },
      utcParse: function(specifier) {
        var p = newParse(specifier += "", true);
        p.toString = function() { return specifier; };
        return p;
      }
    };
  }

  var pads = {"-": "", "_": " ", "0": "0"},
      numberRe = /^\s*\d+/, // note: ignores next directive
      percentRe = /^%/,
      requoteRe = /[\\^$*+?|[\]().{}]/g;

  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "",
        string = (sign ? -value : value) + "",
        length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }

  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }

  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }

  function formatLookup(names) {
    var map = {}, i = -1, n = names.length;
    while (++i < n) map[names[i].toLowerCase()] = i;
    return map;
  }

  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }

  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.u = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.V = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }

  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }

  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
  }

  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }

  function parseQuarter(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
  }

  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }

  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }

  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }

  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }

  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }

  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }

  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }

  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
  }

  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }

  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = +n[0], i + n[0].length) : -1;
  }

  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.s = +n[0], i + n[0].length) : -1;
  }

  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }

  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }

  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }

  function formatDayOfYear(d, p) {
    return pad(1 + day.count(year(d), d), p, 3);
  }

  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }

  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }

  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }

  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }

  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }

  function formatWeekdayNumberMonday(d) {
    var day = d.getDay();
    return day === 0 ? 7 : day;
  }

  function formatWeekNumberSunday(d, p) {
    return pad(sunday.count(year(d) - 1, d), p, 2);
  }

  function dISO(d) {
    var day = d.getDay();
    return (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
  }

  function formatWeekNumberISO(d, p) {
    d = dISO(d);
    return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
  }

  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }

  function formatWeekNumberMonday(d, p) {
    return pad(monday.count(year(d) - 1, d), p, 2);
  }

  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }

  function formatYearISO(d, p) {
    d = dISO(d);
    return pad(d.getFullYear() % 100, p, 2);
  }

  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 10000, p, 4);
  }

  function formatFullYearISO(d, p) {
    var day = d.getDay();
    d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
    return pad(d.getFullYear() % 10000, p, 4);
  }

  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+"))
        + pad(z / 60 | 0, "0", 2)
        + pad(z % 60, "0", 2);
  }

  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }

  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }

  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }

  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }

  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }

  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }

  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }

  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }

  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }

  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }

  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
  }

  function UTCdISO(d) {
    var day = d.getUTCDay();
    return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
  }

  function formatUTCWeekNumberISO(d, p) {
    d = UTCdISO(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }

  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }

  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
  }

  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }

  function formatUTCYearISO(d, p) {
    d = UTCdISO(d);
    return pad(d.getUTCFullYear() % 100, p, 2);
  }

  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }

  function formatUTCFullYearISO(d, p) {
    var day = d.getUTCDay();
    d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }

  function formatUTCZone() {
    return "+0000";
  }

  function formatLiteralPercent() {
    return "%";
  }

  function formatUnixTimestamp(d) {
    return +d;
  }

  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1000);
  }

  var locale;
  var utcFormat;
  var utcParse;

  defaultLocale({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    locale.format;
    locale.parse;
    utcFormat = locale.utcFormat;
    utcParse = locale.utcParse;
    return locale;
  }

  var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

  function formatIsoNative(date) {
    return date.toISOString();
  }

  Date.prototype.toISOString
      ? formatIsoNative
      : utcFormat(isoSpecifier);

  function parseIsoNative(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  }

  +new Date("2000-01-01T00:00:00.000Z")
      ? parseIsoNative
      : utcParse(isoSpecifier);

  var noop = {value: function() {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function selection_selectAll(select) {
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  var keyPrefix = "$"; // Protect against keys like “__proto__”.

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = {},
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
        if (keyValue in nodeByKeyValue) {
          exit[i] = node;
        } else {
          nodeByKeyValue[keyValue] = node;
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = keyPrefix + key.call(parent, data[i], i, data);
      if (node = nodeByKeyValue[keyValue]) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue[keyValue] = null;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
        exit[i] = node;
      }
    }
  }

  function selection_data(value, key) {
    if (!value) {
      data = new Array(this.size()), j = -1;
      this.each(function(d) { data[++j] = d; });
      return data;
    }

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$1(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = value.call(parent, parent && parent.__data__, j, parents),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    var nodes = new Array(this.size()), i = -1;
    this.each(function() { nodes[++i] = this; });
    return nodes;
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;
    this.each(function() { ++size; });
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  var filterEvents = {};

  var event = null;

  if (typeof document !== "undefined") {
    var element = document.documentElement;
    if (!("onmouseenter" in element)) {
      filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
    }
  }

  function filterContextListener(listener, index, group) {
    listener = contextListener(listener, index, group);
    return function(event) {
      var related = event.relatedTarget;
      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
        listener.call(this, event);
      }
    };
  }

  function contextListener(listener, index, group) {
    return function(event1) {
      var event0 = event; // Events can be reentrant (e.g., focus).
      event = event1;
      try {
        listener.call(this, this.__data__, index, group);
      } finally {
        event = event0;
      }
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, capture) {
    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
    return function(d, i, group) {
      var on = this.__on, o, listener = wrap(value, i, group);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
          this.addEventListener(o.type, o.listener = listener, o.capture = capture);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, capture);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, capture) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    if (capture == null) capture = false;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
    return this;
  }

  function customEvent(event1, listener, that, args) {
    var event0 = event;
    event1.sourceEvent = event;
    event = event1;
    try {
      return listener.apply(that, args);
    } finally {
      event = event0;
    }
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  Selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root);
  }

  var nextId = 0;

  function Local() {
    this._ = "@" + (++nextId).toString(36);
  }

  Local.prototype = {
    constructor: Local,
    get: function(node) {
      var id = this._;
      while (!(id in node)) if (!(node = node.parentNode)) return;
      return node[id];
    },
    set: function(node, value) {
      return node[this._] = value;
    },
    remove: function(node) {
      return this._ in node && delete node[this._];
    },
    toString: function() {
      return this._;
    }
  };

  function sourceEvent() {
    var current = event, source;
    while (source = current.sourceEvent) current = source;
    return current;
  }

  function point(node, event) {
    var svg = node.ownerSVGElement || node;

    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }

    var rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
  }

  function mouse(node) {
    var event = sourceEvent();
    if (event.changedTouches) event = event.changedTouches[0];
    return point(node, event);
  }

  function touch(node, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

    for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return point(node, touch);
      }
    }

    return null;
  }

  function nopropagation() {
    event.stopImmediatePropagation();
  }

  function noevent() {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function nodrag(view) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", noevent, true);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, true);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, true);
      setTimeout(function() { selection.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  function constant(x) {
    return function() {
      return x;
    };
  }

  function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
    this.target = target;
    this.type = type;
    this.subject = subject;
    this.identifier = id;
    this.active = active;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this._ = dispatch;
  }

  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter() {
    return !event.ctrlKey && !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(d) {
    return d == null ? {x: event.x, y: event.y} : d;
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || ("ontouchstart" in this);
  }

  function drag() {
    var filter = defaultFilter,
        container = defaultContainer,
        subject = defaultSubject,
        touchable = defaultTouchable,
        gestures = {},
        listeners = dispatch("start", "drag", "end"),
        active = 0,
        mousedownx,
        mousedowny,
        mousemoving,
        touchending,
        clickDistance2 = 0;

    function drag(selection) {
      selection
          .on("mousedown.drag", mousedowned)
        .filter(touchable)
          .on("touchstart.drag", touchstarted)
          .on("touchmove.drag", touchmoved)
          .on("touchend.drag touchcancel.drag", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned() {
      if (touchending || !filter.apply(this, arguments)) return;
      var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
      if (!gesture) return;
      select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
      nodrag(event.view);
      nopropagation();
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start");
    }

    function mousemoved() {
      noevent();
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag");
    }

    function mouseupped() {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent();
      gestures.mouse("end");
    }

    function touchstarted() {
      if (!filter.apply(this, arguments)) return;
      var touches = event.changedTouches,
          c = container.apply(this, arguments),
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = beforestart(touches[i].identifier, c, touch, this, arguments)) {
          nopropagation();
          gesture("start");
        }
      }
    }

    function touchmoved() {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          noevent();
          gesture("drag");
        }
      }
    }

    function touchended() {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          nopropagation();
          gesture("end");
        }
      }
    }

    function beforestart(id, container, point, that, args) {
      var p = point(container, id), s, dx, dy,
          sublisteners = listeners.copy();

      if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function() {
        if ((event.subject = s = subject.apply(that, args)) == null) return false;
        dx = s.x - p[0] || 0;
        dy = s.y - p[1] || 0;
        return true;
      })) return;

      return function gesture(type) {
        var p0 = p, n;
        switch (type) {
          case "start": gestures[id] = gesture, n = active++; break;
          case "end": delete gestures[id], --active; // nobreak
          case "drag": p = point(container, id), n = active; break;
        }
        customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
      };
    }

    drag.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
    };

    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
    };

    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag) : subject;
    };

    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag) : touchable;
    };

    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  // Copyright 2018 The Distill Template Authors

  const T$2 = Template('d-slider', `
<style>
  :host {
    position: relative;
    display: inline-block;
  }

  :host(:focus) {
    outline: none;
  }

  .background {
    padding: 9px 0;
    color: white;
    position: relative;
  }

  .track {
    height: 3px;
    width: 100%;
    border-radius: 2px;
    background-color: hsla(0, 0%, 0%, 0.2);
  }

  .track-fill {
    position: absolute;
    top: 9px;
    height: 3px;
    border-radius: 4px;
    background-color: hsl(24, 100%, 50%);
  }

  .knob-container {
    position: absolute;
    top: 10px;
  }

  .knob {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 13px;
    height: 13px;
    background-color: hsl(24, 100%, 50%);
    border-radius: 50%;
    transition-property: transform;
    transition-duration: 0.18s;
    transition-timing-function: ease;
  }
  .mousedown .knob {
    transform: scale(1.5);
  }

  .knob-highlight {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 13px;
    height: 13px;
    background-color: hsla(0, 0%, 0%, 0.1);
    border-radius: 50%;
    transition-property: transform;
    transition-duration: 0.18s;
    transition-timing-function: ease;
  }

  .focus .knob-highlight {
    transform: scale(2);
  }

  .ticks {
    position: absolute;
    top: 16px;
    height: 4px;
    width: 100%;
    z-index: -1;
  }

  .ticks .tick {
    position: absolute;
    height: 100%;
    border-left: 1px solid hsla(0, 0%, 0%, 0.2);
  }

</style>

  <div class='background'>
    <div class='track'></div>
    <div class='track-fill'></div>
    <div class='knob-container'>
      <div class='knob-highlight'></div>
      <div class='knob'></div>
    </div>
    <div class='ticks'></div>
  </div>
`);

  // ARIA
  // If the slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label.
  // If the slider is vertically oriented, it has aria-orientation set to vertical. The default value of aria-orientation for a slider is horizontal.

  const keyCodes = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36
  };

  class Slider extends T$2(HTMLElement) {


    connectedCallback() {
      this.connected = true;
      this.setAttribute('role', 'slider');
      // Makes the element tab-able.
      if (!this.hasAttribute('tabindex')) { this.setAttribute('tabindex', 0); }

      // Keeps track of keyboard vs. mouse interactions for focus rings
      this.mouseEvent = false;

      // Handles to shadow DOM elements
      this.knob = this.root.querySelector('.knob-container');
      this.background = this.root.querySelector('.background');
      this.trackFill = this.root.querySelector('.track-fill');
      this.track = this.root.querySelector('.track');

      // Default values for attributes
      this.min = this.min ? this.min : 0;
      this.max = this.max ? this.max : 100;
      this.scale = linear().domain([this.min, this.max]).range([0, 1]).clamp(true);

      this.origin = this.origin !== undefined ? this.origin : this.min;
      this.step = this.step ? this.step : 1;
      this.update(this.value ? this.value : 0);

      this.ticks = this.ticks ? this.ticks : false;
      this.renderTicks();

      this.drag = drag()
        .container(this.background)
        .on('start', () => {
          this.mouseEvent = true;
          this.background.classList.add('mousedown');
          this.changeValue = this.value;
          this.dragUpdate();
        })
        .on('drag', () => {
          this.dragUpdate();
        })
        .on('end', () => {
          this.mouseEvent = false;
          this.background.classList.remove('mousedown');
          this.dragUpdate();
          if (this.changeValue !== this.value) this.dispatchChange();
          this.changeValue = this.value;
        });
      this.drag(select(this.background));

      this.addEventListener('focusin', () => {
        if(!this.mouseEvent) {
          this.background.classList.add('focus');
        }
      });
      this.addEventListener('focusout', () => {
        this.background.classList.remove('focus');
      });
      this.addEventListener('keydown', this.onKeyDown);

    }

    static get observedAttributes() {return ['min', 'max', 'value', 'step', 'ticks', 'origin', 'tickValues', 'tickLabels']; }

    attributeChangedCallback(attr, oldValue, newValue) {
      if (isNaN(newValue) || newValue === undefined || newValue === null) return;
      if (attr == 'min') {
        this.min = +newValue;
        this.setAttribute('aria-valuemin', this.min);
      }
      if (attr == 'max') {
        this.max = +newValue;
        this.setAttribute('aria-valuemax', this.max);
      }
      if (attr == 'value') {
        this.update(+newValue);
      }
      if (attr == 'origin') {
        this.origin = +newValue;
        // this.update(this.value);
      }
      if (attr == 'step') {
        if (newValue > 0) {
          this.step = +newValue;
        }
      }
      if (attr == 'ticks') {
        this.ticks = (newValue === '' ? true : newValue);
      }
    }

    onKeyDown(event) {
      this.changeValue = this.value;
      let stopPropagation = false;
      switch (event.keyCode) {
      case keyCodes.left:
      case keyCodes.down:
        this.update(this.value - this.step);
        stopPropagation = true;
        break;
      case keyCodes.right:
      case keyCodes.up:
        this.update(this.value + this.step);
        stopPropagation = true;
        break;
      case keyCodes.pageUp:
        this.update(this.value + this.step * 10);
        stopPropagation = true;
        break;

      case keyCodes.pageDown:
        this.update(this.value + this.step * 10);
        stopPropagation = true;
        break;
      case keyCodes.home:
        this.update(this.min);
        stopPropagation = true;
        break;
      case keyCodes.end:
        this.update(this.max);
        stopPropagation = true;
        break;
      }
      if (stopPropagation) {
        this.background.classList.add('focus');
        event.preventDefault();
        event.stopPropagation();
        if (this.changeValue !== this.value) this.dispatchChange();
      }
    }

    validateValueRange(min, max, value) {
      return Math.max(Math.min(max, value), min);
    }

    quantizeValue(value, step) {
      return Math.round(value / step) * step;
    }

    dragUpdate() {
      const bbox = this.background.getBoundingClientRect();
      const x = event.x;
      const width = bbox.width;
      this.update(this.scale.invert(x / width));
    }

    update(value) {
      let v = value;
      if (this.step !== 'any') {
        v = this.quantizeValue(value, this.step);
      }
      v = this.validateValueRange(this.min, this.max, v);
      if (this.connected) {
        this.knob.style.left = this.scale(v) * 100 + '%';
        this.trackFill.style.width = this.scale(this.min + Math.abs(v - this.origin)) * 100 + '%';
        this.trackFill.style.left = this.scale(Math.min(v, this.origin)) * 100 + '%';
      }
      if (this.value !== v) {
        this.value = v;
        this.setAttribute('aria-valuenow', this.value);
        this.dispatchInput();
      }
    }

    // Dispatches only on a committed change (basically only on mouseup).
    dispatchChange() {
      const e = new Event('change');
      this.dispatchEvent(e, {});
    }

    // Dispatches on each value change.
    dispatchInput() {
      const e = new Event('input');
      this.dispatchEvent(e, {});
    }

    renderTicks() {
      const ticksContainer = this.root.querySelector('.ticks');
      if (this.ticks !== false) {
        let tickData = [];
        if (this.ticks > 0) {
          tickData = this.scale.ticks(this.ticks);
        } else if (this.step === 'any') {
          tickData = this.scale.ticks();
        } else {
          tickData = range(this.min, this.max + 1e-6, this.step);
        }
        tickData.forEach(d => {
          const tick = document.createElement('div');
          tick.classList.add('tick');
          tick.style.left = this.scale(d) * 100 + '%';
          ticksContainer.appendChild(tick);
        });
      } else {
        ticksContainer.style.display = 'none';
      }
    }
  }

  var logo = "<svg viewBox=\"-607 419 64 64\">\n  <path d=\"M-573.4,478.9c-8,0-14.6-6.4-14.6-14.5s14.6-25.9,14.6-40.8c0,14.9,14.6,32.8,14.6,40.8S-565.4,478.9-573.4,478.9z\"/>\n</svg>\n";

  const headerTemplate = `
<style>
distill-header {
  position: relative;
  height: 60px;
  background-color: hsl(200, 60%, 15%);
  width: 100%;
  box-sizing: border-box;
  z-index: 2;
  color: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
distill-header .content {
  height: 70px;
  grid-column: page;
}
distill-header a {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 22px 0;
}
distill-header a:hover {
  color: rgba(255, 255, 255, 1);
}
distill-header svg {
  width: 24px;
  position: relative;
  top: 4px;
  margin-right: 2px;
}
@media(min-width: 1080px) {
  distill-header {
    height: 70px;
  }
  distill-header a {
    height: 70px;
    line-height: 70px;
    padding: 28px 0;
  }
  distill-header .logo {
  }
}
distill-header svg path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3px;
}
distill-header .logo {
  font-size: 17px;
  font-weight: 200;
}
distill-header .nav {
  float: right;
  font-weight: 300;
}
distill-header .nav a {
  font-size: 12px;
  margin-left: 24px;
  text-transform: uppercase;
}
</style>
<div class="content">
  <a href="/" class="logo">
    ${logo}
    Distill
  </a>
  <nav class="nav">
    <a href="/about/">About</a>
    <a href="/prize/">Prize</a>
    <a href="/journal/">Submit</a>
  </nav>
</div>
`;

  // Copyright 2018 The Distill Template Authors

  const T$1 = Template('distill-header', headerTemplate, false);

  class DistillHeader extends T$1(HTMLElement) {

  }

  // Copyright 2018 The Distill Template Authors

  const styles = `
<style>
  distill-appendix {
    contain: layout style;
  }

  distill-appendix .citation {
    font-size: 11px;
    line-height: 15px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    padding-left: 18px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0, 0, 0, 0.02);
    padding: 10px 18px;
    border-radius: 3px;
    color: rgba(150, 150, 150, 1);
    overflow: hidden;
    margin-top: -12px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  distill-appendix > * {
    grid-column: text;
  }
</style>
`;

  function appendixTemplate(frontMatter) {
    let html = styles;

    if (typeof frontMatter.githubUrl !== 'undefined') {
      html += `
    <h3 id="updates-and-corrections">Updates and Corrections</h3>
    <p>`;
      if (frontMatter.githubCompareUpdatesUrl) {
        html += `<a href="${frontMatter.githubCompareUpdatesUrl}">View all changes</a> to this article since it was first published.`;
      }
      html += `
    If you see mistakes or want to suggest changes, please <a href="${frontMatter.githubUrl + '/issues/new'}">create an issue on GitHub</a>. </p>
    `;
    }

    const journal = frontMatter.journal;
    if (typeof journal !== 'undefined' && journal.title === 'Distill') {
      html += `
    <h3 id="reuse">Reuse</h3>
    <p>Diagrams and text are licensed under Creative Commons Attribution <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a> with the <a class="github" href="${frontMatter.githubUrl}">source available on GitHub</a>, unless noted otherwise. The figures that have been reused from other sources don’t fall under this license and can be recognized by a note in their caption: “Figure from …”.</p>
    `;
    }

    if (typeof frontMatter.publishedDate !== 'undefined') {
      html += `
    <h3 id="citation">Citation</h3>
    <p>For attribution in academic contexts, please cite this work as</p>
    <pre class="citation short">${frontMatter.concatenatedAuthors}, "${frontMatter.title}", Distill, ${frontMatter.publishedYear}.</pre>
    <p>BibTeX citation</p>
    <pre class="citation long">${serializeFrontmatterToBibtex(frontMatter)}</pre>
    `;
    }

    return html;
  }

  class DistillAppendix extends HTMLElement {

    static get is() { return 'distill-appendix'; }

    set frontMatter(frontMatter) {
      this.innerHTML = appendixTemplate(frontMatter);
    }

  }

  const footerTemplate = `
<style>

:host {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
  padding: 2rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: hsl(180, 5%, 15%); /*hsl(200, 60%, 15%);*/
  text-align: left;
  contain: content;
}

.footer-container .logo svg {
  width: 24px;
  position: relative;
  top: 4px;
  margin-right: 2px;
}

.footer-container .logo svg path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3px;
}

.footer-container .logo {
  font-size: 17px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-right: 6px;
}

.footer-container {
  grid-column: text;
}

.footer-container .nav {
  font-size: 0.9em;
  margin-top: 1.5em;
}

.footer-container .nav a {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 6px;
  text-decoration: none;
}

</style>

<div class='footer-container'>

  <a href="/" class="logo">
    ${logo}
    Distill
  </a> is dedicated to clear explanations of machine learning

  <div class="nav">
    <a href="https://distill.pub/about/">About</a>
    <a href="https://distill.pub/journal/">Submit</a>
    <a href="https://distill.pub/prize/">Prize</a>
    <a href="https://distill.pub/archive/">Archive</a>
    <a href="https://distill.pub/rss.xml">RSS</a>
    <a href="https://github.com/distillpub">GitHub</a>
    <a href="https://twitter.com/distillpub">Twitter</a>
    &nbsp;&nbsp;&nbsp;&nbsp; ISSN 2476-0757
  </div>

</div>

`;

  // Copyright 2018 The Distill Template Authors

  const T = Template('distill-footer', footerTemplate);

  class DistillFooter extends T(HTMLElement) {

  }

  // Copyright 2018 The Distill Template Authors

  let templateIsLoading = false;
  let runlevel = 0;
  const initialize = function() {
    if (window.distill.runlevel < 1) {
      throw new Error("Insufficient Runlevel for Distill Template!");
    }

    /* 1. Flag that we're being loaded */
    if ("distill" in window && window.distill.templateIsLoading) {
      throw new Error(
        "Runlevel 1: Distill Template is getting loaded more than once, aborting!"
      );
    } else {
      window.distill.templateIsLoading = true;
      console.debug("Runlevel 1: Distill Template has started loading.");
    }

    /* 2. Add styles if they weren't added during prerendering */
    makeStyleTag(document);
    console.debug("Runlevel 1: Static Distill styles have been added.");
    console.debug("Runlevel 1->2.");
    window.distill.runlevel += 1;

    /* 3. Register Controller listener functions */
    /* Needs to happen before components to their connected callbacks have a controller to talk to. */
    for (const [functionName, callback] of Object.entries(Controller.listeners)) {
      if (typeof callback === "function") {
        document.addEventListener(functionName, callback);
      } else {
        console.error("Runlevel 2: Controller listeners need to be functions!");
      }
    }
    console.debug("Runlevel 2: We can now listen to controller events.");
    console.debug("Runlevel 2->3.");
    window.distill.runlevel += 1;

    /* 4. Register components */
    const components = [
      Abstract, Appendix, Article, Bibliography, Byline, Cite, CitationList, Code,
      Footnote, FootnoteList, FrontMatter, HoverBox, Title, DMath, References, TOC, Figure,
      Slider, Interstitial
    ];

    const distillComponents = [DistillHeader, DistillAppendix, DistillFooter];

    if (window.distill.runlevel < 2) {
      throw new Error("Insufficient Runlevel for adding custom elements!");
    }
    const allComponents = components.concat(distillComponents);
    for (const component of allComponents) {
      console.debug("Runlevel 2: Registering custom element: " + component.is);
      customElements.define(component.is, component);
    }

    console.debug(
      "Runlevel 3: Distill Template finished registering custom elements."
    );
    console.debug("Runlevel 3->4.");
    window.distill.runlevel += 1;

    // If template was added after DOMContentLoaded we may have missed that event.
    // Controller will check for that case, so trigger the event explicitly:
    if (domContentLoaded()) {
      Controller.listeners.DOMContentLoaded();
    }

    console.debug("Runlevel 4: Distill Template initialisation complete.");
    window.distill.templateIsLoading = false;
    window.distill.templateHasLoaded = true;
  };

  window.distill = { runlevel, initialize, templateIsLoading };

  /* 0. Check browser feature support; synchronously polyfill if needed */
  if (Polyfills.browserSupportsAllFeatures()) {
    console.debug("Runlevel 0: No need for polyfills.");
    console.debug("Runlevel 0->1.");
    window.distill.runlevel += 1;
    window.distill.initialize();
  } else {
    console.debug("Runlevel 0: Distill Template is loading polyfills.");
    Polyfills.load(window.distill.initialize);
  }

}));
//# sourceMappingURL=template.v2.js.map
