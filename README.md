

 ### 1. 背景
 
  目前项目使用ant-design-pro v5  国际化方案如下

  ```
  src/page/user/user.tsx
  <div>{intl.formatMessage({id:'user.login'})}</div>
  ```
  ```
  locales/zh-CN.ts
  'user.login.remember':'5天内免登陆',
  'user.login':'登录',
  ...
  ```

   ` 缺点：需要手动去zh-CN文件下声明id，频繁的在两个文件之间操作，看起来很蠢。没有中文显示代码可读性也很差，全局搜索还要中转一次，效率很差 `

### 2. babel：

  > babel-plugin-react-intl：	https://formatjs.io/docs/tooling/babel-plugin
  
  and-pro使用了 formatjs ，formatjs官方提供的一个工具，很好是思路；
  但是放到项目里面直接报错，报错位置大概在ant-desing-pro内部，改造估计成本很高。
  

### 3. 自动生成对照文件 locales/zh-CN.ts ？
  * 思路：
    我之前有封装过一个国际化组件，大概长这样：
    ```
    <LocaleText name='order.addbillway.track' label='运单号' />
    ```
    `是否可以根据这个组件名称，动态去生成 locales/zh-CN.ts 对照文件？`<br/>
    `这样就完全不改变项目结构，新老项目都可以自动生成`

   * 借助nodejs的fs和 path 

        >1：读取page文件夹下所有以.tsx文件，导出路径数组<br/>
        >2：根据文件路径读取文件，创建promise<br/>
        >2：读取后转为buffer转为字符串进行正则匹配<br/>
        >3：正则匹配截取 指定的name和label组装成对象<br/>
        >4：promise.all 执行所有读取转换promise<br/>
        >5：promise.all回调中，组装成一个object,并写入到zh-CN.ts<br/>
   
    
        ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1f7ec6f3b124f02b7ead300d8a6865e~tplv-k3u1fbpfcp-watermark.image)
  * 封装
  
	/lcoales/index.js
    ```
    const config = {
      readFolder: './src/pages/',                    // 读取的目标文件夹
      output: '../src/locales/build/cn.ts',          // 输出目录
      suffix: 'tsx',                                 // 指定的文件后缀
      component: ['FormItemEx','LocaleText'],        // 识别的目标组件
      key: 'name',                                   // 国际化的key
      value: 'label',                                // 翻译后的值
    };
    ```

    github地址 ：

    https://github.com/jewool/build_locales

    下载文件夹build_locales  放在项目根目录，配置npm脚本  
	修改config<br/>
    执行 node ./build_locales/index.js即可

    
### more ：

   > intl.formatMessage({id:'user.login',defaultMessage: '登录',}) 自动生成配置文件？

   >其他框架？
    
    

    

    

    

    










