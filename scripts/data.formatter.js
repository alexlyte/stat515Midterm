var load_csv = require('./csv.loader.js');
var configs = require('./data.config.js');
var promise = require('promise');
var async = require('async-q')

var loadData = function(file){
	return new promise(function(resolve, reject){
		load_csv
		.load(file)
		.then(function(data){
			resolve(data)
		}, function(err){
			reject(err)
		})
	})
}

var convertData = function(data, year){
	var newData = [];
	data.forEach(function(d){
		var props = Object.keys(d);
		props.forEach(function(p){
			if( (p !== 'IOCode') && (p !== 'Name')){
				newData.push({
					'input' : d['Name'],
					'output': p,
					'value' : d[p],
					'year'  : year
				})
			}
		})
	})
	return newData
}


var load_and_convert = function(file, year){
	return new promise(function(resolve, reject){
		loadData(file.path)
		.then(function(data){
			var conv = convertData(data, file.year);
			resolve(conv)			
		}, function(err){
			reject(err)			
		})
	})
}






exports.load_and_convert_all = function(){
	return new promise(function(resolve, reject){
		try{
			async
			.map(configs.data.import.files,load_and_convert)
			.then(function(results) {
			  var newdataset = [];
			  results.forEach(function(dataset){
			  	dataset.forEach(function(datapoint){
			  		newdataset.push(datapoint) 
			  	})
			  })
			  resolve(newdataset)
			})
			.done();		
		} catch(e){
			reject(e)
		}
	})
}



exports
.load_and_convert_all()
.then(function(fulldata){
	load_csv
	.write(fulldata, configs.data.export.path)
	.then(function(good){
		console.log(good)
	}, function(bad){
		console.log(bad)
	})
})




