/**
 * 创建一个生成器函数：function* 函数名() {}
 * generator 函数执行，并没有把函数体中的代码执行，返回的结果是把自己当做类创建的一个实例: 迭代器对象(因为具备迭代器规范，拥有迭代器 next 方法等)
 * generator().__proto__ === generator.prototype
 * * 可以看到自己原型加上去的属性(generator.prototype.xxx)
 * 
 * generator.prototype.__proto__ === GeneratorFunction.prototype
 * * GeneratorFunction.prototype 上有几个方法：
 * * * next
 * * * return
 * * * throw
 * * * Symbol.toStringTag: "Generator"
 * 
 * GeneratorFunction.prototype.__proto__ === ?.prototype
 * 【?：因为没有 constructor，所以不知道是谁的原型】
 * * GeneratorFunction.prototype.__proto__ 上面有：
 * * * Symbol.iterator
 * 
 * 最后找到 Object 原型
 * 
 * ------------------------------------
 * generator 不能加 new 执行
 * 
 * -------------next 方法--------------
 * 执行迭代器对象的 next 方法，可以让 generator 函数体中的代码执行
 * 每一次执行 next，遇到 yield 结束
 * 返回的结果是具备 done、value 属性的对象，并且 value 是 yield 后面的值【例：{value: 4, done: false}】
 * 执行完成后，返回 {value: undefined, done: true}
 * 
 * 每一次 next 传递的值(第一次传递的值没用)：都是作为上一次 yield 的返回结果
 * 
 * -----------return 方法--------------
 * 
 * 执行 return 方法时，返回 {value: return方法中穿传递的参数, done: true}
 * 再执行 next 方法时，返回 {value: undefined, done: true}
 * 
 * -----------throw 方法---------------
 * 直接抛出异常信息(Uncaught throw方法传递的参数)，没有返回值，后续代码无法继续执行
 * 
 * 通过 yield* 可以进入到其他的生成器中进行迭代
 */
function* generator () {
  console.log('aaa');
  let a = yield 1;

  console.log('bbb', a);
  let b = yield 2;

  console.log('ccc', b);
  let c = yield 3;

  console.log('ddd', c);
  let d = yield 4;

  console.log('eee', d);
}

function* generator1 () {
  yield 1;
  yield 2;
}
function* generator2 () {
  yield 3;
  yield generator1();
  yield 4;
}


function* generator3 () {
  yield 1;
  yield 2;
}
function* generator4 () {
  yield 3;
  yield* generator3();
  yield 4;
}