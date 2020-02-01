var communes = require('../data/communes.json')
module.exports = (req, res) => {
    var reqCommune = req.query.commune
    const regex = new RegExp('^'+reqCommune, 'gi')
    var matches = communes.filter(commune => { return commune.libelle.match(regex) || commune.codePostal == reqCommune })
    res.send(matches);
};