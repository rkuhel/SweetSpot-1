var userKey = "016ff052ff52252d55547e9c73db743a"
$(document).ready(function() {
  $.getJSON("http://query.yahooapis.com/v1/public/yql", {
      q: "select * from json where url=\"http://api.crunchbase.com/v/2/organizations?user_key=" + userKey + "&page=1&order=updated_at+DESC\"",
      //callback: gotJSON, // you don't even need this line if your browser supports CORS
      format: "json"
    },
    function(data) {
      if (data.query.results) {
        console.log(data.query.results.json.data);
        $.each(data.query.results.json.data.items, function(index, value) {
          var companyPath = value.path.split("/")[1]
          getFundingRoundUUID(companyPath, {
            companyName: value.name,
            moneyRaised: null,
            announcedDate: null,
            series: null
          });
          //$('div.startups').append("<div>"+value.name+"</div>")
          return index < 1;
        })
      } else {
        console.log("nothing")
      }
    }
  );
  // getFundingRoundUUID("tapcommerce", {
  //   companyName: "tapcommerce",
  //   moneyRaised: null,
  //   announcedDate: null,
  //   series: null
  // })
});

function getFundingRoundUUID(path, companyObject) {
  $.getJSON("http://query.yahooapis.com/v1/public/yql", {
      q: "select * from json where url=\"http://api.crunchbase.com/v/2/organization/" + path + "?user_key=" + userKey + "\"",
      //callback: gotJSON, // you don't even need this line if your browser supports CORS
      format: "json"
    },
    function(data) {
      if (data.query.results) {
        console.log(data.query.results.json.data);
        if ("funding_rounds" in data.query.results.json.data.relationships) {
          if (data.query.results.json.data.relationships.funding_rounds.items instanceof Array) {
            $.each(data.query.results.json.data.relationships.funding_rounds.items, function(index, value) {
              console.log(value.path)
              var uuid = value.path.split("/")[1];
              getFundingRound(uuid, companyObject);
            })
          } else {
            var uuid = data.query.results.json.data.relationships.funding_rounds.items.path.split("/")[1]
            getFundingRound(uuid, companyObject);
          }
        }
      } else {
        console.log("nothing")
      }
    }
  );
}

function getFundingRound(uuid, companyObject) {
  $.getJSON("http://query.yahooapis.com/v1/public/yql", {
      q: "select * from json where url=\"http://api.crunchbase.com/v/2/funding-round/" + uuid + "?user_key=" + userKey + "\"",
      //callback: gotJSON, // you don't even need this line if your browser supports CORS
      format: "json"
    },
    function(data) {
      if (data.query.results) {
        console.log(data.query.results.json.data);
        if ("money_raised_usd" in data.query.results.json.data.properties) {
          companyObject.moneyRaised = data.query.results.json.data.properties.money_raised_usd;
        }
        if ("announced_on_year" in data.query.results.json.data.properties) {
          companyObject.annoucedDate = data.query.results.json.data.properties.announced_on_year;
        }
        if ("series" in data.query.results.json.data.properties) {
          companyObject.series = data.query.results.json.data.properties.series;
        } else if("funding_type" in data.query.results.json.data.properties){
          companyObject.series = data.query.results.json.data.properties.funding_type;
        }
        $("div.startups").append("<div>" + companyObject.companyName + " - " + "Series:" + companyObject.series + "\n Date:" +
          companyObject.annoucedDate + "\nRaised:" + companyObject.moneyRaised + "</div>");
      } else {
        console.log("nothing")
      }
    }
  );
}