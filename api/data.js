var request = require("request")
var JSONStream = require('JSONStream')

var dotenv = require('dotenv');


dotenv.config();



/* GET home page. */
module.exports = (req, res) => {
  console.log("new request")
  res.setHeader("Access-Control-Allow-Origin", "*");
  var tokenRequestOptions = {
    method: 'POST',
    url: process.env.POLE_EMPLOI_URL_TOKEN,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      grant_type: 'client_credentials',
      client_id: process.env.POLE_EMPLOI_CLIENT_ID,
      client_secret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      scope: process.env.POLE_EMPLOI_SCOPE
    }
  };
  var index = 0;
  var stream = JSONStream.parse(['resultats', true]);
  stream.on('data', function (data) {
    var lieuTravail = data.lieuTravail
    var entreprise = data.entreprise
    if(entreprise && entreprise.nom){
      data.intitule=data.intitule+' - '+entreprise.nom
    }
    if (lieuTravail.longitude && lieuTravail.latitude && data.intitule && data.origineOffre.urlOrigine) {
      var lngLat = [];
      lngLat.push(lieuTravail.longitude)
      lngLat.push(lieuTravail.latitude)
      var pos = { COORDINATES: lngLat, intitule:data.intitule, url: data.origineOffre.urlOrigine };
      res.write(((index === 0) ? '[' : ',') + JSON.stringify(pos));
      index++
    }
  });
  stream.on('end', function () {
    console.log("ending response")
    res.write(']');
    res.end();
  });

  request(tokenRequestOptions, function (error, response, body) {
    if (error) throw new Error(error);
    var token = JSON.parse(body).access_token;
    request.get({url:process.env.POLE_EMPLOI_OFFRES, qs:req.query}).auth(null, null, true, token).pipe(stream)
  })

};

