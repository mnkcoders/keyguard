
function View(input, list, action) {

    const _controller = {
        'input': input || 'keys',
        'list': list || 'saved',
        'action': action || 'action',
    };

    this.getInput = function () {
        return _controller.input.length ? document.getElementsByName(_controller.input)[0] : null;
    };
    this.getList = function () {
        return _controller.list.length ? document.getElementById(_controller.list) : null;
    };
    this.getSelector = function(){
        return document.getElementById('method');
    };
    this.getInputMethod = function(){
        return document.getElementsByName('method')[0];
    };
    this.fill = function (content) {
        if (this.getInput() !== null) {
            this.getInput().value = content || '';
        }
        return this;
    };
    this.content = function () {
        return this.getInput() !== null ? this.getInput().value.toString() : '';
    }
    this.method = function(){
        return this.getInputMethod().value.toString();
    };
    this.setMethod = function( method ){
        const _input = this.getInputMethod();
        _input.value = method || '';
        
        if( _input.value.toString().length > 0 ){
            _input.classList.add('active');
        }
        else{
            _input.classList.remove('active');
        }
        return this;
    };
    this.load = function () {
        var _saved = localStorage.getItem('keys');
        return _saved !== null ? JSON.parse(_saved) : [];
    };
    this.save = function (data) {
        var _content = this.load();
        _content.push(data);
        localStorage.setItem('keys', JSON.stringify(_content));
        return this;
    };
    this.refreshList = function () {
        this.getList().innerHTML = '';
        const _self = this;
        this.load().forEach(function (key) {
            _self.addItem(key);
        });

        return this;
    };
    this.addItem = function (content) {
        const _self = this;
        var _item = document.createElement('li');
        _item.className = 'item tab';
        //_item.innerHTML = hash;
        //_item.innerHTML = (new Date()).toString();
        //_item.innerHTML = 'saved key';
        _item.setAttribute('data-id', content);
        _item.addEventListener('click',function(e){
            e.preventDefault();
            var keys = KeyMapper.Decode(this.getAttribute('data-id').toString());
            _self.setMethod(keys.method()).fill(keys.toString());
            return true;
        });

        this.getList().appendChild(_item);
        return this;
    };
    this.bindActions = function () {
        const _self = this;
        this.getSelector().addEventListener('change',function(e){
            e.preventDefault();
            if( this.value.toString() === 'clear' ){
                _self.setMethod( '' );
            }
            else{
                _self.setMethod( _self.method() + this.value.toString() );
            }
            return true;
        });
        this.getInputMethod().addEventListener('click',function(e){
            e.preventDefault();
            _self.setMethod();
            return true;
        });
        Array.from(document.getElementsByName(_controller.action)).forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const _content = _self.content();
                const _method = _self.method();
                switch (btn.value) {
                    case 'parse':
                        if (_content.length && _method.length) {
                            _self.fill((new KeyMapper(_content, _method, true)).toString());
                        }
                        break;
                    case 'save':
                        if (_content.length && _method.length ) {
                            var _keys = new KeyMapper(_content, _method, true);
                            var encoded = _keys.encode();
                            _self.save(encoded).addItem(encoded).fill(_keys.toString());
                            _self.fill();
                            //a b c d e f g h i j k l m n o p q r s t u v w x y z
                        }
                        break;
                    case 'restore':
                        var _keys = new KeyMapper(_content, _method);
                        _self.fill(_keys.restore().toString());
                        break;
                    /*case 'encode':
                        if (_content.length) {
                            var _keys = new KeyMapper(_content, _method, true);
                            _self.save(_keys.encode()).fill(_keys.toString());
                            //a b c d e f g h i j k l m n o p q r s t u v w x y z
                        }
                        break;
                    case 'decode':
                        var _keys = _content.length ? KeyMapper.Decode(_content) : '';
                        _self.setMethod(_keys.method());
                        _self.fill(_keys.toString());
                        break;
                    case 'import':
                        var _keys = _content.length ? KeyMapper.Decode(_content) : '';
                        if (_keys.toString().length) {
                            _self.fill(_keys.restore().toString());
                        }
                        break;
                        */
                }
                return true;
            });
        });

        return this;
    };
    return this.bindActions().refreshList();
}

document.addEventListener('DOMContentLoaded', function (e) {
    this.KeyMapViewController = new View();
});

class Mapper {

    constructor(name) {

        var _private = {
            'id': Math.floor(Math.random() * 100),
            'name': name || 'unnamed',
        };

        this.has = property => _private.hasOwnProperty(property);
        this.get = (property, defValue) => _private.hasOwnProperty(property) ? _private[property] : defValue;
        this.set = function (property, value) {
            if (this.has(property)) _private[property] = value;
            return this;
        };
    }
    toString() { return `${this.name()} ( ${this.ID()} )` };
    name() { return this.get('name', ''); }
    ID() { return this.get('id', 0) }

}


function KeyMapper(keys, method, apply) {
    const _controller = {
        'method': typeof method === 'string' && method.length ? method : '',
        'data': typeof keys === 'string' ? keys.toLowerCase().trim().split(' ') : [],
        'shift': function (A, B) {
            [this.data[A], this.data[B]] = [this.data[B], this.data[A]];
            return this;
        },
        'flip': function () {
            this.data.reverse();
            return this;
        },
        'parse': function (m) {
            switch (m) {
                case 'Z':
                    return this.shift(4, 8);
                case 'X':
                    return this.shift(6, 10);
                case 'F':
                    return this.shift(3, 15);
                case 'E':
                    return this.shift(4, 14);
                case 'D':
                    return this.shift(5, 13);
                case 'C':
                    return this.shift(6, 12);
                case 'B':
                    return this.shift(7, 11);
                case 'A':
                    return this.shift(8, 10);
                case 'R':
                    return this.flip();
            }
            return this;
        },
        'patch': function (restore) {
            var _method = this.method.length > 0 ? this.method.split('') : [];
            if (_controller.data.length && _method.length) {
                if (typeof restore === 'boolean' && restore) _method.reverse();
                for (var m in _method){
                    this.parse(_method[m].toUpperCase());
                    console.log( `Apply method ${_method[m].toUpperCase()}` );
                } 
            }
            return this;
        },
    };

    this.toString = function () {
        return _controller.data.length ? _controller.data.join(' ') : '';
    };

    this.method = () => _controller.method;

    this.restore = function () {
        _controller.patch(true);
        return this;
    };

    this.encode = function () {
        return btoa(_controller.method + ' ' + this.toString());
    };

    if (typeof apply === 'boolean' && apply) {
        _controller.patch();
    }

    return this;
}

KeyMapper.Decode = function (hash) {
    var content = atob(hash);

    if (content) {
        var keys = content.split(' ');
        var method = keys.shift();
        return new KeyMapper(keys.join(' '), method);
    }
    return new KeyMapper();
};
