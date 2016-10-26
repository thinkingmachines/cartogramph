## Synopsis

CartogramPH was developed as an alternative map visualization tool of the Philippines for anyone to use.
Read more about the project on [our blog](http://stories.thinkingmachin.es/cartogram).

Tweet us at [@thinkdatasci](http://twitter.com/thinkdatasci) with the hashtag #CartogramPH if you use it!

## Supported Cartogram Types


1. Simple Cartogram - Province size is defined by population. 
2. Thematic Cartogram - Province size is defined by a custom variable `thematicColumn` that you set!
3. Sequential Cartogram - Province size is defined by population. Heatmap color intensity changes depending on a custom variable `sequentialColumn` that you set. 


## Code Example

```javascript
//declare variables
var thematicDataSource = "data/random.csv"; //link to population data
var thematicColumn = "poverty2015"; //thematic variable
var thematicLabel = "Random"; //label of variable

var sequentialDataSource = "data/philpoverty2015.csv"; //link to poverty data
var sequentialColumn = "poverty2015"; //variable you want to map (0-100%)
var sequentialLabel = "Poverty Rate"; //label of variable

//Make a default population-based cartogram 
simpleCartogram("#vis","#ef4631");

//Make a cartogram using a different thematic variable
thematicCartogram("#vis2",thematicDataSource,thematicColumn,thematicLabel,"#00aac5");

//Make a chloropleth cartogram
sequentialCartogram("#vis3",sequentialDataSource,sequentialColumn,sequentialLabel,"#c30202");
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

If you're using custom csvs, check the province names to see if the names are in all caps and match the ones in the sample csvs.

## Contributors

Mika Aldaba - [@hailmika](http://twitter.com/thinkdatasci)

## License

This project is licensed under the terms of the MIT license.