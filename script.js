
document.addEventListener('DOMContentLoaded', function (e) {

    View.initialize();

    //this.KeyMapViewController = new View();
});


/**
 * 
 */
function Content(){
    throw `${this.constructor.name} is a Static Class`;

};
/**
 * @param {Boolean} list
 * @returns {Object|Object[]}
 */
Content.storage = function( list = false ){
    const keys = atob(localStorage.getItem('keyguard') || '');
    const storage = typeof keys === 'string' && keys.length ? JSON.parse(keys) : {};
    return typeof list === 'boolean' && list ? Object.keys(storage) : storage;
};
/**
 * @param {String} name 
 * @returns {Object}
 */
Content.load = function( name ){
    const storage = this.storage();
    return storage.hasOwnProperty(name) ? JSON.parse(atob(storage[name])) : null;
};
/**
 * @param {KeyGuard} key
 * @returns {Storage}
 */
Content.save = function( key ){
    if( key instanceof KeyGuard && key.valid()){
        const storage = this.storage();
        storage[key.name()] = key.export();
        this.write(storage);
    }
    return this;
};
/**
 * @param {Object} content 
 * @returns {Content}
 */
Content.write = function( content ){
    localStorage.setItem('keyguard', typeof content === 'object' ? btoa(JSON.stringify(content) ) : '' );
    return this;
};
/**
 * @param {String} name 
 * @returns {Storage}
 */
Content.remove = function( name ){
    const storage = this.storage();
    if( storage.hasOwnProperty(name ) ){
        delete storage[name];
        this.write( storage );
    }
    return this;
};



/**
 * 
 */
