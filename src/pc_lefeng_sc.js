var fs = require('fs')
var cheerio = require("cheerio")
var helper = require('../helpers/webhelper.js')
var entity = require('../models/entity.js')
var url = require('url')

var lefeng = function(){
    this.resultDir = "../result/";
    this.dataDir = "../appdata/";
    this.categoryFile = "lefengCategories.txt";
    this.brandFile = "lefengBrands.txt";
    this.resultFile = "pc_lefeng_sc.txt";
    //this.doneFile = "";
    this.categories = [];
    this.brands = {};
    this.brandDictTree = {};
}

lefeng.prototype.start = function(){
    this.init();
    this.wgetList();
}

lefeng.prototype.init = function(){
    this.categories = fs.readFileSync(this.dataDir + this.categoryFile).toString().split("\n").map(function(line){
	var vals = line.split(",");
	return {name:vals[1],url:vals[0]};
    });


}

lefeng.prototype.load = function(){
    
}

lefeng.prototype.wgetList = function(){
    if(this.categories.length==0){
	console.log("job done");
	return;
    }
    var cur = null;
    while(!cur && this.categories.length>0){
	cur = this.categories.shift();
    }
    cur.pageIdx = 1;
    var urlObj = url.parse(cur.url,true);
    var opt = new helper.basic_options(urlObj.host,urlObj.pathname,'GET',false,false,urlObj.query);
    helper.request_data(opt,null,function(data,args){
	that.processList(data,args);
    },cur);
}

lefeng.prototype.wgetDetail = function(){
    
}
lefeng.prototype.processList = function(data,args){
    if(!data){
	console.log("data empty");
    }
    var $ = cheerio.load(data);
    $("div.pruwrap").each(function(){
	var id = $(this).attr("id");
	var title = $("dd.nam a",this).attr("title");
	var price = $("dd.pri img",this).attr("src") || $("dd.pri img",this).attr("src2");
	var mktPrice = $("dd.pri del.spri",this).text() || -1;
	var result = [new Date().toLocaleDateString(),"美妆",title,id,mktPrice,price,new Date().toLocaleDateString(),new Date().toLocaleDateString()];
	//console.log(title);
	fs.appendFile(that.resultDir+that.resultFile,result.join()+"\n");
    });

    if(!args[0].pageCount){
	args[0].pageCount = Number($("div.pages span a").last().prev().text());
    }
    if(args[0].pageIdx<args[0].pageCount){
	var urlObj = url.parse(args[0].url);
	var categoryId = urlObj && urlObj.pathname && urlObj.pathname.replace();
	var opt = new helper.basic_options(urlObj.host,urlObj.pathname+"_0_0_0_0_0_0_"+args[0].pageIdx,'GET',false,false,urlObj.query);

    }else{
	setTimeout(function(){
	    that.wgetList();
	},0);
    }
    console.log("%s,%s",args[0].name,args[0].pageIdx);
}

var instance = new lefeng();
var that = instance;
instance.start();
