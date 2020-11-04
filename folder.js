var path = require("path");
var fs = require('fs');
var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);

function promisify(fn) {
  return function() {
    const args = arguments;
    return new Promise(function(resolve, reject) {
      [].push.call(args, function(err, result) {
        if(err) {
          console.log(err)
          reject(err);
        }else {
          resolve(result);
        }
      });
      fn.apply(null, args);
    });
  }
}

function readDirRecur(file,suffix,callback) {
  return readdir(file).then((files) => {
    files = files.map((item) => {
      const fullPath = file + '/' + item;
      return stat(fullPath).then((stats) => {
          if (stats.isDirectory()) {
              return readDirRecur(fullPath,suffix,callback);
          } else {
            if(item[0] == '.'||item.indexOf(suffix)==-1){
            } else {
              callback && callback(fullPath)
            }
          }
        })
    });
    return Promise.all(files);
  });
}


const getProjectAllTSXFile = (config)=>{
    const fileList = []
    const timeStart = new Date()
    const filePath = path.resolve(config.readFolder)
    console.log(`>>>>>>开始读取：${config.readFolder}`);
    return new Promise(resolve=>{
        readDirRecur(filePath,config.suffix,function(filePath) {
            fileList.push(filePath)
          }).then(function() {
          console.log(`>>>>>>读取完成：共${fileList.length}个文件，${new Date() - timeStart}ms `);
            resolve(fileList);
          }).catch(function(err) {
            console.log("ERRRRR:>>>>>"+err);
          });
    })
}
module.exports.getProjectAllTSXFile = getProjectAllTSXFile;
