function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init: function() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment(); //创建文档碎片节点，可以大大减少页面渲染次数。
        var child = el.firstChild;
        while (child) {
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function(el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function(node) { //[]是js语法中创建一个新数组的意思等同于new Array()
            //[].slice是数组的一个方法，是一个函数用于返回数组中的某一段。
            //js中，函数本身也是一种对象，也是具有属性和方法的，call就是其中之一。
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            if (self.isTextNode(node) && reg.test(text)) { // 判断是否是符合这种形式{{}}的指令
                self.compileText(node, reg.exec(text)[1]);
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node); // 继续递归遍历子节点
            }
        });
    },
    compileText: function(node, exp) {
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText); // 将初始化的数据初始化到视图中
        new Watcher(this.vm, exp, function(value) { // 生成订阅器并绑定更新函数
            self.updateText(node, value);
        });
    },
    updateText: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    isTextNode: function(node) {
        return node.nodeType == 3;
    }
}