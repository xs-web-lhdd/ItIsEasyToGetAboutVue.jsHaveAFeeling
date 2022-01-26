# 对于手写简版 Vue 对应的思考:

### 理解响应式:
Vue 的核心之一就是响应式,在 Vue2 中是采用对象的访问器属性进行拦截的,首先实现一个对象属性的响应式拦截:
```js
// 对象的某个属性的响应式操作：
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get: function() {
      console.log(`获取 ${key} 的值`);
      return val
    },
    set: function(newVal) {
      console.log(`设置 ${key} 的新值`)
      if(val !== newVal) {
        val = newVal
      }
    }
  })
}
```
上面是一个对象属性实现响应式的操作,算是响应式的一个雏形.在这个的基础上,便可以实现对象的响应式,用一个observe函数实现:
```js
function observe(obj) {
  if(!isObject(obj)) {
    console.error(`${obj} 不是不是一个对象，无法对其做响应式的处理！`);
    return
  }
  
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}
```
其实observe这个函数不是很难的,就是对对象的每个属性进行响应式的处理即可.在这之前进行严谨的判断一下是不是对象即可:
```js
function isObject(obj) {
  return !Array.isArray(obj) && (typeof obj === 'object') && obj !== null
}
```
这里首先声明一下 Vue2 中数组的响应式和对象的响应式实现方式是不一样的,所以这里进行了严格判断到底是数组对象还是基本对象.

observe 函数实现完成之后可能已经能感受一下响应式了,但是还是是有一些其他情况的,比如:
```js
var obj = {
  foo: 'foo',
  fn: 'fn',
  bar: {}
}
```
像上面这种 foo fn 都是可以拦截到的,但是 bar 就没办法拦截,所以需要对 defineReactive 函数进行改进,如果属性的值是一个对象,如:
```js
obj.bar
```
那么也需要进行一下响应式处理,所以加上`if(isObject(val)) observe(val)`这行代码.这种情况处理完之后还是有一种情况: 像在进行值设置的时候,如果新值是一个基本类型的值那还没事,但是如果新值是一个对象类型,如:
```js
obj.foo = {a: 1, b: 2}
```
那么访问`obj.foo.a`的时候就没法实现拦截,所以加上`if(isObject(newVal)) observe(newVal)`这行代码,这样就可以实现.综上,新的 defineReactive 代码如下:
```js
// 对象的某个属性的响应式操作：
function defineReactive(obj, key, val) {
  // 如果对应的键值对中值是对象，那么做响应式处理：
  if(isObject(val)) observe(val)

  Object.defineProperty(obj, key, {
    get: function() {
      console.log(`获取 ${key} 的值`);
      return val
    },
    set: function(newVal) {
      console.log(`设置 ${key} 的新值`)
      if(val !== newVal) {
        // 新设置的值若为对象则做响应化的处理：
        if(isObject(newVal)) observe(newVal)
        val = newVal
      }
    }
  })
}
```

上面其实还是有一些漏洞的,比如: 直接给对象添加新属性,如:
```js
obj.name = 'H2O'
```
这样直接给对象添加属性值,那么就没办法拦截,为了解决这种情况,需要自定义一个 API ,这样用这个自定义的 API 就可以实现拦截,从而实现响应式啦,这里采用的是 set 函数:
```js
function set(obj, key, val) {
  defineReactive(obj, key, val)
}
```
上面其实还有 delete 这种也是可以直接删除对象属性的,所以也要进行自定义 API 但是这里涉及的操作比较多,所以先不做多的赘述.
说到这里就已经实现一个简版的响应式啦,下面是全部代码:
```js
/**
 * @description 手写 Vue 响应式原理
 * @author 氧化氢
 */

// 对象的某个属性的响应式操作：
function defineReactive(obj, key, val) {
  // 如果对应的键值对中值是对象，那么做响应式处理：
  if(isObject(val)) observe(val)

  Object.defineProperty(obj, key, {
    get: function() {
      console.log(`获取 ${key} 的值`);
      return val
    },
    set: function(newVal) {
      console.log(`设置 ${key} 的新值`)
      if(val !== newVal) {
        // 新设置的值若为对象则做响应化的处理：
        if(isObject(newVal)) observe(newVal)
        val = newVal
      }
    }
  })
}

// 判断是不是对象：
function isObject(obj) {
  return !Array.isArray(obj) && (typeof obj === 'object') && obj !== null
}

// 整个对象的响应式操作：
function observe(obj) {
  if(!isObject(obj)) {
    console.error(`${obj} 不是不是一个对象，无法对其做响应式的处理！`);
    return
  }
  
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

// 不能直接添加属性：拦截不到？怎么办？自己写一个添加属性的方法调用即可！
// obj.arr = 111
// 解决给对象动态添加值无法被拦截问题：
function set(obj, key, val) {
  defineReactive(obj, key, val)
}

var obj = {
  foo: 'foo',
  fn: 'fn',
  obj: {}
}

observe(obj)
```

接下来,开始手写简版 Vue 啦:

### 在 Vue 中实现响应式:
```js
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
```

首先这里面把实现响应式单独提到一个类里面去了, 如果是数组,那么就通过数组的方法实现响应式(覆盖原型,但这里代码并没有实现),如果是一个普通对象那么就就调用普通对象实现响应式的方法,这里是walk,然后在 observe 函数中 new 一个 Observe 实例,然后把要实现响应式的对象传进去即可(无论是数组对象还是普通对象)

### 打开 Vue 的大门:
在该过程中采用 `数据响应式操作 - 数据进行代理 - 模板进行编译` 这个顺序进行手写.
前面主要还是在谈论响应式,下面走进 Vue,首先我们通常是这样使用 Vue:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>手写简版 Vue</title>
  <script src="./Lvue.js"></script>
</head>
<body>
  <div id="app">
    <div>{{counter}}</div>
  </div>
  <script>
    const app = new Lvue({
      data: {
        counter: 0,
      },
    })

    setInterval(() => {
      app.data.counter++
    }, 1000)
  </script>
</body>
</html>
```

所以在 new Vue 的时候会往里面传一些选项,像 data, methods, computed 等等.因为咱这里是实现简版 Vue 所以就只对 data 做了处理,这里的整体流程是先对 data 里面的数据进行响应式处理,然后给 data 做一个代理,毕竟在 Vue 中下面三种情况都是可以访问 data 中的数据的:
```js
// 第一种:
app.data.counter
// 第二种:
app.$data.counter
// 第三种:
app.counter
```
像第一种第二种写法都太冗余了,所以一般用第三种,把data中的每一个数据代理到 Vue 的实例中,然后访问它返回 data 中对应的值即可, 还是采用 defineProperty 进行代理, 其实不是很难,看一下就懂了:
```js
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
```
代理完成之后就是编译,编译采用 new 一个 Compile 一个实例,因为是简版 Vue 所以就不实现 mount 挂在了,直接把挂载点写死啦 `#app`.下面是 LVue 整个类:
```js
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
```

### 复杂来了: 编译究竟做了什么事:

