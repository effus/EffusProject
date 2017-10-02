/**
 * EFFUS REQUIRE JS
 * I think that requirejs.org is bullshit, so I create my own loader with blackjack and ... well, you know.
 * Native JS. And you can load jQuery without conflicts :)
 * v.0.1, 2016, GPL

Including in HTML:

<script src="/assets/js/effus.require.js"></script>
<script>
    requirejs({
        project:'MyProject',
        configSrc:'/assets/js/require.json',
        nocache:false
    }, function(){
        // ...callback when all scripts included...
    });
</script>

Required file: "require.json"

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

*/
var _requirejs = {
  opts: null,
  JSON: null,
  Utils: {
    loadJSON: function(url, callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', url + (_requirejs.opts.nocache ? '?' + (new Date().getTime()) :
        ''), true);
      xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && (xobj.status == "200" || xobj.status ==
            "304")) {
          callback(xobj.responseText);
        }
        if (xobj.status == "404") {
          throw Error('effus requirejs config file not loaded');
        }
      };
      xobj.send(null);
    },
    appendScript: function(url, callback) {
      var script = document.createElement('script');
      script.src = url + (_requirejs.opts.nocache ? '?' + (new Date().getTime()) :
        '');
      script.onload = callback;
      script.id = 'script_' + (new Date().getTime());
      document.head.appendChild(script);
    },
    appendCss: function(url) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url + (_requirejs.opts.nocache ? '?' + (new Date().getTime()) :
        '');
      document.head.appendChild(link);
    },
    iterationLoading: function(list, index, callback) {
      //console.log(list, index);
      _requirejs.Utils.appendScript(list[index], function() {
        if (list.length > (parseInt(index) + 1)) {
          _requirejs.Utils.iterationLoading(list, parseInt(index) + 1,
            callback);
        } else {
          callback();
        }
      });
    }
  }
};
var requirejs = function(opts, allLoadedCallback) {
  _requirejs.opts = opts;
  if (typeof _requirejs.opts.project == 'undefined')
    throw Error('Project undefined in effus requirejs init script');
  if (typeof _requirejs.opts.configSrc == 'undefined')
    throw Error('Config source undefined in effus requirejs init script');
  _requirejs.Utils.loadJSON(_requirejs.opts.configSrc, function(json) {
    _requirejs.JSON = JSON.parse(json);
    if (typeof _requirejs.JSON[_requirejs.opts.project] == 'undefined')
      throw Error('There are no such project in config file: ' +
        _requirejs.opts.project);
    var project = _requirejs.JSON[_requirejs.opts.project];
    if (typeof project.app == 'undefined')
      throw Error(
        'Bad config file format: no such property "app" in definition of project ' +
        _requirejs.opts.project);
    if (typeof project.require == 'undefined')
      throw Error(
        'Bad config file format: no such property "require" in definition of project ' +
        _requirejs.opts.project);
    if (typeof project.styles == 'undefined')
      throw Error(
        'Bad config file format: no such property "styles" in definition of project ' +
        _requirejs.opts.project);
    if (project.styles.length) {
      for (var i in project.styles) {
        _requirejs.Utils.appendCss(project.styles[i]);
      }
    }
    if (project.require.length) {
      _requirejs.Utils.iterationLoading(project.require, 0, function() {
        _requirejs.Utils.iterationLoading(project.app, 0, function() {
          if (typeof allLoadedCallback == 'function') {
            allLoadedCallback();
          }
        });
      });
    } else if (project.app.length) {
      _requirejs.Utils.iterationLoading(project.app, 0, function() {
        if (typeof allLoadedCallback == 'function') {
          allLoadedCallback();
        }
      });
    }
  });
};
