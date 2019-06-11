class NVue {
  constructor(options) {
    this.$data = options.data; //保存data选项
    this.observe(this.$data); //执行响应式
    this.$options = options;
    new Compile(options.el, this);
  }

  observe(data) {
    //遍历data选项，此处判断不严谨
    if (!data || typeof data !== "object") {
      return;
    }
    //遍历data选项
    Object.keys(data).forEach(key => {
      //为每一个key定义响应式
      this.defineReactive(data, key, data[key]);
      // 为vue的data作属性代理
      this.proxyData(key);
    });
  }

  defineReactive(obj, key, val) {
    this.observe(val); //递归查找嵌套属性
    //创建依赖管理器
    const dep = new Dep();
    //为data对象定义属性
    Object.defineProperty(obj, key, {
      enumerable: true, //可枚举
      configurable: true, //可修改或删除
      get() {
        Dep.target && dep.addDep(Dep.target);
        //console.log(dep.deps);
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        dep.notify();
      }
    });
  }

  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    });
  }
}

//依赖管理器：负责将视图中所有依赖收集管理，包括依赖添加和通知
class Dep {
  constructor() {
    this.deps = []; //deps里存放的是Watcher的实例
  }
  //添加Watcher
  addDep(dep) {
    this.deps.push(dep);
  }
  //通知所有Wathcer执行更新
  notify() {
    this.deps.forEach(dep => {
      dep.update();
    });
  }
}

// Watcher: 具体的更新执行者
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    // 将来new一个监听器时，将当前Watcher实例附加到Dep.target
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
  // 更新
  update() {
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
