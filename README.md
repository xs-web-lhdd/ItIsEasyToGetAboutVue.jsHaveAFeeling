# 记录一下温故 Vue.js 的过程，希望能更加深刻的理解 Vue.js 同时记录一下再次读 深入浅出Vue.js 的感受吧！

## 变化侦测：
其实我个人觉得这部分比较难理解的部分是 dep 如何收集 watcher，以及 dep 与 watcher 之间的关系，以及数组如何实现依赖收集，首先谈论对象中 dep 如何收集 watcher，我们知道视图中在使用某个状态（A）时会new 一个 Watcher，如何让 A 对应那个 dep 知道 那个 watcher 用到了 A 呢？Vue中是采用先将这个 watcher 实例放在全局，然后访问一下状态 A，然后在访问状态 A 的过程中判断一下全局中有没有 watcher，如果有就将 watcher 收集到状态 A 对应的那个 dep 中，访问状态 A 之后再将这个 watcher 从全局移除，这样一遍下来就能将 watcher 收集到 dep 中，然后，如果状态 A 发生改变时再告诉 dep 去通知 watcher 更新，其实就是循环一下 dep，把里面的每一项（也就是每一个watcher）拿出来单独执行一下更新操作即可。
```js
  // 将 watcher 实例设置到全局 
  Dep.traget = this
  // 访问指定状态:
  this.vm[key]
  // 收集完依赖之后将其设为 空,以防影响全局
  Dep.traget = null
``` 
第二点,在 Vue 中 dep 与 watcher 之间的关系是多对多不是一对多的关系,举一个简单的例子, `vm.$watcher(expOrFn, fn, options)` ,这个 API 是我们熟悉的 API,里面第一个参数可以是表达式也可以是函数,比如:
```js
// 表达式:
a.b.c
// 表示监听数据中a对象中的b对象里面的c属性

// 函数:
function () {
  return this.a.b.c + this.a.b.d
}
// 表示监听数据中a对象中的b对象里面的c和d属性
```
其中这个 API 里面有一个取消监听的方法,`vm.$watcher`如果第一个参数是是上面那个函数,当调用里面的取消监听方法时怎么办?实践上是这样的,每个 watcher 实例里面都有一个 dep 和 depId 的数组,用来存放那个状态对应的 dep 里面有该watcher,然后该watcher 把dep存进到watcher的dep中,比如上面函数对应的watcher里面的dep中都存着a.b.c和a.b.d对应的dep,然后当要取消监听时,只需要循环一下watcher实例里面的dep,找到那个dep里面存有该watcher然后让那个dep把该watcher从自身监听的watcher列表中去掉即可,这样就可以取消监听. 