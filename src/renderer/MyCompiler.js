import React from 'react'
// import Compiler from 'imports?React=react!md2react'
import Compiler from 'imports?React=react!../../node_modules/md2react/src/index'
import path from 'path'

let $ = React.createElement;

export default class MyCompiler extends Compiler {
  compile({md, dirname, search, indication}) {
    this.dirname = dirname;
    if (search === '') {
      this.search = null;
    } else {
      this.search = new RegExp(`(${search})`, 'ig');
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

  text(node, defs, key, tableAlign) {
    if (!this.search) {
      return node.value;
    }
    let children = [];
    let words = node.value.split(this.search);
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
    console.log(this.dirname, src);
      src = path.resolve(this.dirname, src);
    console.log(this.dirname, src);
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
