/**
 * 遍历器(迭代器)[Iterator] 是一种机制(接口)：为各种不同的数据机构提供统一的访问机制，任何数据结构只要部署 Iterator 接口，就可以完成遍历操作[for of循环]，依次处理该数据结构的所有成员
 * 浏览器内置没有提供 Iterator 这个类
 * 但是他给很多数据结构都提供了迭代的接口方法: Symbol.iterator
 * 如(在原型上都可以找到这个方法：Symbol.iterator)：
 *    1、数组结构
 *    2、部分类数组：arguments, NodeList, HTMLCollection
 *    3、字符串
 *    4、Set/Map
 *    5、generator object
 * Object 原型上是不具备 Symbol.iterator 的
 * 具备 Iterator 这个接口的数据结构就可以基于 for...of... 进行循环迭代
 */
class Iterator {
  // assemble 传进来的集合
  constructor (assemble) {
    // 当前实例
    let self = this;
    // 传进来的值挂载到当前实例的私有属性上
    self.assemble = assemble;
    // 记录索引
    self.index = 0;
  }
  next () {
    let self = this,
        assemble = self.assemble;
    if (self.index > assemble.length - 1) {
      return {
        done: true,
        value: undefined
      }
    }
    return {
      done: false,
      value: assemble[self.index++]
    }
  }
}

/**
 * 数组
 * for...of... 遍历时，先调用“对象[Symbol.iterator]”，获取一个迭代器实例
 * 每一轮循环都是 实例.next() 执行，并且把返回对象中的 value 值拿到[所以 for...of 迭代的是数据结构中的值]
 * 当返回对象中 done: true 时，结束循环
 */
Array.prototype[Symbol.iterator] = function () {
  let assemble = this,
      index = 0;
  return {
    next () {
      if (index > assemble.length - 1) {
        return {
          done: true,
          value: undefined
        }
      }
      return {
        done: false,
        value: assemble[index++]
      }
    }
  }
}


/**
 * 对象
 * for...of... 不能迭代普通对象，因为普通对象不具备 Symbol.iterator 迭代器接口规范
 * 在项目中更多期望的是 类数组普通对象( { 0: '', 1: '', length: 2 } ) 能够使用 for...of... 迭代即可
 * 类数组可以通过 obj[Symbol.iterator] = Array.prototype[Symbol.iterator] 这样的方式去简单处理
 */
Object.prototype[Symbol.iterator] = function () {
  let assemble = this,
      // Object.keys 只能获取所有非 Symbol 属性
      // 所以要拼接上用 getOwnPropertySymbols 获取的所有 Symbol 属性
      keys = Object.keys(assemble).concat(Object.getOwnPropertySymbols(assemble)),
      index = 0;
  return {
    next () {
      if (index > keys.length - 1) {
        return {
          done: true,
          value: undefined
        }
      }
      let key = keys[index++];
      return {
        done: false,
        value:  assemble[key]
      }
    }
  }
}