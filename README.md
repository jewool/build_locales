
###  web前端-国际化-自动翻译

ant-desing-pro项目，上次完成了[自动识别组件，根据组件属性生成Zh_cn国际化对照文件](https://juejin.im/post/6891187663173337102)之后，又遇到一个问题，		怎么从中文自动翻译成其他语种？

* 最终实现：
  * package.json脚本配置，执行 npm run translate-us 即可自动翻译，并输出到指定目录
    ```
    "local": "node ./build_locales/index.js",
    "translate-us": "node ./build_locales/translate.js us",
    "translate-br": "node ./build_locales/translate.js br",
    "translate-tw": "node ./build_locales/translate.js tw",
    ```

  * 读取zh-CN文件夹所有配置，生成的其他语种文件。

    ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea6b2c561b254d0799fd8130707e00d3~tplv-k3u1fbpfcp-watermark.image)


  * 自定义配置

    ```
    const config = {
      readFolder: './src/locales/zh-CN',                   
      suffix: 'ts',            			 	   
      outPutFolder: {'us':'../src/locales/en-US/build.ts',
                     'br':'../src/locales/pt-BR/build.ts',
                     'tw':'../src/locales/zh-TW/build.ts'},  
      languageKeyMap: {'us':'en','br':'pt','tw':'zh-tw'},   
    };
    ```
    配置说明：  
    * readFolder:读取该目录下的所有配置；
    * suffix：读取文件的后缀
    * outPutFolder：对应语种的输出目录
	* languageKeyMap：package.json 中脚本配置对应的 google-translate-api 语种
		

* 实现原理：

  * 读取 readFolder配置文件夹下面所有指定后缀的文件，如下格式：
    ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab1fd89437714785993fdabb9b670889~tplv-k3u1fbpfcp-watermark.image)
     正则匹配到对应的key,value。
    
  *  将对应的中文，使用 “|” 拼接在一起，调用 [google-translate-api](https://github.com/matheuss/google-translate-api) 进行翻译 
  
  		`用 “|” 拼接翻译是为了防止调用次数过多被google封IP`

  * 将所有翻译结果输出，写入到文件中，写入结果如下。
	![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c6c9253f13d486cbb12e0c0eba10139~tplv-k3u1fbpfcp-watermark.image)
  * 将build.ts 导入 对应的语种文件。
  
* 如何使用：
	
   * https://github.com/jewool/build_locales 下载文件夹，放到ant-design-pro根目录(其他框架可自行改造)
    
   	 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1793dc63af044cbca8975efa059721b7~tplv-k3u1fbpfcp-watermark.image)
  
  * 修改配置
  
  	![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ff3f83af253443c9ed848c96517be28~tplv-k3u1fbpfcp-watermark.image)
  
  * package.json 配置脚本
  
  	![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16486e3ae21342c58f43cbb9ff074291~tplv-k3u1fbpfcp-watermark.image)
 
  * 执行脚本，生成文件
  
  	npm run translate-us<br/>
    npm run translate-br<br/>
    npm run translate-tw<br/>
    
    npm run translate-xxx		<br/>// 其他语种请根据该文件，自行添加配置
  
 	 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d61cca1c41c4af89892a6e9b542985a~tplv-k3u1fbpfcp-watermark.image)
     
  
  链接：
  
  [脚本地址https://github.com/jewool/build_locales](https://github.com/jewool/build_locales)
  
   [根据组件生成中文对照：https://juejin.im/post/6891187663173337102](https://juejin.im/post/6891187663173337102)
 
 	[翻译工具：https://github.com/matheuss/google-translate-api](https://github.com/matheuss/google-translate-api)
 
    

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



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
    
    

    

    

    

    










