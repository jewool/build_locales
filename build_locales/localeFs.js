var fs = require('fs');
const path = require('path');

//写入文件
const writeToFilePath = (info, output) => {
  let time = new Date();
  try {
    let file = path.resolve(__dirname, output);
    const str = `\nexport default ${JSON.stringify(info)}`
    const result = str.replace(/,/g,",\n   ").replace(/{/g,"{\n   ").replace(/}/g,"\n}");
    // 异步写入数据到文件
    fs.writeFile(file, result, { encoding: 'utf8' }, (err) => {
      if (!err){
        console.log(`>>>>>>写入${output}  成功：${new Date()-time }ms`)
      }
    });
  }catch (e) {
    console.log(e)
  }
};
// 根据路径获取文件内容，识别文件内容，根据内容获取到对应的国际化对象
const getFileLocalesObj = (path, config) => {
  return new Promise((resolve,reject) => {
    var buf = new Buffer.alloc(102400000);
    fs.open(path, 'r+', function (err, fd) {
      if (err) {
        resolve({})
      }
      try {
        fs.read(fd, buf, 0, buf.length, 0, function (err, bytes) {
          if (err || bytes == 0) {
            resolve({})
          } else {
            const source = buf.slice(0, bytes).toString(); //转为字符串
            const component = config.component.join('|')
            // const reg = /<(FormItemEx|LocaleText)(.+?)>/ig;
            eval(  `var reg = /<(${component})(.+?)>/ig`);
            let matchs = source.match(reg);
            if (matchs) {
              console.log(`>>>>>>文件路径：${path}\n>>>>>>共${matchs.length}个组件`)
              let result = {}
              matchs.forEach(m => {
                eval(  `var keyReg = /(${config.key}=\'|${config.key}=\")(.*?)(\'|\")/;`);
                eval(  `var valueReg = /(${config.value}=\'|${config.value}=\")(.*?)(\'|\")/;`);
                // const labelReg = /(label=\'|label=\")(.*?)(\'|\")/;
                // let matchName = m.match(/(name=\'|name=\")(.*?)(\'|\")/);
                // let matchLabel = m.match(/(label=\'|label=\")(.*?)(\'|\")/);
                let matchName = m.match(keyReg);
                let matchLabel = m.match(valueReg);
                if (matchName && matchLabel) {
                  result[matchName[2]] = matchLabel[2];
                  resolve(result);
                } else {
                  resolve({});
                }
              })
            }else{
              resolve({});
            }
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }).catch(err=>{
    console.log(JSON.stringify(err));
  });
};

module.exports.writeToFilePath = writeToFilePath;
module.exports.getFileLocalesObj = getFileLocalesObj;
