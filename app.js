var request = require('request'),
    cheerio = require('cheerio'),
    express = require('express'),
    allLinks = [];

var MongoClient = require('mongodb').MongoClient;

var app = express();
    

app.use(express.static(__dirname));

app.get('/getNews', function(req, res){
    
    request('http://timesofindia.indiatimes.com/',function(err, resp, body){
        if(!err && resp.statusCode == 200){
            var $ = cheerio.load(body);
            console.log("got site");
            MongoClient.connect('mongodb://localhost:27017/newsdb', function(err, db) {
                console.log("Connected correctly to servernew");
                //add old flag to all stories
                db.collection('news').update({},{$set : {"newsType":1}},false,true);
                //add old flag to all stories
                $('.top-story a').each(function(){

                    var link = $(this).attr('href');
                    var title = $(this).attr('title');

                    if(title != undefined){

                        if(link.includes('timesofindia.indiatimes.com'))
                            link = link.split("timesofindia.indiatimes.com")[1];

                        var row = {
                            site:'http://timesofindia.indiatimes.com',
                            url:link,
                            savedOn: new Date(),
                            title:title,
                            newsType:0
                        };

                        //db.collection('news').deleteOne({url:link});
                        allLinks.push(row);
                    }
                });
                res.json(allLinks);
            
                db.collection('news').insertMany(allLinks);
                db.close();
            });
        }
    });
});

app.get('/oldNews', function(req, res){

    MongoClient.connect('mongodb://localhost:27017/newsdb', function(err, db) {

        console.log("Connected correctly to server");

        var news = db.collection('news');

        news.find().toArray(function(err, docs){
            if(err) throw err;
            //console.log(docs);
            res.json(docs);
        });
     
      db.close();
    });

    

});

app.listen(3000);

console.log("running....");