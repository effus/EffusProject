# EffusProject Tools
Some usefull JavaScrips

## effus.require.js
I think that requirejs.org is bullshit, so I create my own loader with blackjack and ... well, you know.

Native JS. And you can load jQuery without conflicts :)

**Example**
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

## parallax.js
Some figure you want to move with own speed while scrolling
```
<img class="scroll-handle" src="images/g4170.png" data-x="0" data-y="30" />
<script src="js/parallax.js"></script>
<script>
// if you want to reinit effect points
ScrollEffect.startY = 500;
ScrollEffect.endY = 600;
</script>
```

data-x="0" - means your figure doesn't move by horisontal

data-y="30" - means your figure move by vertical with 30 pixels during effect is active

<a href="https://github.com/effus/frontend-tools/"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat" alt="License"></a>
