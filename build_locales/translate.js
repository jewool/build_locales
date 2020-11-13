const localUtils = require('./localeFs.js');
const folderUtils = require('./folder.js');
const translate = require('../build_locales/translate/src/index.js')
const config = {
  readFolder: './src/locales/zh-CN',                    // 读取的目标文件夹
  outPutFolder: {'us':'../src/locales/en-US/build.ts','br':'../src/locales/pt-BR/build.ts','tw':'../src/locales/zh-TW/build.ts'},// 对照文件地址映射
  languageKeyMap: {'us':'en','br':'pt','tw':'zh-tw'},     // 语种key映射
  suffix: 'ts',                                         // 指定的文件后缀
};


const execFun = async ()=>{
  let startData = new Date()
  // 获取项目所有的jsx路径
  const AllPath = await folderUtils.getProjectAllTSXFile(config);
  const TotalObj = {};
  // 根据每一个文件路径，获取{key:value,key:value},组成一个promise数组
  const promiseArray = AllPath.map((path) => {
    return localUtils.getFileLocalesContent(path, config);
  });
  // 读取所有的文件，生成一个对象，并写入文件
  Promise.all(promiseArray)
    .then((res) => {
      let result  =  res.reduce(function (total,curr){
        return  total.concat(curr)
      },[]);
      let taskArray = getPartTransFun(result);
      let promiseArray = taskArray.map((item,index)=>{
        return  doTranslate(item.data,item.chart);
      })
      Promise.all(promiseArray).then(transRes=>{
        let outPutFileArrayResult = [];
        transRes.forEach(item=>{
          outPutFileArrayResult = [...outPutFileArrayResult,...item]
        })
        let outPutFileObjectResult = {};
        outPutFileArrayResult.forEach(item=>{
          outPutFileObjectResult = {...outPutFileObjectResult,...item}
        })
        console.log(outPutFileObjectResult);
        localUtils.writeToFilePath(outPutFileObjectResult,config.outPutFolder[process.argv[2]]);
        // console.log(outPutFileObjectResult);
      })
    })
    .then(reject=>{
      // console.log(reject);
    })
    .catch((err) => {
      // console.log(err);
    });
}


const getPartTransFun =  (array)=>{
  let currentArray = [];
  let translateChart = ""
  let promiseTaskArray = [];
  try {
    array.forEach(item=>{
      if (translateChart.length>=100){
        translateChart = translateChart+'|'+item[Object.getOwnPropertyNames(item)[0]];
        currentArray.push(item);
        promiseTaskArray.push({data:currentArray,chart:translateChart})
        currentArray = [];
        translateChart = "";
      }else{
        translateChart = translateChart+'|'+item[Object.getOwnPropertyNames(item)[0]];
        currentArray.push(item)
      }
    })
    return promiseTaskArray;
  }catch (e) {
    // console.log(e)
  }
}

// 获取翻译结果
const doTranslate = (partArray,translateChart)=>{
  return new Promise(resolve => {
    translate(translateChart,{form:'zh-cn',to:config.languageKeyMap[process.argv[2]]}).then(res=>{
        const data = res.text.split('|').filter(item=>{ return item });
        const  array =  partArray.map((item,index)=>{
          const format = item;
          format[Object.getOwnPropertyNames(format)[0]] = data[index];
          return format;
        })
      resolve(array);
    })
  })
}

execFun()
