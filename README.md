# EffusProject Tools
Some usefull JavaScrips

## effus.require.js
I think that requirejs.org is bullshit, so I create my own loader with blackjack and ... well, you know.

Native JS. And you can load jQuery without conflicts :)

**Including**
```
<script src="effus.require.js"></script>
<script>
    requirejs({
        project:'MyProject',
        configSrc:'require.json',
        nocache:false
    }, function(){
        // ...callback when all scripts included...
    });
</script>
```
Create file *require.json*
```
{
  "MyProject" : {
    "require" : [
      "/assets/js/vendors/jquery.min.js",
      "/assets/js/vendors/lodash.min.js",
      "/assets/js/vendors/backbone-min.js",
      "/assets/js/vendors/joint.min.js"
    ],
    "app" : [
      "/assets/js/app/diagram.js"
    ],
    "styles" : [
      "/assets/css/diagram.css",
      "/assets/css/joint.min.css"
    ]
  }
}
```

<a href="https://github.com/effus/frontend-tools/"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat" alt="License"></a>
