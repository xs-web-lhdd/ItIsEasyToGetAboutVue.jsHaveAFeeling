/**
 * @description 手写一个简版的 vue
 * @author 氧化氢
 */



// 对象的某个属性的响应式操作：
function defineReactive(obj, key, val) {
  // 如果对应的键值对中值是对象，那么做响应式处理：
  if(isObject(val)) observe(val)


  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get: function() {
      console.log(`获取 ${key} 的值`);
      Dep.traget && dep.addDep(Dep.traget)
      return val
    },
    set: function(newVal) {
      console.log(`设置 ${key} 的新值`)
      if(val !== newVal) {
        // 新设置的值若为对象则做响应化的处理：
        if(isObject(newVal)) observe(newVal)
        val = newVal

        // watcher.forEach(w => w.update())
        dep.notify()
      }
    }
  })
}

// 判断是不是对象：
function isObject(obj) {
  return !Array.isArray(obj) && (typeof obj === 'object') && obj !== null
}

// 进行响应式操作：
function observe(obj) {
  if(!isObject(obj)) {
    console.error(`${obj} 不是不是一个对象，无法对其做响应式的处理！`);
    return
  }
  
  // 生成一个响应式的实例：
  new Observe(obj)
}

// 不能直接添加属性：拦截不到？怎么办？自己写一个添加属性的方法调用即可！
// obj.arr = 111
// 解决给对象动态添加值无法被拦截问题：
function set(obj, key, val) {
  defineReactive(obj, key, val)
}


// 给实例添加一个代理，这样用起来更方便：可以直接 vm.counter 而不需要 vm.$data.counter
function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(newVal) {
        vm.$data[key] = newVal
      }
    })
  })
}


class Lvue {
  constructor(options) {
    // 保存一下每一个选项卡：
    this.$data = options.data
    this.data = this.$data
    // 对数据进行响应式的处理：
    observe(this.$data)

    // 数据 data 进行代理:
    proxy(this)

    // 编译：
    new Compile('#app', this)
  }
}


// 进行响应式：
class Observe {
  constructor(value) {
    this.value = value

    // 如果是数组: XXX
    if(Array.isArray(value)) {

    }
    // 如果是对象怎样做响应式处理：
    if(isObject(value)) {
      this.walk(value)
    }
  }
  

  // 对象的具体响应式操作过程：
  walk(obj) {
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
  }
}


// 编译：
class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    this.compile(this.$el)
  }

  compile(el) {
    el.childNodes.forEach(node => {
      if(this.isElement(node)) {
        // 是元素节点做什么：
        this.compileElement(node)
      }
      else if(this.isInter(node)) {
        // 是插值表达式:
        this.compileText(node)
      }

      // 有孩子就递归遍历:
      if(node.childNodes) {
        this.compile(node)
      }
    })

  }

  isDirectory(str) {
    return str.startsWith('l-')
  }

  compileElement(node) {
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // l-text = 'counter'
      const key = attr.nodeName
      const value = attr.nodeValue

      if(this.isDirectory(key)) {
        const dir = key.slice(2)
        if(this[dir]) {
          this[dir](node, value)
        } else {
          console.error(`没有 ${key} 这个指令`)
          return
        }
      }
    })
  }

  text(node, key) {
    this.update(node, key, 'text')
  }

  html(node, key) {
    this.update(node, key, 'html')
  }

  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
  }

  // 合并为一个更新函数:
  update(node, value, dir) {
    const fn = this[dir + 'Update']
    // 初始化:
    fn && fn(node, this.$vm[value])
    // 更新
    new Watcher(this.$vm, value, function (val) {
      fn && fn(node, val)
    })
  }

  textUpdate(node, value) {
    node.textContent = value
  }
  htmlUpdate(node, value) {
    node.innerHTML = value
  }
  
  isElement(node) {
    return node.nodeType === 1
  }

  isInter(node) {
    // 判断是不是插值表达式： {{}}
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}


// const watcher = []
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // watcher.push(this)
    console.log(this);
    Dep.traget = this
    this.vm[key]
    Dep.traget = null
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}



class Dep {
  constructor() {
    this.deps = []
  }

  addDep(watcher) {
    this.deps.push(watcher)
  }

  notify() {
    this.deps.forEach(watcher => watcher.update())
  }
}