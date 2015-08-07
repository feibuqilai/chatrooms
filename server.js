var http = require('http');//内置的http模块提供了http服务器和客户端功能
var fs = require('fs');//文件模块
var path = require('path');//路径模块
var mime = require('mime');//mime模块，有根据文件扩展名得出mime类型的能力
var cache = {};//缓存文件内容的对象

//发送文件数据及错误响应

//1.请求文件不存在时发送404错误
function send404(response){
	response.writeHead(404,{'content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}


//2.提供文件数据服务
function sendFile(response,filePath,fileContents){
	response.writeHead(200,{'content-Type': mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}


//3.提供静态文件服务
function serverStatic(response,cache,absPath){
	if (cache[absPath]) {                                    //检查文件是否存在于内存中
		sendFile(response,absPath,cache[absPath]);           //存在则从内存中返回文件
	} else {
		fs.exists(absPath,function(exists) {                 //检查文件是否存在
			if (exists) {
				fs.readFile(absPath,function(err,data) {     //从硬盘中读取文件
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;                //从硬盘中读取文件并返回
						sendFile(response,absPath,data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}


//创建http服务器

//1.逻辑
var server = http.createServer(function(request,response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serverStatic(response,cache,absPath);
});



//2.启动
server.listen(3000,function() {
	console.log("server listening on port 3000");
});



//设置Socket.IO服务器
var chatServer = require('./lib/chat_server');
chatServer.listen(server);