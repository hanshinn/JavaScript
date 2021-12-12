// Promise参数是函数(executor)
// Promise参数函数executor的参数是两个函数(resolve, reject)
function Promise (executor) {
  var self = this;
  if (typeof executor !== 'function') throw new TypeError('Promise resolver ' + executor + ' is not a function');
  // 检查 this 是否是 Promise 实例
  // 如果是 new Promise() 执行，self 就是 Promise 实例。
  // 如果是 Promise() 执行，self 就不是 Promise 实例。
  if (!(self instanceof Promise)) throw new TypeError('undefined is not a promise');
  // 私有属性：实例增加属性
  // 1、存放状态(准备状态/成功失败状态)[状态一旦改变，不能再被改变]: (pending)
  self.state = 'pending';
  // 2、Prmise 的 result
  self.value = undefined;

  // 存储的 onfulfilled, onrejected 方法
  self.onfulfilledCallbacks = [];
  self.onrejectedCallbacks = [];

  // 用来修改实例状态和值[立即](一旦状态不是 pending 了，就不能再修改了)
  // 并且把之前基于 then 存储的 onfulfilled, onrejected 方法执行[异步]
  var change = function (state, value) {
    if (self.state !== 'pending') return;
    self.state = state;
    self.value = value;
    setTimeout(function () {
      var callbacks = self.state === 'fulfilled' ? self.onfulfilledCallbacks : self.onrejectedCallbacks;
      // 兼容IE6
      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        if (typeof callback === 'function') {
          callback(self.value);
        }
      }
    });
  }

  // 函数立即执行，控制如何修改状态
  // 防止执行报错，需要用try...catch...捕获异常
  try {
    executor(function resolve (value) {
      // 成功
      change('fulfilled', value);
    }, function reject (reason) {
      // 失败
      change('rejected', reason);
    });
  } catch (err) {
    // 失败
    change('rejected', err.message);
  }
}

// 需要向原型上扩展方法 then、catch，供实例调用
// 原型重定向
Promise.prototype = {
  // 原型重定向后，新对象没有 constructor 属性指向当前构造函数本身了，需要手动增加
  constructor: Promise,
  then: function then (onfulfilled, onrejected) {
    // 成功执行：onfulfilled, 失败执行：onrejected
    // 第一类：.then 的时候已经知道实例的状态，此时构建一个“异步微任务”，执行对应的方法(onfulfilled/onrejected)即可
    // 第二类：.then 的时候还不知道实例的状态，此时需要将onfulfilled/onrejected先存储起来，后期状态改变后通知对应方法执行，只不过此时也是一个“异步微任务”
    // 在不使用 queueMicrotask 这个方法的时候，无法创建异步微任务，所以可以拿定时器模拟一个异步宏任务来代替微任务
    var self = this;
    switch (self.state) {
      case 'fulfilled':
        setTimeout(function () {
          onfulfilled(self.value);
        });
        break;
      case 'rejected':
        setTimeout(function () {
          onrejected(self.value);
        });
        break;
      default:
        self.onfulfilledCallbacks.push(onfulfilled);
        self.onrejectedCallbacks.push(onrejected);
        break;
    }
  },
  catch: function my_catch () {
    // catch 是关键词，不能作为函数变量名（可以作为属性名）
  }
}

// Symbol.toStringTag 向原型上加这个属性时，必须保证 Symbol 存在
if (typeof Symbol !== 'undefined') Promise.prototype[Symbol.toStringTag] = 'Promise';

// 当做对象扩展的静态私有方法：工具类方法
// - 执行 resolve 就是返回一个 状态为成功, 值为 value 的 Promise 实例
Promise.resolve = function resolve (value) {
  return new Promise(function (resolve) {
    resolve(value);
  });
}
// - 执行 reject 就是返回一个 状态为失败, 值为 value 的 Promise 实例
Promise.reject = function reject (value) {
  // _ 下划线占位
  return new Promise(function (_, reject) {
    reject(value);
  });
}
Promise.all = function all () {}
