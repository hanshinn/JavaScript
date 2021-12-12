(function () {
  // Promise参数是函数(executor)
  // Promise参数函数executor的参数是两个函数(resolve, reject)
  function Promise(executor) {
    if (typeof executor !== 'function') throw new TypeError('Promise resolver ' + executor + ' is not a function');
    
    var self = this;
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
      executor(function resolve(value) {
        // 成功
        change('fulfilled', value);
      }, function reject(reason) {
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
  /**
   * @param { Function } callback onfulfilled|onrejected
   * @param { any } value 执行上述某个方法传递的值
   * @param { Promise } promise .then 返回的新的 Promise 实例
   * @param { Function } resolve 方法执行可以修改 promise 的状态和值
   * @param { Function } reject 方法执行可以修改 promise 的状态和值
   */
  var resolvePromise = function resolvePromise(promise, x, resolve, reject) {
    // 检查执行结果与返回的 promise 是否是同一个实例
    // 如果是同一个实例，会出现死循环
    if (x === promise) throw new TypeError('Chaining cycle detected for promise #<Promise>');
    // 如果返回的 x 是对象
    if (x !== null && /^(object|function)$/i.test(typeof x)) {
      var then;
      try {
        // 看访问 then 的时候会不会报错
        then = x.then;
      } catch (err) {
        // 访问 then 失败
        reject(err);
      }
      if (typeof then === 'function') {
        // 当前对象有 then 这个方法，说明 x 是一个 Promise 实例
        // 标识-只执行一次
        var called = false;
        try {
          // 或者 x.then();
          then.call(x, function onfulfilled(y) {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          }, function onrejected(r) {
            if (called) return;
            called = true;
            reject(r);
          });
        } catch (err) {
          if (called) return;
          reject(err);
        }
        return;
      }
      // then 不是函数，说明只是一个普通对象，直接执行 resolve 返回 x 即可
    }
    // x 不是对象，就一定不是 Promise 实例，直接执行 resolve 返回 x 即可
    resolve(x);
  }
  var handle = function handle(callback, value, promise, resolve, reject) {
    try {
      // 获取执行结果
      var result = callback(value);
      resolvePromise(promise, result, resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  Promise.prototype = {
    // 原型重定向后，新对象没有 constructor 属性指向当前构造函数本身了，需要手动增加
    constructor: Promise,
    then: function then(onfulfilled, onrejected) {
      // 成功执行：onfulfilled, 失败执行：onrejected
      // 第一类：.then 的时候已经知道实例的状态，此时构建一个“异步微任务”，执行对应的方法(onfulfilled/onrejected)即可
      // 第二类：.then 的时候还不知道实例的状态，此时需要将onfulfilled/onrejected先存储起来，后期状态改变后通知对应方法执行，只不过此时也是一个“异步微任务”
      // 在不使用 queueMicrotask 这个方法的时候，无法创建异步微任务，所以可以拿定时器模拟一个异步宏任务来代替微任务
      var self = this,
          promise = null;
      if (typeof onfulfilled !== 'function') {
        onfulfilled = function onfulfilled(value) {
          return value;
        }
      }
      if (typeof onrejected !== 'function') {
        onrejected = function onrejected(reason) {
          throw reason;
        }
      }
      // then 需要返回一个新的 Promise 实例
      promise = new Promise(function (resolve, reject) {
        // resolve 执行：promise 就是成功的。reject 执行：promise 就是失败的。
        switch (self.state) {
          case 'fulfilled':
            setTimeout(function () {
              handle(onfulfilled, self.value, promise, resolve, reject);
            });
            break;
          case 'rejected':
            setTimeout(function () {
              handle(onrejected, self.value, promise, resolve, reject);
            });
            break;
          default:
            self.onfulfilledCallbacks.push(function (value) {
              handle(onfulfilled, value, promise, resolve, reject);
            });
            self.onrejectedCallbacks.push(function (reason) {
              handle(onrejected, reason, promise, resolve, reject);
            });
            break;
        }
      });
      return promise;
    },
    catch: function my_catch(onrejected) {
      // catch 是关键词，不能作为函数变量名（可以作为属性名）
      return this.then(null, onrejected);
    }
  }

  // Symbol.toStringTag 向原型上加这个属性时，必须保证 Symbol 存在
  if (typeof Symbol !== 'undefined') Promise.prototype[Symbol.toStringTag] = 'Promise';


  // 验证是否为一个符合规范的 promise 实例
  var isPromise = function isPromise (x) {
    if (x !== null && /^(object|function)$/i.test(typeof x)) {
      if (typeof x.then === 'function') {
        return true;
      }
    }
    return false;
  }

  // 当做对象扩展的静态私有方法：工具类方法
  // - 执行 resolve 就是返回一个 状态为成功, 值为 value 的 Promise 实例
  Promise.resolve = function resolve(value) {
    return new Promise(function (resolve) {
      resolve(value);
    });
  }
  // - 执行 reject 就是返回一个 状态为失败, 值为 value 的 Promise 实例
  Promise.reject = function reject(value) {
    // _ 下划线占位
    return new Promise(function (_, reject) {
      reject(value);
    });
  }
  Promise.all = function all(promises) {
    if (!Array.isArray(promises)) throw new TypeError('promises must be an Array');
    var n = 0,
        results = [];
    return new Promise(function (resolve, reject) {
      for (var i = 0; i < promises.length; i++) {
        // 由于执行是异步的，需要用闭包把 i 存起来，否则会出错
        // 用 let 可以不用处理，但是这里都用的 ES5，为了兼容
        (function (i) {
          var promise = promises[i];
          // 如果不是 Promise 实例，需要调整为一个 Promise 实例
          if (!isPromise(promise)) promise = Promise.resolve(promise);
          promise.then(function onfulfilled (value) {
            n++;
            // 结果存放起来，并且顺序必须是对应的，跟谁先执行完成没有关系
            results[i] = value;
            if (n >= promises.length) resolve(results);
          }).catch(function onrejected (reason) {
            reject(reason);
          });
        })(i);
      }
    });
  }

  // 暴露API
  if (typeof window !== 'undefined') window.Promise = Promise;
  if (typeof module === 'object' && typeof module.exports === 'object') module.exports = Promise;
})();