const localUtils = require('./localeFs.js');
const folderUtils = require('./folder.js');
const config = {
  readFolder: './src/pages/',                    // 读取的目标文件夹
  output: '../src/locales/build/cn.ts',          // 输出目录
  suffix: 'tsx',                                 // 指定的文件后缀
  component: ['FormItemEx','LocaleText'],        // 识别的目标目录
  key: 'name',                                   // 国际化的key
  value: 'label',                                // 翻译后的值
};
const execFun = async ()=>{
  let startData = new Date()
  // 获取项目所有的jsx路径
  const AllPath = await folderUtils.getProjectAllTSXFile(config);
  const TotalObj = {};
// 根据每一个文件路径，获取{key:value,key:value},组成一个promise数组
  const promiseArray = AllPath.map((path) => {
    return localUtils.getFileLocalesObj(path, config);
  });
// 读取所有的文件，生成一个对象，并写入文件
  Promise.all(promiseArray)
    .then((res) => {
      const filteredList = res.filter((item) => {
        return JSON.stringify(item) != '{}';
      });
      filteredList.forEach((item) => {
        Object.keys(item).forEach((key) => {
          TotalObj[key] = item[key];
        });
      });
      console.log(`>>>>>>开始写入文件：${(new Date() - startData)}ms`)
      localUtils.writeToFilePath(TotalObj,config.output);
    })
    .then(reject=>{
      console.log(reject);
    })
    .catch((err) => {
      console.log(err);
    });
}

execFun()
