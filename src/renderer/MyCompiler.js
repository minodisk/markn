import React from 'react'
// import Compiler from 'imports?React=react!md2react'
import Compiler from 'imports?React=react!../../node_modules/md2react/src/index'
import path from 'path'
import classnames from 'classnames'
import Highlight from 'react-highlight'
// import emoji from 'node-emoji'
// import twemoji from 'twemoji'
// import 'emojione'

let $ = React.createElement;

function highlight(code, lang, key) {
  return <Highlight className={lang}>{code}</Highlight>;
}

function toCodePoint(unicodeSurrogates, sep) {
  var
    r = [],
    c = 0,
    p = 0,
    i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
      p = 0;
    } else if (0xD800 <= c && c <= 0xDBFF) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join(sep || '-');
}

export default class MyCompiler extends Compiler {
  constructor(opts) {
    opts.highlight = highlight;
    super(opts);
  }

  compile({md, dirname, search, indication}) {
    this.dirname = dirname;
    if (search === '') {
      this.search = null;
    } else {
      this.search = {
        text: search,
        regExp: new RegExp(`(${search})`, 'ig')
      };
    }
    this.indication = indication;

    this.ids = {};
    this.marksCount = 0;
    return super.compile(md);
  }

  root(node, defs, key, tableAlign) {
    return $('div', {
      key,
      className: 'markdown-body'
    }, this.toChildren(node, defs, key));
  }

  onError(e) {
    console.error(e.currentTarget.title, e.currentTarget.alt);
  }

  text(node, defs, key, tableAlign) {
    if (node.value.indexOf(':') !== -1) {
      let chunks = node.value
      .split(/:([0-9a-z_+-]+):/g)
      .map((type, i) => {
        if (i % 2 === 0) {
          return type;
        }
        // let char = emoji.get(type);
        // if (char == null) {
        //   console.warn(type);
        //   return type;
        // }
        // let code = twemoji.convert.toCodePoint(char);
        // // return <img src={`https://twemoji.maxcdn.com/svg/${code}.svg`} />;

        // let image = emojione.shortnameToImage(type);
        // console.log(image);

        // return <img title={type} alt={code} src={`../node_modules/twemoji/svg/${code}.svg`} onError={this.onError.bind(this)} />;
        // return <i className={classnames('twa', `twa-${type}`)}></i>;
      });
      return $('span', {}, chunks);
    }

    if (!this.search || node.value.indexOf(this.search.text) === -1) {
      return node.value;
    }
    let children = [];
    let words = node.value.split(this.search.regExp);
    words = words.map((word, i) => {
      if (i % 2 === 0) {
        return word
      }
      return $('mark', {
        className: this.marksCount === this.indication ? 'indicated' : '',
        ref: `mark${this.marksCount++}`
      }, word);
    });
    return $('span', {}, words);
  }

  image({src, title, alt}, defs, key, tableAlign) {
    if(!(/^https?:\/\//.test(src))) {
      src = path.resolve(this.dirname, src);
    }
    return $('img', {
      key,
      src: src,
      title: title,
      alt: alt
    });
  }

  link(node, defs, key, tableAlign) {
    if(!(/^https?:\/\//.test(node.href))) {
      node.href = path.resolve(this.dirname, node.href);
    }
    return $('a', {
      key,
      href: node.href,
      title: node.title
    }, this.toChildren(node, defs, key));
  }

  heading(node, defs, key, tableAlign) {
    let text = node.children
      .filter((child) => { return child.type == 'text' })
      .map((child) => { return child.value })
      .join('');
    let id = text
      .toLowerCase()
      .replace(/\s/g, '-')
      .replace(/[!<>#%@&='"`:;,\.\*\+\(\)\{\}\[\]\\\/\|\?\^\$]+/g, '')
    if (this.ids[id] == null) {
      this.ids[id] = 0;
    } else {
      this.ids[id]++;
      id = `${id}-${this.ids[id]}`
    }
    return $(('h'+node.depth.toString()), {key}, [
      $('a', {key: key+'-a', id: id, className: 'anchor', href: '#'+id}, [
        $('span', {key: key+'-a-span', className: 'icon icon-link'})
      ]),
      this.toChildren(node, defs, key)
    ]);
  }
}
