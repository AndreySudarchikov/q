'use strict';

function Q(params) {
    if (!params) return new QueryArray(); // empty params protect
    if (typeof params === 'string') { return new QueryArray(...document.querySelectorAll(params));}   
    if (params instanceof QueryArray) return params;
    if (typeof params === 'function') return Q.ready(params);
    if (params instanceof NodeList || Array.isArray(params)) { return new QueryArray(...params);}
    if (params instanceof Node) { return new QueryArray(params); }
    if (typeof params[Symbol.iterator] === 'function') { return new QueryArray(...params); } // HTMLCollection as example
    return new QueryArray(params);
}

Q.build = {
    project: 'project - Leela Harmed Singh',
    date: '2025-12-14',
    note: 'svg cache + promise load'
};

Q.config = { debug: true }; // (true/false) globaly enable/disable all Q.log console messages

Q.nextFrame = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(callback){ return window.setTimeout(callback, 1000 / 60); } // return TO id

Q.cancelFrame = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : function(ID){ window.clearTimeout(ID); }

Q.ready = callBack => { 
    if (document.readyState !== 'loading') callBack();
    else document.addEventListener('DOMContentLoaded', callBack);
    return Q;
}

Q.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const dcalls = {};
Q.dcall = (name, delay, callBack) => {
    clearTimeout(dcalls[name]);
    dcalls[name] = setTimeout(callBack, delay);
}

Q.dcallStop = name => { clearTimeout(dcalls[name]); }

Q.create = (elemName,params={}) => { 
    const elem = Q(document.createElement(elemName)); 
    for(let p in params) { 
        if(p == 'attr') elem.attr(params.attr);
        else if(p == 'class') elem.classAdd(params.class);
        else if(p == 'css') elem.css(params.css);
        else elem[0][p] = params[p]
    }
    return elem;
}

Q.clamp = (value,min,max) => { return Math.max(min,Math.min(value,max)); }

Q.objExtend = function extend(obj1, obj2) {
    for (let key in obj2) {
        if (obj2[key] && obj2[key].constructor === Object) {
            obj1[key] ||= {};
            extend(obj1[key], obj2[key]);
        } else obj1[key] = obj2[key];
    }
    return obj1;
};

Q.urlQuery = new URLSearchParams(window.location.search);

Q.cssVar = function(target,varName,value){
    if(!target) target=document.documentElement;
    if(value === undefined) return getComputedStyle(target).getPropertyValue(varName);
    else target.style.setProperty(varName,value);
}

Q.cssProp = {
    get: function(propName,elem=document.body){ return getComputedStyle(Q(elem)[0]).getPropertyValue(propName) },
    set: function(propName,value,elem=document.body){ Q(elem)[0].style.setProperty(propName,value,null) }
}

Q.on = function(event,listener,opts){
    Q(window).on(event,listener,opts);
    return Q;
}

Q.one = function(event,listener){
    Q(window).one(event,listener,{ once: true });
    return Q;
}

Q.off = function(event,listener,opts){
    Q(window).off(event,listener,opts);
    return Q;
}

Q.cancelEvent = e => { e.stopPropagation(); e.preventDefault(); }

Q.dispatch = function(event,detail={}) { window.dispatchEvent(new CustomEvent(event, { detail: detail })); }

Q.log = Q.config.debug ? console.log.bind(console) : () => {};
Q.warn = Q.config.debug ? console.warn.bind(console) : () => {};
Q.error = Q.config.debug ? console.error.bind(console) : () => {};

const loadCache = new Map();
const svgCache = new Map();

Q.load = function (url, onload) {
    if (!loadCache.has(url)) {
        loadCache.set(url, fetch(url).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            return res.text();
        }));
    }
    const promise = loadCache.get(url);
    if (typeof onload === 'function') {
        promise.then(onload).catch(console.error);
    }
    return promise;
};

Q.loadSvg = function (url, onload) {
    return Q.load(url).then(text => {
        if (!svgCache.has(url)) {
            const temp = document.createElement('template');
            temp.innerHTML = text.trim();
            const svg = temp.content.querySelector('svg');
            if (!svg) throw new Error(`No SVG found in ${url}`);
            svgCache.set(url, svg);
        }
        const clone = svgCache.get(url).cloneNode(true);
        if (typeof onload === 'function') onload(clone);
        return clone;
    });
};


// ======================================================================================================================================================
// ======================================================================================================================================================
// ======================================================================================================================================================
// ======================================================================================================================================================
// Main Query Class

