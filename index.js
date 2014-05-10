var userKey = "016ff052ff52252d55547e9c73db743a"
$(document).ready(function() {
  // $.getJSON("http://query.yahooapis.com/v1/public/yql", {
  //     q: "select * from json where url=\"http://api.crunchbase.com/v/2/organizations?user_key=" + userKey + "&page=1&order=updated_at+DESC\"",
  //     //callback: gotJSON, // you don't even need this line if your browser supports CORS
  //     format: "json"
  //   },
  //   function(data) {
  //     if (data.query.results) {
  //       console.log(data.query.results.json.data);
  //       $.each(data.query.results.json.data.items, function(index, value) {
  //         var companyPath = value.path.split("/")[1]
  //         getFundingRoundUUID(companyPath, {
  //           companyName: value.name,
  //           fundingRounds:[]
  //         });
  //         //$('div.startups').append("<div>"+value.name+"</div>")
  //         return index < 50;
  //       })
  //     } else {
  //       console.log("nothing")
  //     }
  //   }
  // );
  getFundingRoundUUID("hublished", {
    companyName: "hublished",
    fundingRounds: []
  })
});

function getFundingRoundUUID(path, companyObject) {
  var deferred = []
  $.getJSON("http://query.yahooapis.com/v1/public/yql", {
      q: "select * from json where url=\"http://api.crunchbase.com/v/2/organization/" + path + "?user_key=" + userKey + "\"",
      //callback: gotJSON, // you don't even need this line if your browser supports CORS
      format: "json"
    },
    function(data,status) {
      if (data.query.results) {
        console.log(data.query.results.json.data);
        if ("funding_rounds" in data.query.results.json.data.relationships) {
          if (data.query.results.json.data.relationships.funding_rounds.items instanceof Array) {
            $.each(data.query.results.json.data.relationships.funding_rounds.items, function(index, value) {
              console.log(value.path)
              var uuid = value.path.split("/")[1];
              var fundingRound = getFundingRound(uuid);
              deferred.push(fundingRound)
              fundingRound.then(function(round){
                companyObject.fundingRounds.push(round);
              })
              //deferred.push(fundingRound);
              // $.when(getFundingRound(uuid)).then(
              //   function(fundingRound, status) {
              //     console.log(fundingRound)
              //     companyObject.fundingRounds.push(fundingRound);
              //   });
            })
          } else {
            var uuid = data.query.results.json.data.relationships.funding_rounds.items.path.split("/")[1]
            $.when(getFundingRound(uuid)).then(
              function(fundingRound, status) {
                companyObject.fundingRounds.push(fundingRound);
              });
          }
          $.when.apply($, deferred).then(function(fundingRound) {
            console.log("showing")
            filterAndShow(companyObject);
          })
        }
      } else {
        console.log(status)
      }
    }
  );
}

function getFundingRound(uuid) {

  var fundingRound
  var promise = $.Deferred();
  var defer = $.getJSON("http://query.yahooapis.com/v1/public/yql", {
    q: "select * from json where url=\"http://api.crunchbase.com/v/2/funding-round/" + uuid + "?user_key=" + userKey + "\"",
    //callback: gotJSON, // you don't even need this line if your browser supports CORS
    format: "json"
  });
  defer.success(function(data,status) {
    if (data.query.results) {
      fundingRound = {
        moneyRaised: null,
        announcedDate: null,
        series: null
      }
      if ("money_raised_usd" in data.query.results.json.data.properties) {
        fundingRound.moneyRaised = data.query.results.json.data.properties.money_raised_usd;
      }
      if ("announced_on_year" in data.query.results.json.data.properties) {
        fundingRound.announcedDate = data.query.results.json.data.properties.announced_on_year;
      }
      if ("series" in data.query.results.json.data.properties && data.query.results.json.data.properties.series != "null") {
        fundingRound.series = data.query.results.json.data.properties.series;
      } else if ("funding_type" in data.query.results.json.data.properties) {
        fundingRound.series = data.query.results.json.data.properties.funding_type;
      }
      promise.resolve(fundingRound);
    } else {
      console.log(status)
      console.log(data)
    }
  });
  return promise;
}

function filterAndShow(companyObject) {
  console.log("filter")
  var totalFunding = 0;
  var indexOfTop = -1;
  for (var i = 0; i < companyObject.fundingRounds.length; i++) {
    if(companyObject.fundingRounds[i].moneyRaised != null){
      if(indexOfTop == -1) {
        indexOfTop = i;
      }
      totalFunding += parseInt(companyObject.fundingRounds[i].moneyRaised);
      if(parseInt(companyObject.fundingRounds[i].moneyRaised)> parseInt(companyObject.fundingRounds[indexOfTop].moneyRaised)){
        indexOfTop = i;
      }
    }
    if (!(companyObject.fundingRounds[i].announcedDate == "2011" || companyObject.fundingRounds[i].announcedDate == "2012" ||
      companyObject.fundingRounds[i].announcedDate == "2013" || companyObject.fundingRounds[i].announcedDate == "2014")) {
      console.log("returning false" )
      return false;
    }
  }
  console.log(totalFunding)
  console.log(indexOfTop)
  if(indexOfTop == -1) {
    return false;
  }
  if (totalFunding > 100000 && totalFunding < 1000000) {
    $("div.startups").append("<div>" + companyObject.companyName + " - " + "Series:" + companyObject.fundingRounds[indexOfTop].series + "\n Date:" +
      companyObject.fundingRounds[indexOfTop].announcedDate + "\nRaised:" + companyObject.fundingRounds[indexOfTop].moneyRaised + "</div>");
  }
}