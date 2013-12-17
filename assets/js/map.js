  // Set height and width of map window.
  var width = 960,
      height = 500;

  // Use mercator projection for map.
  var projection = d3.geo.mercator()
      .center([0, 15])
      .scale(128)
      .translate([width / 2, height / 2])
      .precision(.1);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Read in countries and names.
  d3.json("/map_jsons/world-110m.json", function(error, world) {
    d3.tsv("/data/world-country-names.tsv",function(error, names){

    var land = topojson.feature(world, world.objects.land),
        countries = topojson.feature(world, world.objects.countries).features,
        borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
        i = -1,
        n = countries.length;

    // Add country name to each country.
    countries = countries.filter(function(d) {
      return names.some(function(n) {
        if (d.id == n.id) return d.name = n.name;
      });
    }).sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });


    //plotting the countries. coloring them all grey for now
    countryPlots = svg.append("g")
        .attr("class","countryList")
        .selectAll("g")
        .data(countries)
      .enter()
        .insert("path")
        .attr("class","country")
        .attr("d",path)
        .attr("countryName",function(d) { return d.name})
        .attr("fill","grey");

    // loading in user data json
    d3.json("/data/bbs_data.json",function(error,data) {


    // plot my data
    //create array of my listings traveled to
    var my_destinations = [];
    data.my_trips.forEach(function(d) {
      d.forEach(function(d2){
        my_destinations.push(d2)
      })
    })

    //plot listings i've traveled to
    var my_destinations_points = svg.append("g")
        .attr("class","my_trips")
        .selectAll("g")
        .data(my_destinations)
      .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + projection([data.listings[d].lng,data.listings[d].lat]) + ")"; })
        .append("circle")
        .attr("r",2)
        .style("fill","#e377c2")
        .style("z-index",10);

    //create linestrings for segments
    var my_trips = []

    data.my_trips.forEach(function(d){
      if(d.length > 1) {
        var coordinates = [[]]
        var lat1, lng1, lat2, lng2
        d.forEach(function(d2,i){

          lat2 = data.listings[d2].lat
          lng2 = data.listings[d2].lng
          if(i>0) {

            coordinates.push(x)

          }
          lat1 = lat2
          lng1 = lng2
          x = [lng1,lat1],[lng2,lat2]
        })
        my_trips.push(coordinates.filter(function(d,i){return i > 0}))
      }
    })

    var my_route = []
    my_trips.forEach(function(d){
      tmp_route = {"type":"LineString",
      "coordinates":d}
      my_route.push(tmp_route)
    })

   my_route_plotted = svg.append("g")
        .attr("class","personal_points")
        .selectAll("g")
        .data(my_route)
      .enter()
        .append("path")
        .attr("d",path)
        .attr("class","route")

    // plot friends trips
    var friends_destinations = [];
      friends_trips = []
      friends_routes = []
      for (var key in data.friends_trips) {
           data.friends_trips[key].trips.forEach(function(d){
             friends_routes.push(d)
             d.forEach(function(d2){
                friends_trips.push(d2)
             })
           })
         }

    var friends_destinations_points = svg.append("g")
        .attr("class","friends_trips")
        .selectAll("g")
        .data(friends_trips)
      .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + projection([data.listings[d].lng,data.listings[d].lat]) + ")"; });

    friends_destinations_points.append("circle")
        .attr("r",1)
        .style("fill","green")
        .style("z-index",1)

    var my_friends_trips = []

    friends_routes.forEach(function(d){
      if(d.length > 1) {
        var coordinates = [[]]
        var lat1, lng1, lat2, lng2
        d.forEach(function(d2,i){

          lat2 = data.listings[d2].lat
          lng2 = data.listings[d2].lng
          if(i>0) {

            coordinates.push(x)

          }
          lat1 = lat2
          lng1 = lng2
          x = [lng1,lat1],[lng2,lat2]
        })
        my_friends_trips.push(coordinates.filter(function(d,i){return i > 0}))
      }
    })

    var my_friends_route = []
    my_friends_trips.forEach(function(d){
      tmp_route = {"type":"LineString",
      "coordinates":d}
      my_friends_trips.push(tmp_route)
    })

    my_route_plotted = svg.append("g")
        .attr("class","friend_routes")
        .selectAll("g")
        .data(my_friends_trips)
      .enter()
        .append("path")
        .attr("d",path)
        .attr("class","route")
        .style("stroke","green")

    // add in some nice border lines
    svg.insert("path", ".graticule")
     .datum(borders)
     .attr("class", "boundary")
     .attr("d", path);

    });
  });
});

d3.select(self.frameElement).style("height", height + "px");