function View(){
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * @param {String} name 
 * @returns {View}
 */
View.set = function( name ){
    const views = Array.prototype.slice.call(document.getElementsByClassName('view'));

    views.forEach( function( view ){
        if( view.id === name ){
            view.classList.add('show');
        }
        else{
            view.classList.remove('show');
        }
    });
    this.menu().classList.remove('open');
    return this;
};
/**
 * @returns {KeyGuard}
 */
View.current = function(){
    return this.hasOwnProperty('_key') ? this._key : this.setCurrent().current();
};
/**
 * @param {KeyGuard} key 
 * @returns View
 */
View.setCurrent = function( key ){
    this._key = key instanceof KeyGuard ? key : new KeyGuard();
    return this;
};
/**
 * @param {KeyGuard} key 
 * @returns {view}
 */
View.display = function( key ){

    if( key instanceof KeyGuard){
        View.setCurrent(key);
        this.displayName().innerHTML = key.name();
        this.displayMethod().innerHTML = key.method();
        this.displayContent().innerHTML = key.content();
        this.displayDate().innerHTML = key.date(true).toLocaleString();
        this.revealButton().classList.add('hidden');
        this.removeButton().setAttribute('data-name',key.name());
    }
    return this.set('display-view');
};
/**
 * @returns {View}
 */
View.new = function(){
    return this.clear().set('form-view');
};
/**
 * @returns {View}
 */
View.main = function(){
    return this.set('main-view');
};
;
/**
 * @returns Element
 */
View.inputName = function(){
    return document.getElementById('name');
};
/**
 * @returns Element
 */
View.inputMethod = function(){
    return document.getElementById('method');
};
/**
 * @returns {Element}
 */
View.displayName = function(){
    return document.getElementById('displayName');
};
/**
 * @returns {Element}
 */
View.displayMethod = function(){
    return document.getElementById('displayMethod');
};
/**
 * @returns {Element}
 */
View.displayContent = function(){
    return document.getElementById('displayContent');
};
/**
 * @returns {Element}
 */
View.displayDate = function(){
    return document.getElementById('displayDate');
};
/**
 * @returns {Element}
 */
View.revealButton = function(){
    return document.getElementById('reveal');
};
/**
 * @returns {Element}
 */
View.showButton = function(){
    return document.getElementById('show');
};
/**
 * @returns {Element}
 */
View.removeButton = function(){
    return document.getElementById('remove');
}
/**
 * @param {Boolean} active 
 * @returns {View}
 */
View.toggleShowButton = function( active = false ){
    if( active ){
        this.showButton().classList.add('active');
        this.revealButton().classList.remove('hidden');
    }
    else{
        this.showButton().classList.remove('active');
        this.revealButton().classList.add('hidden');
    }
    this.showButton().innerHTML = active ? 'Encode' : 'Decode';
    this.displayContent().innerHTML = View.current().content(active);
    return this;
};
/**
 * @returns {Boolean}
 */
View.showButtonStatus = function(){
    return this.showButton().classList.contains('active');
}
/**
 * @returns Element
 */
View.methods = function(){
    return document.getElementById('methods');
};
/**
 * @param {Number} size 
 * @returns {View}
 */
View.fillMethods = function( size ){
    this.inputMethod().innerHTML = "<option value=''>Select method</option>";
    Methods.filter(size || 0).forEach(function( method ){
        var option = document.createElement('option');
        option.value,option.innerHTML = method;
        View.inputMethod().appendChild(option);
    });
    return this;
};
/**
 * @returns Element
 */
View.inputContent = function(){
    return document.getElementById('content');
};
/**
 * @returns Element
 */
View.inputImport = function(){
    return document.getElementById('import');
};
/**
 * @returns {Element}
 */
View.menu = function(){
    return document.getElementById('menu');
};
/**
 * @returns Element
 */
View.saved = function(){
    return document.getElementById('saved');
};
/**
 * @param {String[]} items 
 * @returns {View}
 */
View.refreshMenu = function( items = [] ){

    this.saved().innerHTML = '';

    items.forEach( function( name ){
        const item = document.createElement('li');
        item.innerHTML = name;
        item.setAttribute('data-name',name);
        item.className = 'item';
        item.addEventListener('click', function(e){
            e.preventDefault();
            const key = View.load(this.dataset.name);
            if(key !== null ){
                View.display( key );
            }
            else{
                View.new();
            }
            return true;
        });
        View.saved().appendChild(item);
    });

    return this;
};
/**
 * @returns {View}
 */
View.clear = function(){
    this.inputContent().value = '';
    this.inputName().value = '';
    this.methods().dataset.methods = '';
    return this;
};
/**
 * @param {String} name 
 * @returns KeyGuard
 */
View.load = function( name ){
    //View.set('display-view');
    const data = Content.load(name);
    if( data !== null ){
        const key = new KeyGuard(...Object.values(data));
        key._content = data._content;
        return key;
    }
    return null;
};
/**
 * @param {String} name 
 * @returns {View}
 */
View.remove = function( name ){
    Content.remove(name);
    return this.refreshMenu(Content.storage(true));
};
/**
 * @returns {View}
 */
View.save = function(){

    const content = this.inputContent().value.toString();
    const method = this.methods().value.toString();
    const name = this.inputName().value.toString();
    const key = new KeyGuard( name , method , content );
    Content.save( key );
    this.refreshMenu(Content.storage(true)).display(key);

    return this;
};
/**
 * @returns {View}
 */
View.initialize = function(){

    this.inputContent().addEventListener('change',function(e){
        const content = this.value.toString();
        const words = content.split(' ').length;
        const letters = content.split('').length;
        View.fillMethods( words > 1 ? words : (letters > 4 ? letters : 0 ) );
        return true;
    });

    this.inputMethod().addEventListener('change', function(e){
        e.preventDefault();
        const selected = this.value.toString();
        if( selected.length ){
            const method = View.methods();
            method.value += this.value.toString();
            method.setAttribute('data-methods',method.value.toString());
        }
        return true;
    });

    this.methods().addEventListener( 'click' , function(e){
        e.preventDefault();
        this.dataset.methods,this.value = '';
        return true;
    });

    const buttons = Array.prototype.slice.call(document.getElementsByName('action'));
    buttons.forEach( function( btn ){
        btn.addEventListener('click',function(e){
            e.preventDefault();
            switch(e.srcElement.value){
                case 'save':
                    View.save();
                    break;
                case 'clear':
                    View.clear();
                    break;
                case 'new':
                    View.new();
                    break;
                case 'remove':
                    const name = this.dataset.name || '';
                    if( name.length ){
                        Content.remove(name);
                        View.refreshMenu(Content.storage(true)).main();
                    }
                    break;
                case 'reveal':
                    View.displayContent().innerHTML = View.current().decode(true);
                    View.revealButton().classList.add('hidden');
                    break;
                case 'show':
                    View.toggleShowButton(!View.showButtonStatus());
                    break;
                case 'importform':
                    View.set('import-view');
                    break;
                case 'import':
                    const key = KeyGuard.Import(View.inputImport().value);
                    Content.save(key);
                    View.inputImport().value = '';
                    View.refreshMenu(Content.storage(true));
                    View.display(key);
                    break;
                case 'export':
                    View.displayContent().innerHTML = View.current().export();
                    break;
                default:
                    console.log(`${this.name} : ${this.value}`);
                    break;
            }
            return true;
        });
    });

    this.refreshMenu( Content.storage(true ) );

    document.getElementById('menu-button').addEventListener('click', e => {
        e.preventDefault();
        View.menu().classList.toggle('open');
        return true;
    });

    return this;
};
/**
 * @param {KeyGuard} key 
 * @returns {View}
 */
View.setKey = function( key ){
    this._key = null;
    if( key instanceof KeyGuard ){
        this._key = key;
    }
    return this;
};
/**
 * @returns Boolean
 */
View.hasKey = function(){
    return typeof this._key !== 'undefined' && this._key instanceof KeyGuard;
};
/**
 * @returns {KeyGuard}
 */
View.key = function(){
    return this.hasKey() ? this._key : this.setKey().key();
};

function Methods(){
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * @param {Number} length
 * @return {String[]}
 */
Methods.filter = function (length) {
    var methods = this.list(true);
    return typeof length === 'number' && length ? methods.filter(function (method) {
        return length >= Methods.list()[method];
    }) : methods;
};
/**
 * @param {Boolean} list
 * @return {Object|String[]}
 */
Methods.list = function (list = false) {
    const methods = {
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'E': 5,
        'X': 3,
        'Y': 2,
        'Z': 1,
        'R': 2,
    };
    return list ? Object.keys(methods) : methods;
};


/**
 * @param {String} name
 * @param {String} method
 * @param {String} content
 * @param {String} ts
 */
function KeyGuard(name, method, content, ts) {

    this._name = name;
    this._method = method || '';
    this._content = typeof content === 'string' && content.length ? this.encode(content) : '';
    this._ts = ts || new Date().toISOString();
    this._hash = '';

}
/**
 * @return {String}
 */
KeyGuard.prototype.toString = function () {
    return `[${this.name()}|${this.content()}]`;
};
/**
 * @returns Boolean
 */
KeyGuard.prototype.valid = function(){
    return this.name().length && this.content().length;
};
/**
 * @return {String}
 */
KeyGuard.prototype.name = function () {
    return this._name;
};
/**
 * @param {Boolean} parse
 * @return {Date|String}
 */
KeyGuard.prototype.date = function ( parse = false ) {
    return typeof parse === 'boolean' ? new Date(this._ts) : this._ts;
};
/**
 * @return {String}
 */
KeyGuard.prototype.export = function () {
    return btoa(JSON.stringify(this));
};
/**
 * @param {Boolean} list
 * @return {String|String[]}
 */
KeyGuard.prototype.method = function (list = false) {
    return typeof list === 'boolean' && list ? this._method.split('') : this._method;
};
/**
 * @param {Boolean} decode
 * @return {String}
 */
KeyGuard.prototype.content = function ( decode = false) {
    return typeof decode === 'boolean' && decode ? atob(this._content) : this._content;
};
/**
 * @param {Boolean} reveal
 * @return {String}
 */
KeyGuard.prototype.decode = function ( reveal = false ) {
    const content = this.content(true);
    if (this.method().length && reveal ) {
        const method = this.method(true).reverse();
        const separator = content.split(' ').length > 1 ? ' ' : '';
        var items = content.split(separator);
        for (var i in method) {
            items = this.parse(items, method[i], true);
        }
        return items.join(separator);
    }
    return content;
};
/**
 * @param {String} content
 * @return {String}
 */
KeyGuard.prototype.encode = function (content) {
    const method = this.method(true);
    if (method.length) {
        const separator = content.split(' ').length > 1 ? ' ' : '';
        var items = content.split(separator);
        for (var i in method) {
            items = this.parse(items, method[i]);
        }
        return btoa(items.join(separator));
    }
    return content;
};
/**
 * @param {String} data
 * @return {KeyGuard}
 */
KeyGuard.Import = function (data) {
    var object = JSON.parse(atob(data));
    var key = new KeyGuard(object._name, object._method, '', object._ts);
    key._content = object._content;
    return key;
};
/**
 * @param {String[]} list
 * @param {String} method
 * @param {Boolean} reverse
 * @return {String[]}
 */
KeyGuard.prototype.parse = function (list, method, reverse = false) {
    reverse = typeof reverse === 'boolean' && reverse;
    switch (method) {
        case 'A': return this.swap(list, 0);
        case 'B': return this.swap(list, 1);
        case 'C': return this.swap(list, 2);
        case 'D': return this.swap(list, 3);
        case 'E': return this.swap(list, 4);
        case 'X': return reverse ? this.shiftFirst(list, 3) : this.shiftLast(list, 3);
        case 'Y': return reverse ? this.shiftFirst(list, 2) : this.shiftLast(list, 2);
        case 'Z': return reverse ? this.shiftFirst(list, 1) : this.shiftLast(list, 1);
        case 'R': return this.flip(list);
    }
    return list;
};
/**
 * @param {String[]} items
 * @param {Number} index
 * @return {String[]}
 */
KeyGuard.prototype.shiftLast = function (items, index) {
    return index > 0 && items.length > index ? (items.unshift(items.splice(-index, 1)[0]), items) : items;
};
/**
 * @param {String[]} items
 * @param {Number} index
 * @return {String[]}
 */
KeyGuard.prototype.shiftFirst = function (items, index) {
    if (items.length > index && index > 0) {
        var first = items.shift();
        items.splice(items.length - index + 1, 0, first);
    }
    return items;
};
/**
 * @param {String[]} items
 * @param {Number} first
 * @return {String[]}
 */
KeyGuard.prototype.swap = function (items, first) {
    first = typeof first === 'number' && first > 0 ? first : 0;
    if (items.length > first) {
        var last = items.length - 1 - first;
        [items[first], items[last]] = [items[last], items[first]];
    }
    return items;
};
/**
 * @param {String[]} items
 * @return {String[]}
 */
KeyGuard.prototype.flip = function (items) {
    return items.reverse();
};



