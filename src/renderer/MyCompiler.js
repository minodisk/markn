import React from 'react'
// import Compiler from 'imports?React=react!md2react'
import Compiler from 'imports?React=react!../../node_modules/md2react/src/index'
import path from 'path'
import classnames from 'classnames'
import Highlight from 'react-highlight'
import em from '../../node_modules/emojione/emoji.json'
import emojione from 'emojione'

let emo = {};
for (let key in em) {
  let val = em[key];
  emo[val.shortname] = val;
  val.aliases.forEach((alias) => {
    emo[alias] = val;
  });
}

let $ = React.createElement;

function emoji() {
  if( (typeof shortname === 'undefined') || (shortname === '') || (!(shortname in ns.emojioneList)) ) {
    // if the shortname doesnt exist just return the entire match
    return shortname;
  } else {
    unicode = ns.emojioneList[shortname][ns.emojioneList[shortname].length-1].toUpperCase();

    // depending on the settings, we'll either add the native unicode as the alt tag, otherwise the shortname
    // alt = (ns.unicodeAlt) ? ns.convert(unicode) : shortname;

    // if(ns.imageType === 'png') {
    //   if(ns.sprites) {
    //     replaceWith = '<span class="emojione-'+unicode+'" title="'+shortname+'">'+alt+'</span>';
    //   } else {
    //     replaceWith = '<img class="emojione" alt="'+alt+'" src="'+ns.imagePathPNG+unicode+'.png'+ns.cacheBustParam+'"/>';
    //   }
    // } else {
      // svg
      // if(ns.sprites) {
      //   replaceWith = '<svg class="emojione"><description>'+alt+'</description><use xlink:href="'+ns.imagePathSVGSprites+'#emoji-'+unicode+'"></use></svg>';
      // } else {
      //   replaceWith = '<object class="emojione" data="'+ns.imagePathSVG+unicode+'.svg'+ns.cacheBustParam+'" type="image/svg+xml" standby="'+alt+'">'+alt+'</object>';
      // }
    // }

    // return replaceWith;
  }
}

function highlight(code, lang, key) {
  return <Highlight className={lang}>{code}</Highlight>;
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
    // console.error(e.currentTarget.title, e.currentTarget.src);
  }

  text(node, defs, key, tableAlign) {
    if (node.value.indexOf(':') !== -1) {
      let chunks = node.value
      .split(/:([0-9a-z_+-]+):/g)
      .map((type, i) => {
        if (i % 2 === 0) {
          return type;
        }

        // let data = emo[type];
        // if (data == null) {
        //   console.warn("not found:", type);
        //   return type;
        // }
        // return <img title={type} alt={type} src={`../node_modules/emojione/assets/svg/${data.unicode}.svg`} onError={this.onError.bind(this)} />;
        return <i className={classnames('emojione', `emojione-${type}`)}></i>;
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
