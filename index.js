const dbPixelArt = require('@dicebear/pixel-art')
const dbAvatar = require("@dicebear/avatars")
const config = require('./config.json');
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const axios = require('axios');


app.use(express.static('static')) // static folder serves static files 
app.set('views', './views'); //  Express will look inside of a views folder when resolving the template files
app.set('view engine', 'ejs'); // setting ejs as view engine 

//middleware
app.use(bodyParser.urlencoded({extended:false}));

const matchStyle = (style) => {
  let hp = (style.hat === 'hat' ? 100 : 0);
  let bp = (style.hasBeard === 'no beard') ? 0 : 100;
  let sc = ['variant0'+ Math.floor(Math.random() * 7)];
  if (style.skinColor !== undefined){
    sc = ['variant' + style.skinColor];
  }

  let mouth = style.mouth !== undefined ?
      [style.mouth +'0'+Math.floor(Math.random() * 8)] : ['happy0'+Math.floor(Math.random() * 8)];

  let hc = ['variant0'+ Math.floor(Math.random() * 9)]
  if (style.hairColor !== undefined){
    hc = ['variant' + style.hairColor]
  }

  let hs = style.hair !== undefined ?
      [style.hair +0+Math.floor(Math.random() * 12)] :
      [(Math.random()<=0.5 ? 'long':'short')+'0'+Math.floor(Math.random() * 7 + 1)]

  return [hp, bp, sc, mouth, hc, hs]
}

//home page
app.get('/', (req, res) => {
  let rand = Math.floor(Math.random() * 100);

  res.render('index', {
    type: 0,
    rand: rand,
  })

})

//generate avatar
app.get('/avatar', async (req, res) => {
  const style = req.query;
  if (style.submit === 'Random'){
    res.redirect('/')
  }else{
    let [hp, bp, sc, mouth, hc, hs] = matchStyle(style)

    let svg = dbAvatar.createAvatar(dbPixelArt, {
      size:150,
      hairProbability: 100,
      hatProbability: hp,
      beardProbability: bp,
      skinColor: sc,
      mouth: mouth,
      hairColor: hc,
      hair: hs,
    });

      res.render('index', {
        type: 1,
        result: svg,
      })
  }
})

// about page 
app.get('/about', (req, res) => {
  res.render('about')
})

// teams page
app.get('/team', (req, res) => {
  res.render('team')
})

// bored
app.get('/bored', async (req, res) => {
  let result;
  const submit = req.query.submit;
  let participant = (submit === "I'm Bored") ? 1 : 2;

  const options = {
    method: "GET",
    url: `http://www.boredapi.com/api/activity?participants=${participant}`
  }
  
  await axios.request(options)
    .then((response) => {
      result = JSON.parse(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.error(error);
  });

  res.render('bored', {
    config: config,
    activity: result,
  })
});


const port = config.port || 3000;
  app.listen(port, function() {
    console.log(`Express App Started - Port: ${port}`);
});
