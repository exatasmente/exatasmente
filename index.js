// index.js
const Mustache = require('mustache');
const fs = require('fs');
const https = require('https');
const MUSTACHE_MAIN_DIR = './main.mustache';

Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
let DATA = {
  url : secrets.WAKATIME_URL
 };


function generateReadMe(){
    console.log(process.argv);
  https.get(DATA.url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });


    resp.on('end', () => {
        const json = JSON.parse(data)
        let values = json.data.map((d) => {return {name : d.name, value : d.percent} });
        let maxValue = Math.max.apply(Math, values.map(function(o) { return o.value; }))/25;
        let maxLabel = Math.max.apply(Math, values.map(function(o) { return o.name.length; }));
        let ascii = "";
        values.map((el) => {
          el.value = el.value.toFixed(2);
          if(el.value > 0.0) {
              let div = (el.value * 3) / (maxValue)
              let mod = (el.value * 3) % (maxValue)
              let bar = String.fromCharCode(9619).repeat(div)
              if (mod > 0) {
                  bar += String.fromCharCode(9619)
              }
              ascii += str_rjust(el.name, maxLabel, " ") + " - " + el.value + "% " + bar + "\n"
          }
        });

        generateFile(ascii);


    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
function str_rjust(str, length, char ) {
  var fill = [];
  while ( fill.length + str.length < length ) {
    fill[fill.length] = char;
  }
  return str+ fill.join('');
}

/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
function generateFile(graph) {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const date = new Date();
    const week = date.getWeekNumber();
    const year = date.getFullYear();
    const output = Mustache.render(data.toString(), {
        graph : graph,
        week : week,
        year : year
    });
    fs.writeFileSync('README.md', output);
  });
}
generateReadMe();