const cssNumber = new Set([
    "fillOpacity",
    "fill-opacity",
    "fontWeight",
    "font-weight",
    "lineHeight",
    "line-height",
    "zIndex",
    "z-index",
    "opacity",
    "orphans",
    "widows",
    "zoom"
])

function changeClass(elements,classString,action){
    elements.forEach(elem => {
        let cArr = classString.split(' ');
        cArr.forEach(c => { if(c !== '') elem.classList[action](c) });
    });
}

class QueryArray extends Array {

    remove(){
        this.forEach(elem => { elem.remove() });
        this.length = 0;
        return this;    
    }

    find(selector){
        let q = new QueryArray();
        if(typeof selector == 'string') this.forEach(elem => q.push(...elem.querySelectorAll(selector)) );
        return q;
    }

    parent(){
        let q = new QueryArray();
        this.forEach(elem => q.push(elem.parentNode) );
        return q;
    }

    children(){
        let q = new QueryArray();
        this.forEach(elem => q.push(...elem.children) );
        return q;
    }

    each(callback){
        this.forEach(callback);
        return this;
    }

    item(index){ return this[index] ? new QueryArray(this[index]) : new QueryArray(); }

    attr(attr, value){
        if(typeof attr == 'object') {
            this.forEach(elem => {
                for(let key in attr) elem.setAttribute(key,attr[key]);
            });
        } else if(typeof value != 'undefined') this.forEach(elem => elem.setAttribute(attr,value) );
        else if(this.length > 0) return (!!this[0].getAttribute) ? this[0].getAttribute(attr) : null;
        else return null;
        return this;
    }

    css(css, value){
        let setStyle = (elem,css,val) => {
            if(typeof val == 'number' && !cssNumber.has(css)) val += 'px';
            elem.style[css] = val ;
            if(css == 'userSelect') elem.style['-webkit-user-select'] = val;
        }

        if(typeof css == 'object') { this.forEach(elem => { for(let key in css) setStyle(elem,key,css[key]); }); } 
        else if(typeof value != 'undefined') this.forEach(elem => setStyle(elem,css,value) );
        else if(this.length > 0) return getComputedStyle(this[0])[css];
        else return null;
        return this;
    }

    html(html){
        this.forEach(elem => elem.innerHTML = html);
        return this;
    }

    htmlAdd(html){
        this.forEach(elem => elem.innerHTML += html);
        return this;
    }

    empty(html){
        this.forEach(elem => elem.innerHTML = '');
        return this;
    }

    append(elements){
        if(elements instanceof Element) elements = [elements];
        this.forEach( parent => elements.forEach(child => parent.append(child)) );
        return this;
    }

    appendTo(elements){
        if(elements instanceof Element) elements = [elements];
        this.forEach( child => elements.forEach(parent => parent.append(child)) );
        return this;
    }

    on(event, listener, opts={}){
        this.forEach(elem => elem.addEventListener(event,listener,opts) );
        return this;
    }

    one(event, listener){
        this.forEach(elem => elem.addEventListener(event,listener,{ once: true }) );
        return this;
    }

    off(event, listener, opts={}){
        this.forEach(elem => elem.removeEventListener(event,listener,opts) );
        return this;
    }  
    
    classAdd(classString, cond=true){
        if(cond) changeClass(this,classString,'add');
        return this;
    }

    classRemove(classString, cond=true){
        if(cond) changeClass(this,classString,'remove');
        return this;
    }

    classToggle(classString, cond=true){
        if(cond) changeClass(this,classString,'toggle');
        return this;
    }

    classToggleIf(classString, cond){
        changeClass(this,classString,(cond ? 'add' : 'remove'));
        return this;
    }

    classContains(classString){
        let contains = false;
        this.forEach(elem => {
            let cArr = classString.split(' ');
            cArr.forEach(c => { if(c !== '' && !contains) contains = elem.classList.contains(c); });
        });
        return contains;
    }

    getRect(propName='rect'){
        this.forEach(elem => elem[propName] = elem.getBoundingClientRect() );
        return this
    }
   
    loadSvg(url, onload){ 
        this.forEach(elem => { 
            Q.loadSvg(url).then(svg => { 
                elem.append(svg); 
                // onload?.(elem,svg);
                if(typeof onload == 'function') onload(elem,svg);
            });
        });
    }

    loadText(url, onload){ 
        this.forEach(elem => { 
            Q.load(url).then(txt => { 
                elem.innerHTML = txt; 
                // onload?.(elem,txt); 
                if(typeof onload == 'function') onload(elem,txt); 
            });
        });
    }
    
}


export { Q }
