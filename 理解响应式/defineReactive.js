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

// obj.foo
// obj.foo = '1111'
// obj.fn

// obj.arr = {a: 1, b: 2}


set(obj, 'arr', {a: 1, b: 2})

set(obj.obj.a, 'a', 1)