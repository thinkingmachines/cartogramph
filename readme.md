## Synopsis

CartogramPH was developed as an alternative map visualization tool of the Philippines for anyone to use.
Read more about the project on [our blog](http://stories.thinkingmachin.es/cartogram).

Tweet us at [@thinkdatasci](http://twitter.com/thinkdatasci) with the hashtag #CartogramPH if you use it!

## Supported Cartogram Types


1. Simple Cartogram - Province size is defined by population. 
2. Custom Cartogram - Province size is defined by a custom variable `customColumn` that you set!
3. Chloropleth Cartogram - Province size is defined by population. Heatmap color intensity changes depending on a custom variable `chloroplethColumn` that you set. 


## Code Example

This is the sample code that generates three cartograms in the demo.
```javascript
//defaults
var GEODATA = "data/provinces.json"; //link to the map json source file
var POPULATION = "data/philpopulation.csv"; //link to population data
var POPULATION_COL = "pop2015"; //thematic variable
var POPULATION_LABEL = "Population"; //label

//declare variables
var customDataSource = "data/random.csv"; //link to population data
var customColumn = "poverty2015"; //thematic variable
var customLabel = "Random"; //label of variable

var chloroplethDataSource = "data/philpoverty.csv"; //link to poverty data
var chloroplethColumn = "poverty2015"; //variable you want to map (0-100%)
var chloroplethLabel = "Poverty Rate"; //label of variable

simpleCartogram("#vis","#ef4631");

customCartogram("#vis2",customDataSource,customColumn,customLabel,"#00aac5");

chloroplethCartogram("#vis3",chloroplethDataSource,chloroplethColumn,chloroplethLabel,"#c30202");
```

To make a completely customized cartogram, you can use the makeCartogram function.
```javascript
//defaults
var GEODATA = "data/provinces.json"; //link to the map json source file
var POPULATION = "data/philpopulation.csv"; //link to population data
var POPULATION_COL = "pop2015"; //thematic variable
var POPULATION_LABEL = "Population"; //label

//declare variables
var customDataSource = "data/random.csv"; //link to population data
var customColumn = "poverty2015"; //thematic variable
var customLabel = "Random"; //label of variable

var chloroplethDataSource = "data/philpoverty.csv"; //link to poverty data
var chloroplethColumn = "poverty2015"; //variable you want to map (0-100%)
var chloroplethLabel = "Poverty Rate"; //label of variable

makecartogram(visID,geoData,customDataSource,customColumn,customLabel,chloroplethDataSource,chloroplethColumn,chloroplethLabel,'#ef4631');
```

## Motivation

Making cartograms requires a lot of time, we want to make the process simpler.
Read more about the project on [our blog](http://stories.thinkingmachin.es/cartogram)

## Installation

```javascript
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
<script src="/cartogramph.js"></script>
```

Simply import JQuery, the D3 library, Topojson.js and the cartogramph.js files into your code.

Make sure the paths to the data files are correct before running the server.

## Using Your Own Data

If you're using custom csvs, check the province names to see if the names are in all caps and match the ones in the sample csvs. Check out the example csvs in the data folder (philpopulation.csv, philpoverty.csv, random.csv).

Example:
| province           | poverty2015   |
| ------------------ |:-------------:|
| METROPOLITAN MANILA| 4.8           |
| ABRA               | 32.6          |
| BENGUET            | 6.4           |
| IFUGAO             | 32.8          |
| KALINGA            | 24.2          |

## Contributors

Mika Aldaba - [@hailmika](http://twitter.com/thinkdatasci)

## License

This project is licensed under the terms of the MIT license.