/**
 * 遍历器(迭代器)[Iterator] 是一种机制(接口)：为各种不同的数据机构提供统一的访问机制，任何数据结构只要部署 Iterator 接口，就可以完成遍历操作[for of循环]，依次处理该数据结构的所有成员
 * 内置没有提供 Iterator 这个类
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